"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus, GripVertical, Save, X, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GalleryTable } from "@/components/admin/gallery/gallery-table"
import { CategoryManagementDialog } from "@/components/admin/gallery/category-management-dialog"
import { ItemDetailsDialog } from "@/components/admin/gallery/item-details-dialog"
import { AddEditItemDialog } from "@/components/admin/gallery/add-edit-item-dialog"
import { DeleteConfirmationDialog } from "@/components/admin/gallery/delete-confirmation-dialog"
import type { GalleryItem, FormDataGallery } from "@/types/admin/gallery"
import {FileUploadDialog} from "@/components/ui/image-upload-dialog";
import {fileUpload} from "@/lib/Object-Storage/objectStorageActions";
import {UploadType} from "@/types/objectStorage";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";

const mockGalleryItems: GalleryItem[] = [
  {
    id: "gallery_1",
    title: "SEAL Team Training Exercise",
    description: "Special operations training in maritime environment",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    thumbnail: "/placeholder.svg?height=200&width=300",
    categories: ["training", "maritime", "team"],
    featured: true,
    dateAdded: "2024-01-15T10:30:00Z",
  },
  {
    id: "gallery_2",
    title: "Night Operations Drill",
    description: "Team conducting night vision training operations",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    thumbnail: "/placeholder.svg?height=200&width=300",
    categories: ["training", "night-ops"],
    featured: false,
    dateAdded: "2024-02-10T14:15:00Z",
  },
  {
    id: "gallery_3",
    title: "Tactical Insertion Exercise",
    description: "Helicopter insertion training with full gear",
    type: "video",
    url: "/videos/tactical-training.mp4",
    thumbnail: "/placeholder.svg?height=200&width=300",
    categories: ["training", "aerial", "insertion"],
    featured: true,
    dateAdded: "2024-03-05T11:45:00Z",
  },
  {
    id: "gallery_4",
    title: "Maritime Interdiction Operation",
    description: "Team practicing vessel boarding and search procedures",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    thumbnail: "/placeholder.svg?height=200&width=300",
    categories: ["maritime", "interdiction"],
    featured: false,
    dateAdded: "2024-03-20T09:00:00Z",
  },
  {
    id: "gallery_5",
    title: "Combat Diving Training",
    description: "Underwater operations and tactics training",
    type: "video",
    url: "/videos/tactical-training.mp4",
    thumbnail: "/placeholder.svg?height=200&width=300",
    categories: ["training", "diving", "maritime"],
    featured: true,
    dateAdded: "2024-04-01T13:30:00Z",
  },
]

const availableCategories = [
  "training",
  "maritime",
  "aerial",
  "night-ops",
  "team",
  "insertion",
  "interdiction",
  "diving",
  "combat",
  "equipment",
  "graduation",
  "ceremony",
]

