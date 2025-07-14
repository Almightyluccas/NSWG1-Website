"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  AlignLeft,
  CheckSquare,
  Circle,
  ChevronDown,
  Calendar,
  Clock,
  Mail,
  Hash,
} from "lucide-react"
import { createForm } from "@/app/admin/forms/actions"
import { getFormWithQuestions } from "@/app/forms/action"
import type { FormDefinition, FormQuestion } from "@/types/forms"
import { toast } from "sonner"

interface FormBuilderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingForm?: FormDefinition | null
  onFormCreated: (form: FormDefinition) => void
  onFormUpdated: (form: FormDefinition) => void
}

type QuestionType =
  | "short_answer"
  | "paragraph"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "date"
  | "time"
  | "email"
  | "number"

interface QuestionBuilder extends Omit<FormQuestion, "id" | "form_id" | "created_at"> {
  tempId: string
  isExisting?: boolean
  originalId?: number
}

const questionTypeIcons = {
  short_answer: Type,
  paragraph: AlignLeft,
  multiple_choice: Circle,
  checkboxes: CheckSquare,
  dropdown: ChevronDown,
  date: Calendar,
  time: Clock,
  email: Mail,
  number: Hash,
}

const questionTypeLabels = {
  short_answer: "Short Answer",
  paragraph: "Paragraph",
  multiple_choice: "Multiple Choice",
  checkboxes: "Checkboxes",
  dropdown: "Dropdown",
  date: "Date",
  time: "Time",
  email: "Email",
  number: "Number",
}

