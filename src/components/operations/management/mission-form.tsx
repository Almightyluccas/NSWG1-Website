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

export type MissionFormValues = {
  campaignId: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxPersonnel?: number | null;
};

export function MissionForm({
  title,
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  title: string;
  defaultValues: MissionFormValues;
  submitLabel: string;
  onSubmit: (values: MissionFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<MissionFormValues>(defaultValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ManagementFormShell title={title}>
      <ManagementFormError error={error} />

      <div className="space-y-2">
        <Label htmlFor="mname">Mission Name</Label>
        <Input
          id="mname"
          value={values.name}
          onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mdesc">Description</Label>
        <Textarea
          id="mdesc"
          value={values.description}
          onChange={(e) =>
            setValues((p) => ({ ...p, description: e.target.value }))
          }
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mdate">Date</Label>
          <Input
            id="mdate"
            type="date"
            value={values.date}
            onChange={(e) => setValues((p) => ({ ...p, date: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mtime">Time</Label>
          <Input
            id="mtime"
            type="time"
            value={values.time}
            onChange={(e) => setValues((p) => ({ ...p, time: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mloc">Location</Label>
        <Input
          id="mloc"
          value={values.location}
          onChange={(e) =>
            setValues((p) => ({ ...p, location: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mmax">Max Personnel (optional)</Label>
        <Input
          id="mmax"
          type="number"
          value={values.maxPersonnel ?? ""}
          onChange={(e) =>
            setValues((p) => ({
              ...p,
              maxPersonnel:
                e.target.value === "" ? null : Number.parseInt(e.target.value),
            }))
          }
        />
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
