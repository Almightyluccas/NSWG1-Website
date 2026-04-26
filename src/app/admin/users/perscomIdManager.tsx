"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserPerscomId } from "./action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NameManagerProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  perscomId: number;
  userId: string;
}

export function PerscomIdManager({
  open,
  onOpenChangeAction,
  perscomId,
  userId,
}: NameManagerProps) {
  const [selectedPerscomId, setSelectedPerscomId] = useState<number>(perscomId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setSelectedPerscomId(perscomId);
    }
  }, [open, perscomId]);

  const handleSubmit = async () => {
    if (selectedPerscomId === perscomId) {
      toast.error("Please enter a new Perscom ID", {
        className: "bg-red-950 text-red-400 border border-red-900",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await updateUserPerscomId(selectedPerscomId, userId);

      if (result.success) {
        toast.success("Perscom ID updated successfully");
        onOpenChangeAction(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update Perscom ID");
      }
    } catch (error) {
      toast.error("An error occurred while updating Perscom ID");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChangeAction(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User Perscom ID</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name-input">New Perscom ID</Label>
            <Input
              id="name-input"
              value={selectedPerscomId}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setSelectedPerscomId(0);
                  return;
                }
                const parsed = parseInt(raw, 10);
                if (!isNaN(parsed)) setSelectedPerscomId(parsed);
              }}
              placeholder="Enter the new PerscomID"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
