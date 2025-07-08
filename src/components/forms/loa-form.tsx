"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { submitLOAForm } from "@/app/forms/action"
import type { LOASubmission } from "@/types/forms"

interface LOAFormProps {
  user: {
    id: string | undefined | null
    name?: string | null
    email?: string | null
  }
}

export function LOAForm({ user }: LOAFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Pre-fill name with user's name or generate from email
  const getInitialName = () => {
    if (user.name) {
      const parts = user.name.split(" ")
      if (parts.length >= 2) {
        return `${parts[0][0]}. ${parts[parts.length - 1]}`
      }
      return user.name
    }
    if (user.email) {
      const emailPart = user.email.split("@")[0]
      return emailPart.charAt(0).toUpperCase() + ". " + emailPart.slice(1)
    }
    return ""
  }

  const [formData, setFormData] = useState<LOASubmission>({
    name: getInitialName(),
    reason: "",
    dateOfLeave: "",
    dateOfReturn: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.reason.trim()) {
      setErrorMessage("Name and reason are required fields.")
      return
    }

    startTransition(async () => {
      try {
        await submitLOAForm(formData)
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

  const handleInputChange = (field: keyof LOASubmission, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (submitStatus === "error") {
      setSubmitStatus("idle")
      setErrorMessage("")
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
                Your Leave of Absence request has been submitted and will be reviewed by command staff.
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
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Leave of Absence (LOA) Request</CardTitle>
              </div>
            </div>
            <CardDescription className="text-base leading-relaxed">
              Please fill out this form prior to leaving for a prolonged period of time. The definition of a LOA would
              be greater than 4 sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium">
                  First Initial Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., J. Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Format: First Initial followed by period, space, then last name
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="reason" className="text-sm font-medium">
                  Reason For Leave <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a brief explanation for your leave of absence..."
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  rows={4}
                  required
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="dateOfLeave" className="text-sm font-medium">
                    Date Of Leave (Optional)
                  </Label>
                  <Input
                    id="dateOfLeave"
                    type="date"
                    value={formData.dateOfLeave}
                    onChange={(e) => handleInputChange("dateOfLeave", e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="dateOfReturn" className="text-sm font-medium">
                    Date Of Return (Optional)
                  </Label>
                  <Input
                    id="dateOfReturn"
                    type="date"
                    value={formData.dateOfReturn}
                    onChange={(e) => handleInputChange("dateOfReturn", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-accent flex-1">
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit LOA Request"
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
