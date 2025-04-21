"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Filter, Plus, MoreHorizontal, Trash2, Edit, Eye, Video } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock gallery data
const mockGalleryItems = [
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

// Available categories for gallery items
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

export default function GalleryManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isItemDetailsOpen, setIsItemDetailsOpen] = useState(false)
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    type: "image",
    url: "",
    thumbnail: "",
    categories: [] as string[],
    featured: false,
  })

  // Filter gallery items based on search query
  const filteredItems = mockGalleryItems.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.categories.some((category) => category.toLowerCase().includes(searchLower))
    )
  })

  const handleViewDetails = (item: any) => {
    setSelectedItem(item)
    setIsItemDetailsOpen(true)
  }

  const handleAddNew = () => {
    setEditMode(false)
    setFormData({
      id: "",
      title: "",
      description: "",
      type: "image",
      url: "",
      thumbnail: "",
      categories: [],
      featured: false,
    })
    setIsAddEditOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditMode(true)
    setFormData({
      ...item,
    })
    setIsAddEditOpen(true)
  }

  const handleDelete = (item: any) => {
    setSelectedItem(item)
    setIsDeleteConfirmOpen(true)
  }

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => {
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

  const handleSaveItem = () => {
    // In a real app, this would save to your backend
    console.log("Saving item:", formData)
    setIsAddEditOpen(false)
    // Would refresh data here
  }

  const handleConfirmDelete = () => {
    // In a real app, this would delete from your backend
    console.log("Deleting item:", selectedItem?.id)
    setIsDeleteConfirmOpen(false)
    // Would refresh data here
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gallery Management</h1>
          <p className="text-gray-500 dark:text-zinc-400">Manage gallery images and videos.</p>
        </div>
        <Button className="bg-accent hover:bg-accent-darker text-black" onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Add New Item
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm">
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
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
            <tr className="bg-gray-50 dark:bg-zinc-700/50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Categories
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Date Added
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="relative h-16 w-24 rounded overflow-hidden mr-3 flex-shrink-0">
                      <Image
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      {item.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2">{item.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{item.type}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {item.categories.map((category) => (
                      <Badge key={category} variant="outline" className="capitalize">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.featured ? (
                    <Badge variant="accent">Featured</Badge>
                  ) : (
                    <span className="text-gray-500 dark:text-zinc-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(item.dateAdded).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(item)} className="text-red-500 dark:text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-zinc-400">No gallery items found matching your search criteria.</p>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 dark:border-zinc-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-zinc-400">
            Showing <span className="font-medium">{filteredItems.length}</span> of{" "}
            <span className="font-medium">{mockGalleryItems.length}</span> items
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
      </div>

      {/* View Item Details Dialog */}
      {selectedItem && (
        <Dialog open={isItemDetailsOpen} onOpenChange={setIsItemDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedItem.title}</DialogTitle>
              <DialogDescription>{selectedItem.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
                {selectedItem.type === "image" ? (
                  <Image
                    src={selectedItem.url || "/placeholder.svg"}
                    alt={selectedItem.title}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <video src={selectedItem.url} controls className="w-full h-full object-contain" />
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
                      <p className="text-sm text-gray-500 dark:text-zinc-400 capitalize">{selectedItem.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Date Added</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {new Date(selectedItem.dateAdded).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Featured</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedItem.featured ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Categories
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.categories.map((category: string) => (
                        <Badge key={category} className="capitalize">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleEdit(selectedItem)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setIsItemDetailsOpen(false)
                  handleDelete(selectedItem)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add/Edit Item Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
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
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter a title for this item"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter a description"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked === true })}
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
                          onChange={() => setFormData({ ...formData, type: "image" })}
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
                          onChange={() => setFormData({ ...formData, type: "video" })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="type-video">Video</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">Media URL</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder={formData.type === "image" ? "Enter image URL" : "Enter video URL"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail URL</Label>
                    <Input
                      id="thumbnail"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="Enter thumbnail URL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-700 flex items-center justify-center">
                      {formData.url ? (
                        formData.type === "image" ? (
                          <Image
                            src={formData.url || "/placeholder.svg"}
                            alt="Preview"
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <video src={formData.url} controls className="w-full h-full object-contain" />
                        )
                      ) : (
                        <div className="text-gray-400 dark:text-zinc-500">No media preview available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4 pt-4">
              <div className="space-y-4">
                <Label>Select Categories (Multiple)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={formData.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label htmlFor={`category-${category}`} className="capitalize">
                        {category}
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
                          {category}
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
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>{editMode ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedItem?.title}&ldquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
