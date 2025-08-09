"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitForm } from "@/app/forms/action"
import { toast } from "sonner"
import type { FormDefinition } from "@/types/forms"

interface FormViewerProps {
  form: FormDefinition
}

export default function FormViewer({ form }: FormViewerProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAnswerChange = (questionId: number, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const requiredQuestions = form.questions?.filter((q) => q.is_required) || []
      const missingAnswers = requiredQuestions.filter((q) => {
        const answer = answers[q.id]
        return !answer || (Array.isArray(answer) ? answer.length === 0 : answer.toString().trim() === "")
      })

      if (missingAnswers.length > 0) {
        toast.error("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }

      const submissionAnswers = Object.entries(answers)
        .filter(([_, answer]) => {
          if (Array.isArray(answer)) {
            return answer.length > 0
          }
          return answer && answer.toString().trim() !== ""
        })
        .map(([questionId, answer]) => ({
          questionId: Number(questionId),
          answer: Array.isArray(answer) ? answer.join(", ") : answer.toString(),
        }))

      const submissionData = {
        formId: form.id,
        userId: session?.user?.id,
        userName: session?.user?.name || "",
        userEmail: session?.user?.email || "",
        answers: submissionAnswers,
      }

      const result = await submitForm(submissionData)

      if (result.success) {
        toast.success("Form submitted successfully!")
        router.push("/forms")
      } else {
        toast.error(result.error || "Failed to submit form")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("An error occurred while submitting the form")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question: any) => {
    const value = answers[question.id] || ""

    switch (question.question_type) {
      case "short_answer":
        return (
          <Input
            value={value as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            required={question.is_required}
          />
        )

      case "paragraph":
        return (
          <Textarea
            value={value as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            rows={4}
            required={question.is_required}
          />
        )

      case "email":
        return (
          <Input
            type="email"
            value={value as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your email"
            required={question.is_required}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={value as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter a number"
            required={question.is_required}
          />
        )

      case "date":
        return (
          <Input
            type="date"
            value={value as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.is_required}
          />
        )

      case "time":
        return (
          <Input
            type="time"
            value={value as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.is_required}
          />
        )

      case "multiple_choice":
        return (
          <RadioGroup
            value={value as string}
            onValueChange={(newValue) => handleAnswerChange(question.id, newValue)}
            required={question.is_required}
          >
            {question.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkboxes":
        const checkboxValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={checkboxValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswerChange(question.id, [...checkboxValues, option])
                    } else {
                      handleAnswerChange(
                        question.id,
                        checkboxValues.filter((v) => v !== option),
                      )
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case "dropdown":
        return (
          <Select
            value={value as string}
            onValueChange={(newValue) => handleAnswerChange(question.id, newValue)}
            required={question.is_required}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option: string, index: number) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return (
          <Input
            value={value as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            required={question.is_required}
          />
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{form.title}</CardTitle>
          {form.description && <CardDescription>{form.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.questions?.map((question) => (
              <div key={question.id} className="space-y-2">
                <Label className="text-base font-medium">
                  {question.question_text}
                  {question.is_required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderQuestion(question)}
              </div>
            ))}

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Form"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
