"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Download, Clock, ExternalLink } from "lucide-react"
import { getDocuments } from "@/app/documents/action"
import type { DocumentInfo } from "@/types/forms"
import Link from "next/link"

export function DocumentsClient() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDocuments() {
      try {
        const documentsData = await getDocuments()
        setDocuments(documentsData)
      } catch (error) {
        console.error("Error loading documents:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [])

  const filteredDocuments = documents.filter((doc) => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "bg-red-100 text-red-800"
      case "doc":
      case "docx":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Available Documents Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Download className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Available Documents</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card key={doc.path} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="truncate">{doc.name}</span>
                  <Badge className={getFileTypeColor(doc.type)}>{doc.type.toUpperCase()}</Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-4 text-sm">
                  {doc.size && <span>{formatFileSize(doc.size)}</span>}
                  {doc.lastModified && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(doc.lastModified).toLocaleDateString()}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/documents/${doc.path}`}>
                  <Button variant="outline" className="w-full bg-transparent">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Document
                  </Button>
                </Link>
                <a href={doc.path} download>
                  <Button variant="secondary" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}

          {filteredDocuments.length === 0 && !searchTerm && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents available</p>
              <p className="text-sm">Documents will appear here when added to the public/documents folder</p>
            </div>
          )}

          {filteredDocuments.length === 0 && searchTerm && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No documents found matching "{searchTerm}"
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
