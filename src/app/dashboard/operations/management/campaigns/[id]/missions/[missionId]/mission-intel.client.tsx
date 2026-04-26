"use client";

import Link from "next/link";
import { IntelBlockForm } from "@/components/operations/management/intel-block-form";
import { DocSummaryPanel } from "@/components/operations/management/doc-summary-panel";
import { SseSummaryPanel } from "@/components/operations/management/sse-summary-panel";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function MissionIntelClient({
  campaignId,
  missionId,
}: {
  campaignId: string;
  missionId: string;
}) {
  return (
    <div className="space-y-4">
      <Button asChild variant="outline">
        <Link
          href={`/dashboard/operations/management/campaigns/${campaignId}/missions`}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to missions
        </Link>
      </Button>

      <IntelBlockForm
        ownerType="mission"
        ownerId={missionId}
        heading="Operational Intel // Mission-Level"
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DocSummaryPanel
          ownerType="mission"
          ownerId={missionId}
          campaignId={campaignId}
          isAdmin
          heading="Docs // Mission-Level"
        />
        <SseSummaryPanel
          ownerType="mission"
          ownerId={missionId}
          campaignId={campaignId}
          isAdmin
          heading="SSE Returns // Mission-Level"
        />
      </div>
    </div>
  );
}
