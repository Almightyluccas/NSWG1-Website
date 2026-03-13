"use client";

import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GalleryItem } from "@/types/admin/gallery";

interface ItemDetailsDialogProps {
  item: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: GalleryItem) => void;
  onDelete: (item: GalleryItem) => void;
}

export function ItemDetailsDialog({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ItemDetailsDialogProps) {
  if (!item) return null;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800">
            {item.type === "image" ? (
              <Image
                src={item.url || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-contain"
              />
            ) : item.type === "video" ? (
              <video
                src={item.url}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full">
                <iframe
                  src={`https://www.youtube.com/embed/${item.videoId}`}
                  className="w-full h-full"
                  allowFullScreen
                  title="YouTube video preview"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Details
              </h4>
              <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4 space-y-2">
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 capitalize">
                    {item.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date Added</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    {new Date(item.dateAdded).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Featured</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    {item.featured ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Categories
              </h4>
              <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4">
                <div className="flex flex-wrap gap-2">
                  {item.categories.map((category: string) => (
                    <Badge key={category} className="capitalize">
                      {category.replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between w-full">
          <Button variant="outline" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => onDelete(item)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
