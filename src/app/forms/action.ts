"use server"

import { database } from "@/database"
import { revalidatePath } from "next/cache"
import type { FormDefinition, FormQuestion, FormSubmission } from "@/types/forms"

export async function createForm(formData: {
  title: string
  description?: string
  questions: Omit<FormQuestion, "id" | "form_id" | "created_at">[]
  createdBy: string
  formId?: number
}) {
  try {
    let formId: number

    if (formData.formId) {
      await database.put.updateFormDefinition(formData.formId, formData.title, formData.description || "")

      await database.delete.deleteFormQuestionsByFormId(formData.formId)

      formId = formData.formId
    } else {
      formId = await database.post.createFormDefinition(formData.title, formData.description || "", formData.createdBy)
    }

    for (const question of formData.questions) {
      if (question.question_text && question.question_text.trim()) {
        await database.post.createFormQuestion(formId, question)
      }
    }

    revalidatePath("/admin/forms")
    revalidatePath("/forms")

    return { success: true, formId }
  } catch (error) {
    console.error("Error creating/updating form:", error)
    return { success: false, error: "Failed to save form" }
  }
}

export async function getForms(): Promise<FormDefinition[]> {
  try {
    const forms = await database.get.getForms()
    return forms
  } catch (error) {
    console.error("Error fetching forms:", error)
    return []
  }
}

export async function getFormWithQuestions(formId: number): Promise<FormDefinition | null> {
  try {
    const form = await database.get.getFormWithQuestions(formId)
    return form
  } catch (error) {
    console.error("Error fetching form with questions:", error)
    return null
  }
}

export async function submitForm(submissionData: {
  formId: number
  userId?: string
  userName?: string
  userEmail?: string
  answers: Array<{
    questionId: number
    answer: string
  }>
}) {
  try {

    const submissionId = await database.post.createFormSubmission(
      submissionData.formId,
      submissionData.userId,
      submissionData.userName,
      submissionData.userEmail,
    )

    for (const answer of submissionData.answers) {
      if (answer.answer && answer.answer.trim()) {
        await database.post.createFormSubmissionAnswer(submissionId, answer.questionId, answer.answer.trim())
      }
    }

    revalidatePath("/admin/forms")
    revalidatePath("/forms")

    return { success: true, submissionId }
  } catch (error) {
    console.error("Error submitting form:", error)
    return { success: false, error: "Failed to submit form" }
  }
}

export async function getFormSubmissions(formId: number): Promise<FormSubmission[]> {
  try {
    const submissions = await database.get.getFormSubmissions(formId)
    return submissions
  } catch (error) {
    console.error("Error fetching form submissions:", error)
    return []
  }
}

export async function updateSubmissionStatus(
  submissionId: number,
  status: "pending" | "reviewed" | "approved" | "rejected",
  reviewedBy: string,
  notes?: string,
) {
  try {
    await database.put.updateFormSubmissionStatus(submissionId, status, reviewedBy, notes)

    revalidatePath("/admin/forms")

    return { success: true }
  } catch (error) {
    console.error("Error updating submission status:", error)
    return { success: false, error: "Failed to update submission status" }
  }
}

export async function deleteForm(formId: number) {
  try {
    await database.put.updateFormActiveStatus(formId, false)

    revalidatePath("/admin/forms")
    revalidatePath("/forms")

    return { success: true }
  } catch (error) {
    console.error("Error deleting form:", error)
    return { success: false, error: "Failed to delete form" }
  }
}

export async function getUserFormSubmissions(userId: string): Promise<FormSubmission[]> {
  try {
    const submissions = await database.get.getUserFormSubmissions(userId)
    return submissions
  } catch (error) {
    console.error("Error fetching user form submissions:", error)
    return []
  }
}