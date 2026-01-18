"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/database";
import { updateUserRoles } from "./action";
import { toast } from "sonner";

interface RoleManagerProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  currentRoles: string[];
  userId: string;
  currentUserRoles: string[];
}

export function RoleManager({
  open,
  onOpenChangeAction,
  currentRoles,
  userId,
  currentUserRoles,
}: RoleManagerProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCurrentUserDeveloper = currentUserRoles.includes(UserRole.developer);
  const isCurrentUserSuperAdmin = currentUserRoles.includes(
    UserRole.superAdmin
  );
  const isCurrentUserAdmin = currentUserRoles.includes(UserRole.admin);

  const getAllowedRoles = () => {
    const allRoles = Object.values(UserRole);

    if (isCurrentUserDeveloper) {
      return allRoles;
    }

    if (isCurrentUserSuperAdmin) {
      return allRoles.filter((role) => role !== UserRole.developer);
    }

    if (isCurrentUserAdmin) {
      return allRoles.filter(
        (role) =>
          ![UserRole.developer, UserRole.superAdmin].includes(role as UserRole)
      );
    }

    return [];
  };
  const handleSubmit = async () => {
    if (selectedRoles.length === 0) {
      toast.error("Please select at least one role", {
        className: "bg-red-950 text-red-400 border border-red-900",
      });
      return;
    }

    const newRoles = selectedRoles.filter(
      (role) => !currentRoles.includes(role)
    );

    if (!isCurrentUserDeveloper && newRoles.includes(UserRole.developer)) {
      toast.error("Only Developers can assign the Developer role");
      return;
    }

    if (
      !isCurrentUserDeveloper &&
      !isCurrentUserSuperAdmin &&
      newRoles.includes(UserRole.superAdmin)
    ) {
      toast.error(
        "Only Developers and SuperAdmins can assign the SuperAdmin role"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await updateUserRoles(selectedRoles, userId);

      if (result.success) {
        toast.success("Roles updated successfully");
        onOpenChangeAction(false);
      } else {
        toast.error(result.error || "Failed to update roles");
      }
    } catch (error) {
      toast.error("An error occurred while updating roles");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedRoles(currentRoles);
    onOpenChangeAction(false);
  };
  const allowedRoles = getAllowedRoles();

  if (allowedRoles.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage User Roles</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {allowedRoles.map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={role}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRoles([...selectedRoles, role]);
                    } else {
                      setSelectedRoles(selectedRoles.filter((r) => r !== role));
                    }
                  }}
                />
                <label
                  htmlFor={role}
                  className="text-sm font-medium capitalize"
                >
                  {role.replace("_", " ")}
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
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
