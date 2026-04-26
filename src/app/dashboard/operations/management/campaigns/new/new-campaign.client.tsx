"use client";

import { useRouter } from "next/navigation";
import {
  CampaignForm,
  type CampaignFormValues,
} from "@/components/operations/management/campaign-form";

export function NewCampaignClient() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <CampaignForm
        title="Create Campaign"
        submitLabel="Create Campaign"
        onCancel={() => router.push("/dashboard/operations/management")}
        onSubmit={async (values: CampaignFormValues) => {
          const res = await fetch("/api/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Failed to create campaign.");
          }
          const data = (await res.json()) as { id?: string };
          if (!data?.id) {
            throw new Error("Campaign created, but no ID was returned.");
          }
          router.push(`/dashboard/operations/management/campaigns/${data.id}`);
          router.refresh();
        }}
      />
    </div>
  );
}
