"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { database } from "@/database"
import { perscom } from "@/lib/perscom/api"
import { v4 as uuidv4 } from "uuid"
import type { LOASubmission } from "@/types/forms"

export async function submitLOAForm(data: LOASubmission) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (!data.name?.trim() || !data.reason?.trim()) {
    throw new Error("Name and reason are required fields")
  }

  try {
    // Get user info for Perscom submission
    const userInfo = await database.get.userInfo(session.user.id)

    if (!userInfo.perscomId) {
      throw new Error("User not found in Perscom system")
    }

    // Submit to Perscom API using the new method
    await perscom.post.loaSubmission({
      ...data,
      user_id: Number.parseInt(userInfo.perscomId),
    })

    return { success: true }
  } catch (error) {
    console.error("LOA submission error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to submit LOA request")
  }
}

export async function submitGenericForm(formId: string, formData: Record<string, any>) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    // Get form details
    const form = await database.get.formById(formId)

    if (!form) {
      throw new Error("Form not found")
    }

    if (form.status !== "active") {
      throw new Error("Form is not active")
    }

    // Validate required fields if form has field definitions
    if (form.fields) {
      for (const field of form.fields) {
        if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === "")) {
          throw new Error(`${field.label} is required`)
        }
      }
    }

    // Submit to database
    await database.post.formSubmission({
      id: uuidv4(),
      form_id: formId,
      user_id: session.user.id,
      user_name: session.user.name || session.user.email || "Unknown User",
      data: formData,
      status: "pending",
    })

    return { success: true }
  } catch (error) {
    console.error("Form submission error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to submit form")
  }
}

export async function getFormById(formId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const form = await database.get.formById(formId)
  return form
}

export async function getForms() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const forms = await database.get.forms()
  return forms
}
