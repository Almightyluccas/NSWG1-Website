"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, AlertCircle } from "lucide-react"
import { logDocumentAccess } from "@/app/documents/action"

interface DocumentViewerProps {
  documentPath: string
}

export default function DocumentViewer({ documentPath }: DocumentViewerProps) {
  const [documentExists, setDocumentExists] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fullPath = `/${documentPath}`
  const fileName = documentPath.split("/").pop() || ""
  const fileExtension = fileName.split(".").pop()?.toLowerCase()

  useEffect(() => {
    const checkDocument = async () => {
      try {
        const response = await fetch(fullPath, { method: "HEAD" })
        setDocumentExists(response.ok)

        if (response.ok) {
          await logDocumentAccess(fullPath, fileName, "view")
        }
      } catch (error) {
        console.error("Error checking document:", error)
        setDocumentExists(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkDocument()
  }, [fullPath, fileName])

  const handleDownload = async () => {
    try {
      const response = await fetch(fullPath)
      if (!response.ok) throw new Error("Download failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      await logDocumentAccess(fullPath, fileName, "download")
    } catch (error) {
      console.error("Error downloading document:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading document...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!documentExists) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Document Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The document "{fileName}" could not be found or is no longer available.
            </p>
            <Button variant="outline" onClick={() => window.history.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {fileName}
            </CardTitle>
            <Button onClick={handleDownload} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fileExtension === "pdf" ? (
            <div className="w-full h-[800px] border rounded-lg overflow-hidden">
              <iframe
                src={`${fullPath}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full"
                title={fileName}
                onError={() => {
                  console.error("Failed to load PDF")
                  setDocumentExists(false)
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Preview Not Available</h3>
              <p className="text-muted-foreground mb-4">This document type cannot be previewed in the browser.</p>
              <Button onClick={handleDownload} className="flex items-center gap-2 mx-auto">
                <Download className="h-4 w-4" />
                Download to View
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
