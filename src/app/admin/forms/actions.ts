"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { database } from "@/database"

export async function getAdminForms() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized")
  }

  const forms = await database.get.forms()
  return forms
}

export async function getFormSubmissions(formId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized")
  }

  const submissions = await database.get.formSubmissions(formId)
  return submissions
}

export async function getFormById(formId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized")
  }

  const form = await database.get.formById(formId)
  return form
}
