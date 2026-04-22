"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ManagementFormShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-900/60">
      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
        <CardTitle className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">{children}</CardContent>
    </Card>
  );
}

export function ManagementFormError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="rounded-lg border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-600 dark:text-red-200 font-mono">
      {error}
    </div>
  );
}

export function ManagementFormActions({
  submitting,
  submitLabel,
  disabled,
  onCancel,
  onSubmit,
}: {
  submitting: boolean;
  submitLabel: string;
  disabled: boolean;
  onCancel?: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="pt-2 flex items-center justify-end gap-2">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
      )}
      <Button
        type="button"
        className="bg-accent hover:bg-accent-darker text-black"
        onClick={onSubmit}
        disabled={disabled}
      >
        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  );
}