export function GalleryManagementClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [isItemDetailsOpen, setIsItemDetailsOpen] = useState(false)
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [isUploadImageOpen, setIsUploadImageOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false)
  const [categories, setCategories] = useState(availableCategories)
  const [editMode, setEditMode] = useState(false)
  const [isOrderMode, setIsOrderMode] = useState(false)
  const [galleryItems, setGalleryItems] = useState(mockGalleryItems)
  const [hasOrderChanges, setHasOrderChanges] = useState(false)

  const router = useRouter()
  const { update: updateSession } = useSession()


  const [formData, setFormData] = useState<FormDataGallery>({
    id: "",
    title: "",
    description: "",
    type: "image",
    url: "",
    thumbnail: "",
    categories: [],
    featured: false,
    videoId: undefined,
  })

  const filteredItems = galleryItems.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.categories.some((category) => category.toLowerCase().includes(searchLower))
    )
  })

  const handleViewDetails = (item: GalleryItem) => {
    setSelectedItem(item)
    setIsItemDetailsOpen(true)
  }

  const handleImageUpload  = async (formData: FormData, uploadType: UploadType) => {
    await fileUpload({formData, uploadType, router, updateSession})
  }

  const handleAddNew = (mediaType: "image" | "video" | "youtube" = "image") => {
    setEditMode(false)
    setFormData({
      id: "",
      title: "",
      description: "",
      type: mediaType,
      url: "",
      thumbnail: "",
      categories: [],
      featured: false,
      videoId: mediaType === "youtube" ? "" : undefined,
    })
    setIsAddEditOpen(true)
  }

  const handleEdit = (item: GalleryItem) => {
    setEditMode(true)
    setFormData({
      ...item,
    })
    setIsAddEditOpen(true)
  }

  const handleDelete = (item: GalleryItem) => {
    setSelectedItem(item)
    setIsDeleteConfirmOpen(true)
  }

  const handleSaveItem = () => {
    // In a real app, this would save to your backend
    setIsAddEditOpen(false)
    // Would refresh data here
  }

  const handleConfirmDelete = () => {
    // In a real app, this would delete from your backend
    setIsDeleteConfirmOpen(false)
    // Would refresh data here
  }

  const saveOrder = () => {
    // In a real app, this would save the new order to your backend
    console.log("[v0] Saving new gallery order:", galleryItems)
    setIsOrderMode(false)
    setHasOrderChanges(false)
    // Would make API call here to save order
  }

  const cancelOrderEdit = () => {
    // Reset to original order
    setGalleryItems(mockGalleryItems)
    setIsOrderMode(false)
    setHasOrderChanges(false)
  }

  return (
    <>
      <div className="p-6 border-b border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 ml-auto">
          {isOrderMode ? (
            <>
              <Button variant="outline" onClick={cancelOrderEdit} className="flex items-center gap-2 bg-transparent">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={saveOrder}
                disabled={!hasOrderChanges}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Order
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsCategoryManagementOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Manage Category
              </Button>
              <Button variant="outline" onClick={() => setIsOrderMode(true)} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4" />
                Edit Order
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-accent hover:bg-accent-darker text-black">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Item
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setIsUploadImageOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddNew("video")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddNew("youtube")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add YouTube Video
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {isOrderMode && (
        <div className="mx-6 mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Order Editing Mode</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Drag and drop gallery items to reorder them. Click &quot;Save Order&quot; when finished.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isOrderMode && (
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <Input
              type="text"
              placeholder="Search gallery items..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      )}

      <GalleryTable
        items={isOrderMode ? galleryItems : filteredItems}
        isOrderMode={isOrderMode}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReorder={setGalleryItems}
        onOrderChange={setHasOrderChanges}
      />

      {filteredItems.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-zinc-400">No gallery items found matching your search criteria.</p>
        </div>
      )}

      {!isOrderMode && (
        <div className="p-4 border-t border-gray-200 dark:border-zinc-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-zinc-400">
            Showing <span className="font-medium">{filteredItems.length}</span> of{" "}
            <span className="font-medium">{galleryItems.length}</span> items
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}

      {isUploadImageOpen && (
        <FileUploadDialog
          open={isUploadImageOpen}
          onOpenChange={() => setIsUploadImageOpen(false)}
          uploadType={'gallery'}
          handleUpload={handleImageUpload}/>
      )}

      <ItemDetailsDialog
        item={selectedItem}
        isOpen={isItemDetailsOpen}
        onClose={() => setIsItemDetailsOpen(false)}
        onEdit={handleEdit}
        onDelete={(item) => {
          setIsItemDetailsOpen(false)
          handleDelete(item)
        }}
      />

      <AddEditItemDialog
        isOpen={isAddEditOpen}
        onCloseAction={() => setIsAddEditOpen(false)}
        editMode={editMode}
        formData={formData}
        setFormDataAction={setFormData}
        categories={categories}
        onSaveAction={handleSaveItem}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        item={selectedItem}
        onConfirm={handleConfirmDelete}
      />

      <CategoryManagementDialog
        isOpen={isCategoryManagementOpen}
        onClose={() => setIsCategoryManagementOpen(false)}
        categories={categories}
        setCategories={setCategories}
        galleryItems={galleryItems}
        setGalleryItems={setGalleryItems}
      />
    </>
  )
}
