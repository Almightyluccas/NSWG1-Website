"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  ManagementFormActions,
  ManagementFormError,
  ManagementFormShell,
} from "./shared-form";

export type CampaignFormValues = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  // Operation detail fields
  codename?: string;
  ao?: string;
  brief?: string;
  commander?: string;
  forceComp?: string;
  missionType?: string;
};

export function CampaignForm({
  title,
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  title: string;
  defaultValues?: Partial<CampaignFormValues>;
  submitLabel: string;
  onSubmit: (values: CampaignFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<CampaignFormValues>({
    name: defaultValues?.name ?? "",
    description: defaultValues?.description ?? "",
    startDate: defaultValues?.startDate ?? "",
    endDate: defaultValues?.endDate ?? "",
    codename: defaultValues?.codename ?? "",
    ao: defaultValues?.ao ?? "",
    brief: defaultValues?.brief ?? "",
    commander: defaultValues?.commander ?? "",
    forceComp: defaultValues?.forceComp ?? "",
    missionType: defaultValues?.missionType ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOpDetails, setShowOpDetails] = useState(
    !!(defaultValues?.codename || defaultValues?.ao || defaultValues?.brief)
  );

  return (
    <ManagementFormShell title={title}>
      <ManagementFormError error={error} />

        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={values.description}
            onChange={(e) =>
              setValues((p) => ({ ...p, description: e.target.value }))
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={values.startDate}
              onChange={(e) =>
                setValues((p) => ({ ...p, startDate: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={values.endDate}
              onChange={(e) =>
                setValues((p) => ({ ...p, endDate: e.target.value }))
              }
              required
            />
          </div>
        </div>

        {/* ─── Expandable Operation Details ─── */}
        <div className="border-t border-zinc-200 dark:border-zinc-800/60 pt-3 mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowOpDetails(!showOpDetails)}
            className="w-full justify-between h-9 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Operation Details (Optional)
            {showOpDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>

          {showOpDetails && (
            <div className="mt-4 space-y-4 animate-in fade-in-0 slide-in-from-top-1 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codename">Codename</Label>
                  <Input
                    id="codename"
                    value={values.codename}
                    onChange={(e) => setValues((p) => ({ ...p, codename: e.target.value }))}
                    placeholder="e.g. TRIDENT FURY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ao">Area of Operations</Label>
                  <Input
                    id="ao"
                    value={values.ao}
                    onChange={(e) => setValues((p) => ({ ...p, ao: e.target.value }))}
                    placeholder="e.g. Eastern Afghanistan"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brief">Mission Brief</Label>
                <Textarea
                  id="brief"
                  value={values.brief}
                  onChange={(e) => setValues((p) => ({ ...p, brief: e.target.value }))}
                  placeholder="High-level situation overview and objectives..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commander">Commanding Officer</Label>
                  <Input
                    id="commander"
                    value={values.commander}
                    onChange={(e) => setValues((p) => ({ ...p, commander: e.target.value }))}
                    placeholder="e.g. CDR J. Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="missionType">Mission Type</Label>
                  <Input
                    id="missionType"
                    value={values.missionType}
                    onChange={(e) => setValues((p) => ({ ...p, missionType: e.target.value }))}
                    placeholder="e.g. Direct Action, FID, ISR"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="forceComp">Force Composition</Label>
                <Input
                  id="forceComp"
                  value={values.forceComp}
                  onChange={(e) => setValues((p) => ({ ...p, forceComp: e.target.value }))}
                  placeholder="e.g. 2x SEAL Platoons, 1x CAS Det"
                />
              </div>
            </div>
          )}
        </div>

      <ManagementFormActions
        submitting={submitting}
        submitLabel={submitLabel}
        onCancel={onCancel}
        disabled={
          submitting ||
          !values.name ||
          !values.description ||
          !values.startDate ||
          !values.endDate
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
