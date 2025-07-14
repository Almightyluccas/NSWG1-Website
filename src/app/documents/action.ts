"use server"

import { promises as fs } from "fs"
import path from "path"
import { database } from "@/database"
import type { DocumentInfo, DocumentAccessLog } from "@/types/forms"

export async function getDocuments(): Promise<DocumentInfo[]> {
  try {
    const documentsPath = path.join(process.cwd(), "public", "documents")

    try {
      await fs.access(documentsPath)
    } catch {
      await fs.mkdir(documentsPath, { recursive: true })
      return []
    }

    const files = await fs.readdir(documentsPath, { withFileTypes: true })
    const documents: DocumentInfo[] = []

    for (const file of files) {
      if (file.isFile()) {
        const filePath = path.join(documentsPath, file.name)
        const stats = await fs.stat(filePath)
        const ext = path.extname(file.name).toLowerCase()

        if ([".pdf", ".doc", ".docx"].includes(ext)) {
          documents.push({
            name: file.name,
            path: `/documents/${file.name}`,
            type: ext,
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
          })
        }
      }
    }

    return documents.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error("Error fetching documents:", error)
    return []
  }
}

export async function logDocumentAccess(
  documentPath: string,
  documentName: string,
  accessType: "view" | "download",
  userId?: string,
  userName?: string,
  ipAddress?: string,
  userAgent?: string,
) {
  try {
    await database.post.logDocumentAccess(
      documentPath,
      documentName,
      accessType,
      userId,
      userName,
      ipAddress,
      userAgent,
    )
    return { success: true }
  } catch (error) {
    console.error("Error logging document access:", error)
    return { success: false }
  }
}

export async function getDocumentAccessLogs(limit = 100): Promise<DocumentAccessLog[]> {
  try {
    const logs = await database.get.getDocumentAccessLogs(limit)
    return logs
  } catch (error) {
    console.error("Error fetching document access logs:", error)
    return []
  }
}
