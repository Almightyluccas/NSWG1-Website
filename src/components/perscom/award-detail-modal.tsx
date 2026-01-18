"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AwardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  award: {
    id?: number;
    award_id: number;
    text: string | null;
    created_at: string;
    imageUrl: string | null;
    name: string;
    sanitizedText?: string;
    formattedDate?: string;
    author_id?: number;
  } | null;
}

export function AwardDetailModal({
  isOpen,
  onClose,
  award,
}: AwardDetailModalProps) {
  if (!award) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-auto max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] min-w-[300px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{award.name}</DialogTitle>
          <DialogDescription>
            Awarded on{" "}
            {award.formattedDate ||
              new Date(award.created_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <img
              src={award.imageUrl || "/placeholder.svg"}
              alt={award.name}
              className="h-32 w-32 object-contain border border-gray-200 dark:border-zinc-700 rounded-md p-2 bg-gray-50 dark:bg-zinc-800/50"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-zinc-300 mb-4">
              {award.sanitizedText || award.text || "No description available."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
