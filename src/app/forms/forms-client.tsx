"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, ExternalLink } from "lucide-react"
import { getForms } from "@/app/forms/action"
import type { FormDefinition } from "@/types/forms"
import Link from "next/link"

export function FormsClient() {
  const [forms, setForms] = useState<FormDefinition[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadForms() {
      try {
        const formsData = await getForms()
        setForms(formsData)
      } catch (error) {
        console.error("Error loading forms:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadForms()
  }, [])

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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
          placeholder="Search forms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Available Forms Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Available Forms</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => (
            <Card key={form.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{form.title}</CardTitle>
                {form.description && (
                  <CardDescription className="h-36 overflow-y-auto pr-2">{form.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Link href={`/forms/${form.id}`}>
                  <Button variant="outline" className="w-full bg-transparent">
                    <ExternalLink className="h-4 w-4 mr-2"/>
                    View Form
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}

          {filteredForms.length === 0 && !searchTerm && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No forms available</p>
              <p className="text-sm">Forms will appear here once created by an administrator</p>
            </div>
          )}

          {filteredForms.length === 0 && searchTerm && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No forms found matching "{searchTerm}"
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
