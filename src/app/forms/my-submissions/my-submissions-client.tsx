"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { getUserFormSubmissions } from "@/app/forms/action";
import type { FormSubmission, FormSubmissionAnswer } from "@/types/forms";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface MySubmissionsClientProps {
  userId: string;
}

export function MySubmissionsClient({ userId }: MySubmissionsClientProps) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<FormSubmission | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const submissionsData = await getUserFormSubmissions(userId);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Error loading user submissions:", error);
        toast.error("Failed to load your submissions.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSubmissions();
  }, [userId]);

  const getStatusColorClass = (status: FormSubmission["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "reviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const handleViewDetailsClick = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setIsDetailDialogOpen(true);
  };

  const renderAnswer = (answer: FormSubmissionAnswer) => {
    const { question_type, answer_text, answer_json } = answer;

    switch (question_type) {
      case "checkboxes":
        if (Array.isArray(answer_json) && answer_json.length > 0) {
          return (
            <ul className="list-disc list-inside ml-4">
              {answer_json.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p className="italic text-muted-foreground">No options selected</p>
        );

      case "multiple_choice":
      case "dropdown":
        if (answer_text) {
          return <p className="whitespace-pre-wrap">{answer_text}</p>;
        }
        if (typeof answer_json === "string" && answer_json.trim() !== "") {
          return <p className="whitespace-pre-wrap">{answer_json}</p>;
        }
        return (
          <p className="italic text-muted-foreground">No answer provided</p>
        );

      case "short_answer":
      case "paragraph":
      case "date":
      case "time":
      case "email":
      case "number":
        if (answer_text && answer_text.trim() !== "") {
          return <p className="whitespace-pre-wrap">{answer_text}</p>;
        }
        return (
          <p className="italic text-muted-foreground">No answer provided</p>
        );

      default:
        if (answer_text && answer_text.trim() !== "") {
          return <p className="whitespace-pre-wrap">{answer_text}</p>;
        }
        if (answer_json) {
          return (
            <p className="whitespace-pre-wrap">
              {JSON.stringify(answer_json, null, 2)}
            </p>
          );
        }
        return (
          <p className="italic text-muted-foreground">No answer provided</p>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Submissions Found</h3>
          <p className="text-muted-foreground">
            You haven't submitted any forms yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((submission) => (
            <Card key={submission.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-lg">
                  {submission.form_title || "Unknown Form"}
                </CardTitle>
                <CardDescription>
                  Submitted on{" "}
                  {submission.submitted_at
                    ? format(new Date(submission.submitted_at), "PPP")
                    : "Unknown Date"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getStatusColorClass(submission.status)}>
                  {submission.status.charAt(0).toUpperCase() +
                    submission.status.slice(1)}
                </Badge>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleViewDetailsClick(submission)}
                  className="w-full"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedSubmission && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {selectedSubmission.form_title || "Form Submission Details"}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <DialogDescription className="inline">
                  Submitted by{" "}
                  {selectedSubmission.user_name ||
                    selectedSubmission.user_email ||
                    "Unknown User"}{" "}
                  on{" "}
                  {selectedSubmission.submitted_at
                    ? format(new Date(selectedSubmission.submitted_at), "PPP p")
                    : "Unknown Date"}
                  .
                </DialogDescription>
                {selectedSubmission.reviewed_at && (
                  <DialogDescription className="inline">
                    Reviewed on{" "}
                    {format(new Date(selectedSubmission.reviewed_at), "PPP p")}.
                  </DialogDescription>
                )}
                <Badge
                  className={getStatusColorClass(selectedSubmission.status)}
                >
                  {selectedSubmission.status.charAt(0).toUpperCase() +
                    selectedSubmission.status.slice(1)}
                </Badge>
              </div>
            </DialogHeader>

            {selectedSubmission.notes && (
              <div className="py-4 px-6 border-b border-t bg-muted/50 rounded-md mx-6 mt-4">
                <h4 className="font-semibold text-sm mb-2">Review Notes:</h4>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {selectedSubmission.notes}
                </p>
              </div>
            )}

            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-6">
                {selectedSubmission.answers &&
                selectedSubmission.answers.length > 0 ? (
                  selectedSubmission.answers.map((answer, index) => (
                    <div key={answer.id} className="space-y-2">
                      <p className="font-semibold text-md">{`${index + 1}. ${answer.question_text}`}</p>
                      <div className="text-foreground text-sm">
                        {renderAnswer(answer)}
                      </div>
                      {index < selectedSubmission.answers!.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    No answers found for this submission.
                  </p>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
