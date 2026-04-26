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
  User,
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

type Training = {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  instructor?: string;
  max_personnel?: number | null;
  status: string;
};

const statusColors: Record<string, string> = {
  scheduled:
    "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10",
  "in-progress": "border-accent/40 text-accent bg-accent/10",
  completed:
    "border-zinc-400/40 text-zinc-500 dark:text-zinc-400 bg-zinc-500/10",
  cancelled: "border-red-400/40 text-red-500 dark:text-red-400 bg-red-500/10",
};

export function TrainingListClient() {
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/training");
        const data = await res.json();
        setTrainings(Array.isArray(data) ? data : []);
      } catch {
        setTrainings([]);
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
      const res = await fetch(`/api/training/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete training");
      setTrainings((prev) => prev.filter((t) => t.id !== deleteId));
      toast.success("Training deleted");
    } catch {
      toast.error("Failed to delete training");
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
            Training Sessions
          </h1>
        </div>
        <Button asChild className="bg-accent hover:bg-accent-darker text-black">
          <Link href="/dashboard/operations/management/training/new">
            <Plus className="h-4 w-4 mr-2" />
            New Training
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      ) : trainings.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/30">
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">
            No training sessions yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.map((training) => (
            <div
              key={training.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-accent/30 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 truncate">
                    {training.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase font-bold tracking-wider shrink-0 ${statusColors[training.status] || statusColors.scheduled}`}
                  >
                    {training.status}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  {training.description}
                </p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {training.date} @ {training.time}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {training.location}
                  </span>
                  {training.instructor && (
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {training.instructor}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() =>
                    router.push(
                      `/dashboard/operations/management/training/${training.id}`
                    )
                  }
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-red-500 hover:text-red-600 hover:border-red-300 dark:hover:border-red-500/40"
                  onClick={() => setDeleteId(training.id)}
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
            <AlertDialogTitle>Delete Training</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this training session. This action
              cannot be undone.
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
