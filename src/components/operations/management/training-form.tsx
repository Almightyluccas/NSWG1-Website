"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ManagementFormActions,
  ManagementFormError,
  ManagementFormShell,
} from "./shared-form";

export type TrainingFormValues = {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  instructor?: string;
  maxPersonnel?: number | null;
};

export function TrainingForm({
  title,
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  title: string;
  defaultValues?: Partial<TrainingFormValues>;
  submitLabel: string;
  onSubmit: (values: TrainingFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<TrainingFormValues>({
    name: defaultValues?.name ?? "",
    description: defaultValues?.description ?? "",
    date: defaultValues?.date ?? "",
    time: defaultValues?.time ?? "",
    location: defaultValues?.location ?? "",
    instructor: defaultValues?.instructor ?? "",
    maxPersonnel:
      typeof defaultValues?.maxPersonnel === "number"
        ? defaultValues.maxPersonnel
        : defaultValues?.maxPersonnel === null
          ? null
          : null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ManagementFormShell title={title}>
      <ManagementFormError error={error} />

        <div className="space-y-2">
          <Label htmlFor="tname">Training Name</Label>
          <Input
            id="tname"
            value={values.name}
            onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tdesc">Description</Label>
          <Textarea
            id="tdesc"
            value={values.description}
            onChange={(e) =>
              setValues((p) => ({ ...p, description: e.target.value }))
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tdate">Date</Label>
            <Input
              id="tdate"
              type="date"
              value={values.date}
              onChange={(e) => setValues((p) => ({ ...p, date: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ttime">Time</Label>
            <Input
              id="ttime"
              type="time"
              value={values.time}
              onChange={(e) => setValues((p) => ({ ...p, time: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tloc">Location</Label>
          <Input
            id="tloc"
            value={values.location}
            onChange={(e) =>
              setValues((p) => ({ ...p, location: e.target.value }))
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tinstructor">Instructor (optional)</Label>
            <Input
              id="tinstructor"
              value={values.instructor ?? ""}
              onChange={(e) =>
                setValues((p) => ({ ...p, instructor: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tmax">Max Personnel (optional)</Label>
            <Input
              id="tmax"
              type="number"
              value={values.maxPersonnel ?? ""}
              onChange={(e) =>
                setValues((p) => ({
                  ...p,
                  maxPersonnel:
                    e.target.value === ""
                      ? null
                      : Number.parseInt(e.target.value),
                }))
              }
            />
          </div>
        </div>

      <ManagementFormActions
        submitting={submitting}
        submitLabel={submitLabel}
        onCancel={onCancel}
        disabled={
          submitting ||
          !values.name ||
          !values.description ||
          !values.date ||
          !values.time ||
          !values.location
        }
        onSubmit={async () => {
          setError(null);
          setSubmitting(true);
          try {
            await onSubmit(values);
          } catch (e: any) {
            setError(e?.message || "Failed to submit.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </ManagementFormShell>
  );
}

