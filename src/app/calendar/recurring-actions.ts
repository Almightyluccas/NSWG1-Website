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
      // Process the next 3 weeks for each recurring training
      for (let weekOffset = 1; weekOffset <= 3; weekOffset++) {
        const targetWeek = addWeeks(new Date(), weekOffset)
        const startOfTargetWeek = startOfWeek(targetWeek, { weekStartsOn: 0 }) // Sunday = 0
        const trainingDate = addDays(startOfTargetWeek, recurring.day_of_week)
        const trainingDateStr = format(trainingDate, "yyyy-MM-dd")

        const instanceExists = await dbGet.recurringTrainingInstanceExists(recurring.id, trainingDateStr)
        if (instanceExists) {
          results.push({
            recurringId: recurring.id,
            name: recurring.name,
            status: "skipped",
            reason: `Training already exists for week ${weekOffset} (${trainingDateStr})`,
          })
          continue
        }

        const missionConflicts = await dbGet.missionConflictsOnDate(trainingDateStr)

        let finalDate = trainingDateStr
        let conflictResolved = false

        if (missionConflicts.length > 0 && weekOffset <= 2) {
          const nextWeekDate = addWeeks(trainingDate, 1)
          const nextWeekDateStr = format(nextWeekDate, "yyyy-MM-dd")

          const nextWeekConflicts = await dbGet.missionConflictsOnDate(nextWeekDateStr)

          if (nextWeekConflicts.length === 0) {
            finalDate = nextWeekDateStr
            conflictResolved = true
          }
        } else if (missionConflicts.length === 0) {
          conflictResolved = true
        }

        if (!conflictResolved) {
          results.push({
            recurringId: recurring.id,
            name: recurring.name,
            status: "skipped",
            reason: `Mission conflicts on week ${weekOffset} (${trainingDateStr})`,
          })
          continue
        }
        const trainingData = {
          name: recurring.name,
          description: recurring.description,
          date: finalDate,
          time: recurring.time,
          location: recurring.location,
          instructor: recurring.instructor,
          maxPersonnel: recurring.max_personnel !== null ? recurring.max_personnel : 40 ,
        }

        await createTrainingRecord(trainingData)

        const createdTraining = await dbGet.trainingRecordByDetails(recurring.name, finalDate, recurring.time)

        if (createdTraining) {
          const instanceId = `instance-${Date.now()}-${weekOffset}-${Math.random().toString(36).substr(2, 9)}`

          await dbPost.recurringTrainingInstance({
            id: instanceId,
            recurringTrainingId: recurring.id,
            trainingId: createdTraining.id,
            scheduledDate: finalDate,
          })

          results.push({
            recurringId: recurring.id,
            name: recurring.name,
            trainingId: createdTraining.id,
            scheduledDate: finalDate,
            status: "created",
            rescheduled: finalDate !== trainingDateStr,
            weekOffset: weekOffset,
          })
        }
      }

      await dbPut.recurringTrainingInstanceCount(recurring.id)
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
