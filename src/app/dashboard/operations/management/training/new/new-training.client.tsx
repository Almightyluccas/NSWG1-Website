"use client";

import { useRouter } from "next/navigation";
import {
  TrainingForm,
  type TrainingFormValues,
} from "@/components/operations/management/training-form";

export function NewTrainingClient() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <TrainingForm
        title="Create Training Session"
        submitLabel="Create Training"
        onCancel={() => router.push("/dashboard/operations/management")}
        onSubmit={async (values: TrainingFormValues) => {
          const res = await fetch("/api/training", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: values.name,
              description: values.description,
              date: values.date,
              time: values.time,
              location: values.location,
              instructor: values.instructor || undefined,
              maxPersonnel: values.maxPersonnel ?? undefined,
            }),
          });
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Failed to create training.");
          }
          const data = (await res.json()) as { id?: string };
          if (!data?.id) {
            throw new Error("Training created, but no ID was returned.");
          }
          router.push(`/dashboard/operations/management/training/${data.id}`);
          router.refresh();
        }}
      />
    </div>
  );
}

