"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  MapPin,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type Campaign = {
  id: string;
  name: string;
  description: string;
  codename: string | null;
  start_date: string;
  end_date: string;
  status: string;
  ao: string | null;
  mission_count?: number;
};

const statusColors: Record<string, string> = {
  planning:
    "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10",
  active: "border-accent/40 text-accent bg-accent/10",
  completed:
    "border-zinc-400/40 text-zinc-500 dark:text-zinc-400 bg-zinc-500/10",
  cancelled: "border-red-400/40 text-red-500 dark:text-red-400 bg-red-500/10",
};

export function CampaignListClient() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/operations");
        const data = await res.json();
        setCampaigns(Array.isArray(data) ? data : []);
      } catch {
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/campaigns/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete campaign");
      setCampaigns((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success("Campaign deleted");
    } catch {
      toast.error("Failed to delete campaign");
    } finally {
      setDeleteId(null);
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/operations/management"
            className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 dark:text-zinc-500 hover:text-accent transition-colors mb-2"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Management
          </Link>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
            Campaigns
          </h1>
        </div>
        <Button asChild className="bg-accent hover:bg-accent-darker text-black">
          <Link href="/dashboard/operations/management/campaigns/new">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/30">
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">
            No campaigns yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-accent/30 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 truncate">
                    {campaign.codename || campaign.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase font-bold tracking-wider shrink-0 ${statusColors[campaign.status] || statusColors.planning}`}
                  >
                    {campaign.status}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  {campaign.description}
                </p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                  {campaign.ao && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {campaign.ao}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {campaign.start_date} &rarr; {campaign.end_date}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() =>
                    router.push(
                      `/dashboard/operations/management/campaigns/${campaign.id}/missions`
                    )
                  }
                >
                  Mission Mgmt
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() =>
                    router.push(
                      `/dashboard/operations/management/campaigns/${campaign.id}/campaign`
                    )
                  }
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Campaign Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-red-500 hover:text-red-600 hover:border-red-300 dark:hover:border-red-500/40"
                  onClick={() => setDeleteId(campaign.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this campaign and all its missions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
