"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { MoreHorizontal, Trash2, Edit, Eye, Video, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { GalleryItem } from "@/types/admin/gallery"

interface GalleryTableProps {
  items: GalleryItem[]
  isOrderMode: boolean
  onViewDetails: (item: GalleryItem) => void
  onEdit: (item: GalleryItem) => void
  onDelete: (item: GalleryItem) => void
  onReorder: (items: GalleryItem[]) => void
  onOrderChange: (hasChanges: boolean) => void
}

export function GalleryTable({
  items,
  isOrderMode,
  onViewDetails,
  onEdit,
  onDelete,
  onReorder,
  onOrderChange,
}: GalleryTableProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", itemId)

    // Add visual feedback
    const target = e.target as HTMLElement
    target.style.opacity = "0.5"
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement
    target.style.opacity = "1"
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (!draggedItem) return

    const draggedIndex = items.findIndex((item) => item.id === draggedItem)
    if (draggedIndex === -1 || draggedIndex === dropIndex) return

    const newItems = [...items]
    const [movedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(dropIndex, 0, movedItem)

    onReorder(newItems)
    onOrderChange(true)
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
        <tr className="bg-gray-50 dark:bg-zinc-700/50 text-left">
          {isOrderMode && (
            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Drag
            </th>
          )}
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
          {!isOrderMode && (
            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Actions
            </th>
          )}
        </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
        {items.map((item, index) => (
          <tr
            key={item.id}
            className={`hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors ${
              isOrderMode ? "cursor-move" : ""
            } ${dragOverIndex === index ? "bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-400" : ""}`}
            draggable={isOrderMode}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            {isOrderMode && (
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <GripVertical className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                </div>
              </td>
            )}
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div className="relative h-16 w-24 rounded overflow-hidden mr-3 flex-shrink-0">
                  <Image src={item.thumbnail || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
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
                    {category.replace(/-/g, " ")}
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
            {!isOrderMode && (
              <td className="px-6 py-4 whitespace-nowrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(item)}>
                      <Eye className="h-4 w-4 mr-2" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(item)} className="text-red-500 dark:text-red-400">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            )}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}
