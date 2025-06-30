"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { DatabaseClient } from "@/database/DatabaseClient"
import { DatabaseGet } from "@/database/DatabaseGet"
import { DatabasePost } from "@/database/DatabasePost"
import { DatabasePut } from "@/database/DatabasePut"
import { DatabaseDelete } from "@/database/DatabaseDelete"
import { createTrainingRecord } from "./action"
import { addWeeks, format, startOfWeek, addDays } from "date-fns"
import type {
  CreateRecurringTrainingData,
  UpdateRecurringTrainingData,
  RecurringTrainingWithStats,
  ProcessingResult,
} from "@/types/recurring-training"

const dbClient = DatabaseClient.getInstance()
const dbGet = new DatabaseGet(dbClient)
const dbPost = new DatabasePost(dbClient)
const dbPut = new DatabasePut(dbClient)
const dbDelete = new DatabaseDelete(dbClient)

export async function createRecurringTraining(data: CreateRecurringTrainingData): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized")
  }

  const id = `recurring-training-${Date.now()}`

  await dbPost.recurringTraining({
    ...data,
    id,
    createdBy: session.user.id!,
  })

  return id
}

export async function getRecurringTrainings(): Promise<RecurringTrainingWithStats[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized")
  }

  return await dbGet.recurringTrainings()
}

export async function updateRecurringTraining(id: string, data: UpdateRecurringTrainingData): Promise<void> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized")
  }

  await dbPut.recurringTraining(id, data)
}

export async function deleteRecurringTraining(id: string): Promise<void> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized")
  }

  // Delete all instances first, then the recurring training
  await dbDelete.recurringTrainingInstances(id)
  await dbDelete.recurringTraining(id)
}

export async function processRecurringTrainings(): Promise<ProcessingResult[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized")
  }

  const recurringTrainings = await dbGet.activeRecurringTrainings()
  const results: ProcessingResult[] = []

  for (const recurring of recurringTrainings) {
    try {
      // Calculate next training date (1 week from now)
      const nextWeek = addWeeks(new Date(), 1)
      const startOfNextWeek = startOfWeek(nextWeek, { weekStartsOn: 0 }) // Sunday = 0
      const trainingDate = addDays(startOfNextWeek, recurring.day_of_week)
      const trainingDateStr = format(trainingDate, "yyyy-MM-dd")

      // Check if we already created a training for this date
      const instanceExists = await dbGet.recurringTrainingInstanceExists(recurring.id, trainingDateStr)
      if (instanceExists) {
        continue // Already created for this date
      }

      // Check for mission conflicts on this date
      const missionConflicts = await dbGet.missionConflictsOnDate(trainingDateStr)

      let finalDate = trainingDateStr
      let conflictResolved = false

      // If there's a conflict, try the next week
      if (missionConflicts.length > 0) {
        const nextWeekDate = addWeeks(trainingDate, 1)
        const nextWeekDateStr = format(nextWeekDate, "yyyy-MM-dd")

        const nextWeekConflicts = await dbGet.missionConflictsOnDate(nextWeekDateStr)

        if (nextWeekConflicts.length === 0) {
          finalDate = nextWeekDateStr
          conflictResolved = true
        }
      } else {
        conflictResolved = true
      }

      if (!conflictResolved) {
        results.push({
          recurringId: recurring.id,
          name: recurring.name,
          status: "skipped",
          reason: "Mission conflicts on both weeks",
        })
        continue
      }

      // Create the training record using the existing function
      const trainingData = {
        name: recurring.name,
        description: recurring.description,
        date: finalDate,
        time: recurring.time,
        location: recurring.location,
        instructor: recurring.instructor,
        maxPersonnel: recurring.max_personnel,
      }

      await createTrainingRecord(trainingData)

      // Get the created training ID
      const createdTraining = await dbGet.trainingRecordByDetails(recurring.name, finalDate, recurring.time)

      if (createdTraining) {
        const instanceId = `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Create the instance record
        await dbPost.recurringTrainingInstance({
          id: instanceId,
          recurringTrainingId: recurring.id,
          trainingId: createdTraining.id,
          scheduledDate: finalDate,
        })

        // Update instance count
        await dbPut.recurringTrainingInstanceCount(recurring.id)

        results.push({
          recurringId: recurring.id,
          name: recurring.name,
          trainingId: createdTraining.id,
          scheduledDate: finalDate,
          status: "created",
          rescheduled: finalDate !== trainingDateStr,
        })
      }
    } catch (error) {
      console.error(`Failed to process recurring training ${recurring.id}:`, error)
      results.push({
        recurringId: recurring.id,
        name: recurring.name,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return results
}

export async function getRecurringTrainingInstances(recurringTrainingId: string): Promise<any[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized")
  }

  return await dbGet.recurringTrainingInstances(recurringTrainingId)
}
