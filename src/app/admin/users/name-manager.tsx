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
import { updateUserName } from "./action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NameManagerProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  userName: string;
  userId: string;
}

export function NameManager({
  open,
  onOpenChangeAction,
  userName,
  userId,
}: NameManagerProps) {
  const [selectedName, setSelectedName] = useState<string>(userName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setSelectedName(userName);
    }
  }, [open, userName]);

  const handleSubmit = async () => {
    if (selectedName === userName || selectedName.trim() === "") {
      toast.error("Please enter a new name", {
        className: "bg-red-950 text-red-400 border border-red-900",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await updateUserName(selectedName, userId);

      if (result.success) {
        toast.success("Name updated successfully");
        onOpenChangeAction(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update name");
      }
    } catch (error) {
      toast.error("An error occurred while updating name");
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
          <DialogTitle>Update User Name</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name-input">New Name</Label>
            <Input
              id="name-input"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              placeholder="Enter the new name"
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
