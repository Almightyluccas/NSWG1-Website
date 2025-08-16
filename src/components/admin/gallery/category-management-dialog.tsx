"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { GalleryItem } from "@/types/admin/gallery"

interface CategoryManagementDialogProps {
  isOpen: boolean
  onClose: () => void
  categories: string[]
  setCategories: (categories: string[]) => void
  galleryItems: GalleryItem[]
  setGalleryItems: (items: GalleryItem[]) => void
}

export function CategoryManagementDialog({
  isOpen,
  onClose,
  categories,
  setCategories,
  galleryItems,
  setGalleryItems,
}: CategoryManagementDialogProps) {
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [categorySearchQuery, setCategorySearchQuery] = useState("")

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(categorySearchQuery.toLowerCase()),
  )

  const handleCreateCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.toLowerCase().trim())) {
      const categorySlug = newCategoryName.toLowerCase().trim().replace(/\s+/g, "-")
      setCategories([...categories, categorySlug])
      setNewCategoryName("")
      console.log("[v0] Created new category:", categorySlug)
    }
  }

  const handleEditCategory = (oldCategory: string, newName: string) => {
    if (
      newName.trim() &&
      !categories.includes(newName.toLowerCase().trim()) &&
      newName.toLowerCase().trim() !== oldCategory
    ) {
      const newCategorySlug = newName.toLowerCase().trim().replace(/\s+/g, "-")
      const updatedCategories = categories.map((cat) => (cat === oldCategory ? newCategorySlug : cat))
      setCategories(updatedCategories)

      // Update gallery items that use this category
      const updatedGalleryItems = galleryItems.map((item) => ({
        ...item,
        categories: item.categories.map((cat) => (cat === oldCategory ? newCategorySlug : cat)),
      }))
      setGalleryItems(updatedGalleryItems)

      setEditingCategory(null)
      setEditCategoryName("")
      console.log("[v0] Updated category from", oldCategory, "to", newCategorySlug)
    }
  }

  const handleDeleteCategory = (categoryToDelete: string) => {
    const updatedCategories = categories.filter((cat) => cat !== categoryToDelete)
    setCategories(updatedCategories)

    // Remove category from all gallery items
    const updatedGalleryItems = galleryItems.map((item) => ({
      ...item,
      categories: item.categories.filter((cat) => cat !== categoryToDelete),
    }))
    setGalleryItems(updatedGalleryItems)

    console.log("[v0] Deleted category:", categoryToDelete)
  }

  const startEditingCategory = (category: string) => {
    setEditingCategory(category)
    setEditCategoryName(category.replace(/-/g, " "))
  }

  const handleClose = () => {
    onClose()
    setNewCategoryName("")
    setEditingCategory(null)
    setEditCategoryName("")
    setCategorySearchQuery("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>Add, edit, or remove categories used to organize gallery items.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Categories Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Existing Categories</Label>
              <Badge variant="outline">{categories.length} categories</Badge>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="pl-10"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3">
              {filteredCategories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-700/50 rounded-md"
                >
                  {editingCategory === category ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEditCategory(category, editCategoryName)
                          } else if (e.key === "Escape") {
                            setEditingCategory(null)
                            setEditCategoryName("")
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleEditCategory(category, editCategoryName)}
                        disabled={
                          !editCategoryName.trim() ||
                          editCategoryName.toLowerCase().trim().replace(/\s+/g, "-") === category
                        }
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCategory(null)
                          setEditCategoryName("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {category.replace(/-/g, " ")}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-zinc-400">
                          ({galleryItems.filter((item) => item.categories.includes(category)).length} items)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditingCategory(category)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {filteredCategories.length === 0 && categories.length > 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
                  No categories found matching "{categorySearchQuery}"
                </div>
              )}
              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-zinc-400">No categories created yet</div>
              )}
            </div>
          </div>

          {/* Add New Category Section */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-medium">Add New Category</Label>
            <div className="space-y-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name (e.g., Special Operations)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateCategory()
                  }
                }}
              />
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Category names will be automatically formatted (spaces become dashes, lowercase)
              </p>
            </div>

            {newCategoryName.trim() && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="p-2 bg-gray-50 dark:bg-zinc-700/50 rounded-md">
                  <Badge variant="outline" className="capitalize">
                    {newCategoryName.toLowerCase().trim().replace(/\s+/g, "-").replace(/-/g, " ")}
                  </Badge>
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateCategory}
              disabled={
                !newCategoryName.trim() ||
                categories.includes(newCategoryName.toLowerCase().trim().replace(/\s+/g, "-"))
              }
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
