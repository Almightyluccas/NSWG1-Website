"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Search, Users, Calendar, Clock, MessageSquare, CheckCircle, XCircle, Eye } from "lucide-react"
import { updateSubmissionStatus } from "@/app/admin/forms/actions"
import type { FormDefinition, FormSubmission } from "@/types/forms"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface FormSubmissionsClientProps {
  form: FormDefinition
  initialSubmissions: FormSubmission[]
}

export function FormSubmissionsClient({ form, initialSubmissions }: FormSubmissionsClientProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(
    initialSubmissions.length > 0 ? initialSubmissions[0] : null,
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const [statusSelectValue, setStatusSelectValue] = useState<string>("")

  useEffect(() => {
    if (selectedSubmission) {
      setReviewNotes(selectedSubmission.notes || "")
      setStatusSelectValue("")
    }
  }, [selectedSubmission])

  const handleStatusUpdate = async (submissionId: number, status: "pending" | "reviewed" | "approved" | "rejected") => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to update submission status")
      return
    }

    setIsUpdating(true)

    try {
      const result = await updateSubmissionStatus(submissionId, status, session.user.id, reviewNotes)

      if (result.success) {
        toast.success("Submission status updated successfully")
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.id === submissionId
              ? {
                ...sub,
                status,
                reviewed_by: session.user.id,
                reviewed_at: new Date(),
                notes: reviewNotes,
              }
              : sub,
          ),
        )
        if (selectedSubmission?.id === submissionId) {
          setSelectedSubmission((prev) =>
            prev
              ? {
                ...prev,
                status,
                reviewed_by: session.user.id,
                reviewed_at: new Date(),
                notes: reviewNotes,
              }
              : null,
          )
        }
        setStatusSelectValue("")
      } else {
        toast.error(result.error || "Failed to update submission status")
      }
    } catch (error) {
      console.error("Error updating submission status:", error)
      toast.error("An error occurred while updating the submission")
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "reviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const filteredSubmissions = submissions.filter((submission) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (submission.user_name && submission.user_name.toLowerCase().includes(searchLower)) ||
      (submission.user_email && submission.user_email.toLowerCase().includes(searchLower)) ||
      submission.status.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Form Submissions</h1>
            <p className="text-muted-foreground">
              {form.title} • {submissions.length} total submissions
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.filter((s) => s.status === "pending").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.filter((s) => s.status === "approved").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.filter((s) => s.status === "rejected").length}</div>
            </CardContent>
          </Card>
        </div>

        {submissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-muted-foreground">Submissions will appear here once users fill out the form</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submissions List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Submissions</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[600px] overflow-y-auto">
                    {filteredSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        onClick={() => setSelectedSubmission(submission)}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedSubmission?.id === submission.id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">
                            {submission.user_name || submission.user_email || "Anonymous"}
                          </h4>
                          <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submission Details */}
            <div className="lg:col-span-2">
              {selectedSubmission ? (
                <div className="space-y-6">
                  {/* Submission Info */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Submission Details</CardTitle>
                        <Badge className={getStatusColor(selectedSubmission.status)}>{selectedSubmission.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Submitted by:</strong>{" "}
                          {selectedSubmission.user_name || selectedSubmission.user_email || "Anonymous"}
                        </div>
                        <div>
                          <strong>Email:</strong> {selectedSubmission.user_email || "Not provided"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <strong>Submitted:</strong> {new Date(selectedSubmission.submitted_at).toLocaleString()}
                        </div>
                        <div>
                          <strong>Status:</strong> {selectedSubmission.status}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Answers */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Answers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedSubmission.answers && selectedSubmission.answers.length > 0 ? (
                        selectedSubmission.answers.map((answer) => (
                          <div key={answer.id} className="border-b pb-4 last:border-b-0">
                            <p className="font-medium mb-2">{answer.question_text}</p>
                            <p className="text-muted-foreground">
                              {answer.answer_json
                                ? Array.isArray(answer.answer_json)
                                  ? answer.answer_json.join(", ")
                                  : JSON.stringify(answer.answer_json)
                                : answer.answer_text || "No answer provided"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No answers recorded</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Review Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Review Submission
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
                        <Textarea
                          id="reviewNotes"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Add notes about this submission..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Select
                          value={statusSelectValue}
                          onValueChange={(value) => {
                            setStatusSelectValue(value)
                            handleStatusUpdate(
                              selectedSubmission.id,
                              value as "pending" | "reviewed" | "approved" | "rejected",
                            )
                          }}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedSubmission.notes && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-1">Previous Notes:</p>
                          <p className="text-sm">{selectedSubmission.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a submission to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}