export function FormBuilderDialog({
  open,
  onOpenChange,
  editingForm,
  onFormCreated,
  onFormUpdated,
}: FormBuilderDialogProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [questions, setQuestions] = useState<QuestionBuilder[]>([])
  const [questionTypeSelectValue, setQuestionTypeSelectValue] = useState<string>("")

  useEffect(() => {
    const loadFormData = async () => {
      if (editingForm && open) {
        setIsLoading(true)
        try {
          const fullForm = await getFormWithQuestions(editingForm.id)

          setFormTitle(fullForm!.title)
          setFormDescription(fullForm!.description || "")

          const existingQuestions: QuestionBuilder[] =
            fullForm!.questions?.map((q) => ({
              tempId: `existing_${q.id}`,
              question_text: q.question_text,
              question_type: q.question_type,
              is_required: q.is_required,
              options: q.options,
              order_index: q.order_index,
              isExisting: true,
              originalId: q.id,
            })) || []

          setQuestions(existingQuestions)
        } catch (error) {
          console.error("Error loading form data:", error)
          toast.error("Failed to load form data")
        } finally {
          setIsLoading(false)
        }
      } else if (!editingForm && open) {
        setFormTitle("")
        setFormDescription("")
        setQuestions([])
      }
      setQuestionTypeSelectValue("")
    }

    loadFormData()
  }, [editingForm, open])

  const addQuestion = (type: QuestionType) => {
    const newQuestion: QuestionBuilder = {
      tempId: `new_${Date.now()}`,
      question_text: "",
      question_type: type,
      is_required: false,
      options: type === "multiple_choice" || type === "checkboxes" || type === "dropdown" ? ["Option 1"] : undefined,
      order_index: questions.length,
      isExisting: false,
    }
    setQuestions([...questions, newQuestion])
    setQuestionTypeSelectValue("")
  }

  const updateQuestion = (tempId: string, updates: Partial<QuestionBuilder>) => {
    setQuestions(questions.map((q) => (q.tempId === tempId ? { ...q, ...updates } : q)))
  }

  const deleteQuestion = (tempId: string) => {
    setQuestions(
      questions
        .filter((q) => q.tempId !== tempId)
        .map((q, index) => ({
          ...q,
          order_index: index,
        })),
    )
  }

  const addOption = (tempId: string) => {
    const question = questions.find((q) => q.tempId === tempId)
    if (question && question.options) {
      updateQuestion(tempId, {
        options: [...question.options, `Option ${question.options.length + 1}`],
      })
    }
  }

  const updateOption = (tempId: string, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.tempId === tempId)
    if (question && question.options) {
      const newOptions = [...question.options]
      newOptions[optionIndex] = value
      updateQuestion(tempId, { options: newOptions })
    }
  }

  const deleteOption = (tempId: string, optionIndex: number) => {
    const question = questions.find((q) => q.tempId === tempId)
    if (question && question.options && question.options.length > 1) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex)
      updateQuestion(tempId, { options: newOptions })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formTitle.trim()) {
      toast.error("Please enter a form title")
      return
    }

    const validQuestions = questions.filter((q) => q.question_text && q.question_text.trim())

    if (validQuestions.length === 0) {
      toast.error("Please add at least one question with text")
      return
    }

    if (!session?.user?.id) {
      toast.error("You must be logged in to create forms")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createForm({
        title: formTitle.trim(),
        description: formDescription.trim(),
        questions: validQuestions.map(({ tempId, isExisting, originalId, ...q }) => q),
        createdBy: session.user.id,
        formId: editingForm?.id,
      })

      if (result.success) {
        const newForm: FormDefinition = {
          id: result.formId!,
          title: formTitle.trim(),
          description: formDescription.trim(),
          is_active: true,
          created_by: session.user.id,
          created_at: editingForm?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        if (editingForm) {
          onFormUpdated(newForm)
        } else {
          onFormCreated(newForm)
        }

        toast.success(editingForm ? "Form updated successfully!" : "Form created successfully!")
        onOpenChange(false)
      } else {
        toast.error(result.error || "Failed to save form")
      }
    } catch (error) {
      console.error("Error saving form:", error)
      toast.error("An error occurred while saving the form")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormTitle("")
    setFormDescription("")
    setQuestions([])
    setQuestionTypeSelectValue("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingForm ? "Edit Form" : "Create New Form"}</DialogTitle>
          <DialogDescription>Build your form by adding questions and configuring their properties</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading form data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rest of the form content remains the same */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="formTitle">
                  Form Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="formTitle"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Enter form title..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formDescription">Form Description</Label>
                <Textarea
                  id="formDescription"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter form description..."
                  rows={3}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions</h3>
                <Select
                  value={questionTypeSelectValue}
                  onValueChange={(value) => {
                    setQuestionTypeSelectValue(value)
                    addQuestion(value as QuestionType)
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Add Question" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(questionTypeLabels).map(([type, label]) => {
                      const Icon = questionTypeIcons[type as QuestionType]
                      return (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {questions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Type className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                    <p className="text-muted-foreground">Add your first question using the dropdown above</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const Icon = questionTypeIcons[question.question_type]
                    return (
                      <Card key={question.tempId}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{questionTypeLabels[question.question_type]}</span>
                              {question.isExisting && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Existing</span>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuestion(question.tempId)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>
                              Question Text <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={question.question_text}
                              onChange={(e) => updateQuestion(question.tempId, { question_text: e.target.value })}
                              placeholder="Enter your question..."
                            />
                          </div>

                          {/* Options for multiple choice, checkboxes, dropdown */}
                          {(question.question_type === "multiple_choice" ||
                            question.question_type === "checkboxes" ||
                            question.question_type === "dropdown") && (
                            <div className="space-y-2">
                              <Label>Options</Label>
                              <div className="space-y-2">
                                {question.options?.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <Input
                                      value={option}
                                      onChange={(e) => updateOption(question.tempId, optionIndex, e.target.value)}
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                    {question.options!.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteOption(question.tempId, optionIndex)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addOption(question.tempId)}
                                  className="flex items-center gap-1"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add Option
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`required-${question.tempId}`}
                              checked={question.is_required}
                              onCheckedChange={(checked) => updateQuestion(question.tempId, { is_required: checked })}
                            />
                            <Label htmlFor={`required-${question.tempId}`}>Required</Label>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formTitle.trim()}>
                {isSubmitting ? "Saving..." : editingForm ? "Update Form" : "Create Form"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
