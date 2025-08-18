"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FormDataGallery } from "@/types/admin/gallery"
import React from "react";

interface AddEditItemDialogProps {
  isOpen: boolean
  onCloseAction: (open: boolean) => void
  editMode: boolean
  formData: FormDataGallery
  setFormDataAction: React.Dispatch<React.SetStateAction<FormDataGallery>>
  categories: string[]
  onSaveAction: () => void
}

export function AddEditItemDialog({
  isOpen,
  onCloseAction,
  editMode,
  formData,
  setFormDataAction,
  categories,
  onSaveAction,
}: AddEditItemDialogProps) {
  const handleCategoryToggle = (category: string) => {
    setFormDataAction((prev: FormDataGallery): FormDataGallery => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter((c) => c !== category),
        }
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category],
        }
      }
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCloseAction(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onCloseAction(false)}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Gallery Item" : "Add New Gallery Item"}</DialogTitle>
          <DialogDescription>
            {editMode ? "Update the details of this gallery item." : "Add a new image or video to the gallery."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormDataAction({ ...formData, title: e.target.value })}
                    placeholder="Enter a title for this item"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormDataAction({ ...formData, description: e.target.value })}
                    placeholder="Enter a description"
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormDataAction({ ...formData, featured: checked === true })}
                  />
                  <Label htmlFor="featured">Featured item (will be highlighted in the gallery)</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Media Type</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="type-image"
                        name="type"
                        value="image"
                        checked={formData.type === "image"}
                        onChange={() => setFormDataAction({ ...formData, type: "image" })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="type-image">Image</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="type-video"
                        name="type"
                        value="video"
                        checked={formData.type === "video"}
                        onChange={() => setFormDataAction({ ...formData, type: "video" })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="type-video">Video</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="type-youtube"
                        name="type"
                        value="youtube"
                        checked={formData.type === "youtube"}
                        onChange={() => setFormDataAction({ ...formData, type: "youtube" })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="type-youtube">YouTube</Label>
                    </div>
                  </div>
                </div>

                {formData.type === "youtube" ? (
                  <div className="space-y-2">
                    <Label htmlFor="videoId">YouTube Video ID</Label>
                    <Input
                      id="videoId"
                      value={formData.videoId || ""}
                      onChange={(e) => setFormDataAction({ ...formData, videoId: e.target.value })}
                      placeholder="Enter YouTube video ID (e.g., dQw4w9WgXcQ)"
                    />
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      Extract the video ID from the YouTube URL. For example, from
                      &quot;https://www.youtube.com/watch?v=dQw4w9WgXcQ&quot; use &quot;dQw4w9WgXcQ&quot;
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="url">Media URL</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormDataAction({ ...formData, url: e.target.value })}
                      placeholder={formData.type === "image" ? "Enter image URL" : "Enter video URL"}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) => setFormDataAction({ ...formData, thumbnail: e.target.value })}
                    placeholder="Enter thumbnail URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-700 flex items-center justify-center">
                    {(() => {
                      if (formData.type === "youtube" && formData.videoId) {
                        return (
                          <div className="w-full h-full">
                            <iframe
                              src={`https://www.youtube.com/embed/${formData.videoId}`}
                              className="w-full h-full"
                              allowFullScreen
                              title="YouTube video preview"
                            />
                          </div>
                        )
                      } else if (formData.url) {
                        if (formData.type === "image") {
                          return (
                            <Image
                              src={formData.url || "/placeholder.svg"}
                              alt="Preview"
                              fill
                              className="object-contain"
                            />
                          )
                        } else if (formData.type === "video") {
                          return <video src={formData.url} controls className="w-full h-full object-contain" />
                        }
                      }
                      return <div className="text-gray-400 dark:text-zinc-500">No media preview available</div>
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Select Categories (Multiple)</Label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={formData.categories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label htmlFor={`category-${category}`} className="capitalize">
                      {category.replace(/-/g, " ")}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Label>Selected Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.categories.length > 0 ? (
                    formData.categories.map((category) => (
                      <Badge key={category} className="capitalize">
                        {category.replace(/-/g, " ")}
                      </Badge>
                    ))
                  ) : (
                    <div className="text-gray-500 dark:text-zinc-400">No categories selected</div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onCloseAction(false)}>
            Cancel
          </Button>
          <Button onClick={onSaveAction}>{editMode ? "Update" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
