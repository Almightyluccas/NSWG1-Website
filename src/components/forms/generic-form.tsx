"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, FileText } from "lucide-react"
import { submitGenericForm } from "@/app/forms/action"
import type { Form, FormField } from "@/types/forms"

interface GenericFormProps {
  form: Form
  user: {
    id: string | undefined | null
    name?: string | null
    email?: string | null
  }
}

export function GenericForm({ form, user }: GenericFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [formData, setFormData] = useState<Record<string, any>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (form.fields) {
      for (const field of form.fields) {
        if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === "")) {
          setErrorMessage(`${field.label} is required.`)
          return
        }
      }
    }

    startTransition(async () => {
      try {
        await submitGenericForm(form.id, formData)
        setSubmitStatus("success")
        setTimeout(() => {
          router.push("/forms")
        }, 2000)
      } catch (error) {
        console.error("Form submission error:", error)
        setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
        setSubmitStatus("error")
      }
    })
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    if (submitStatus === "error") {
      setSubmitStatus("idle")
      setErrorMessage("")
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name] || field.defaultValue || ""

    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            type="text"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            className="h-11"
          />
        )

      case "textarea":
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            rows={4}
            className="resize-none"
          />
        )

      case "date":
        return (
          <Input
            id={field.id}
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            className="h-11"
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={(val) => handleInputChange(field.name, val)} required={field.required}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "radio":
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleInputChange(field.name, val)}
            required={field.required}
            className="space-y-3"
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`} className="text-sm font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        return (
          <div className="flex items-center space-x-3">
            <Checkbox
              id={field.id}
              checked={value === true}
              onCheckedChange={(checked) => handleInputChange(field.name, checked)}
              required={field.required}
            />
            <Label htmlFor={field.id} className="text-sm font-normal leading-relaxed">
              {field.label}
            </Label>
          </div>
        )

      default:
        return null
    }
  }

  if (submitStatus === "success") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/50 mb-6">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-green-900 dark:text-green-100">
                Form Submitted Successfully
              </h2>
              <p className="text-green-700 dark:text-green-300 mb-4 max-w-md">
                Your form submission has been received and will be reviewed.
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">Redirecting you back to forms...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{form.name}</CardTitle>
              </div>
            </div>
            {form.description && (
              <CardDescription className="text-base leading-relaxed">{form.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {form.fields?.map((field) => (
                <div key={field.id} className="space-y-3">
                  {field.type !== "checkbox" && (
                    <Label htmlFor={field.id} className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                  )}
                  {renderField(field)}
                </div>
              ))}

              <div className="flex gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Form"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
