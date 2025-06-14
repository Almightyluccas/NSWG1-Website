"use server"

import { revalidatePath } from 'next/cache'
import { database } from "@/database";

export async function updateUserRoles(roles: string[], userId: string) {
  try {
    await database.put.userRoleByUserId(roles, userId)
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update roles' }
  }
}