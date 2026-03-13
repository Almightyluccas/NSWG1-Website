"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Trash2,
  Play,
  RefreshCw,
} from "lucide-react";
import { RecurringTrainingDialog } from "./recurring-training-dialog";
import {
  getRecurringTrainings,
  updateRecurringTraining,
  deleteRecurringTraining,
  processRecurringTrainings,
} from "@/app/calendar/recurring-actions";
import { toast } from "sonner";
import { RecurringTraining } from "@/types/recurring-training";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function RecurringTrainingManager() {
  const [recurringTrainings, setRecurringTrainings] = useState<
    RecurringTraining[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const loadRecurringTrainings = async () => {
    try {
      const data = await getRecurringTrainings();
      setRecurringTrainings(data);
    } catch (error) {
      console.error("Failed to load recurring trainings:", error);
      toast.error("Failed to load recurring trainings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateRecurringTraining(id, { isActive });
      await loadRecurringTrainings();
      toast.success(`Training ${isActive ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error("Failed to update training:", error);
      toast.error("Failed to update training");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecurringTraining(id);
      await loadRecurringTrainings();
      toast.success("Recurring training deleted");
    } catch (error) {
      console.error("Failed to delete training:", error);
      toast.error("Failed to delete training");
    }
  };

  const handleProcessTrainings = async () => {
    setProcessing(true);
    try {
      const results = await processRecurringTrainings();
      const created = results.filter((r) => r.status === "created").length;
      const skipped = results.filter((r) => r.status === "skipped").length;
      const errors = results.filter((r) => r.status === "error").length;

      if (created > 0) {
        toast.success(
          `Created ${created} training session${created > 1 ? "s" : ""}`
        );
      }
      if (skipped > 0) {
        toast.warning(
          `Skipped ${skipped} training${skipped > 1 ? "s" : ""} due to conflicts`
        );
      }
      if (errors > 0) {
        toast.error(
          `Failed to process ${errors} training${errors > 1 ? "s" : ""}`
        );
      }
      if (created === 0 && skipped === 0 && errors === 0) {
        toast.info("No new trainings to create");
      }
    } catch (error) {
      console.error("Failed to process trainings:", error);
      toast.error("Failed to process recurring trainings");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    loadRecurringTrainings();
    // Auto-process when component mounts
    if (!isCollapsed) {
      handleProcessTrainings();
    }
  }, []);

  // Auto-process when expanding the section
  useEffect(() => {
    if (!isCollapsed && !loading) {
      handleProcessTrainings();
    }
  }, [isCollapsed, loading]);

  return (
    <Card>
      <Collapsible
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Recurring Training Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage weekly recurring training sessions
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <RecurringTrainingDialog onSuccess={loadRecurringTrainings} />
                <Button
                  variant="outline"
                  onClick={handleProcessTrainings}
                  disabled={processing}
                  className="bg-transparent"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${processing ? "animate-spin" : ""}`}
                  />
                  {processing ? "Processing..." : "Process Now"}
                </Button>
              </div>

              {/* Recurring Trainings List */}
              {loading ? (
                <div className="text-center py-4">
                  Loading recurring trainings...
                </div>
              ) : recurringTrainings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recurring trainings configured</p>
                  <p className="text-sm">
                    Create one to automatically schedule weekly training
                    sessions
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recurringTrainings.map((training) => (
                    <Card
                      key={training.id}
                      className="border-l-4 border-l-accent"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{training.name}</h4>
                              <Badge
                                variant={
                                  training.is_active ? "default" : "secondary"
                                }
                              >
                                {training.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>

                            {training.description && (
                              <p className="text-sm text-muted-foreground">
                                {training.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {DAYS_OF_WEEK[training.day_of_week]}s
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {training.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {training.location}
                              </div>
                              {training.instructor && (
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {training.instructor}
                                </div>
                              )}
                              {training.max_personnel && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  Max {training.max_personnel}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={training.is_active}
                                onCheckedChange={(checked) =>
                                  handleToggleActive(training.id, checked)
                                }
                              />
                              <span className="text-sm text-muted-foreground">
                                {training.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Recurring Training
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {training.name}"? This will also delete all
                                    associated training instances. This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(training.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Info Box */}
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <div className="flex items-start gap-2">
                  <Play className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>
                        • Training sessions are automatically created 1 week in
                        advance
                      </li>
                      <li>
                        • System checks for mission conflicts and reschedules if
                        needed
                      </li>
                      <li>
                        • Only active recurring trainings will create new
                        sessions
                      </li>
                      <li>
                        • Click "Process Now" to manually check for new sessions
                        to create
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
