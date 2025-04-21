"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface AwardDetailModalProps {
  isOpen: boolean
  onClose: () => void
  award: {
    name: string
    date: string
    description: string
    image: string
    citation?: string
    presentedBy?: string
    location?: string
    operation?: string
  } | null
}

export function AwardDetailModal({ isOpen, onClose, award }: AwardDetailModalProps) {
  if (!award) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{award.name}</DialogTitle>
          <DialogDescription>Awarded on {new Date(award.date).toLocaleDateString()}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <img
              src={award.image || "/placeholder.svg"}
              alt={award.name}
              className="h-32 w-32 object-contain border border-gray-200 dark:border-zinc-700 rounded-md p-2 bg-gray-50 dark:bg-zinc-800/50"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-zinc-300 mb-4">{award.description}</p>

            <div className="space-y-2">
              {award.presentedBy && (
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">
                    Presented By
                  </Badge>
                  <span className="text-sm">{award.presentedBy}</span>
                </div>
              )}

              {award.location && (
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">
                    Location
                  </Badge>
                  <span className="text-sm">{award.location}</span>
                </div>
              )}

              {award.operation && (
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">
                    Operation
                  </Badge>
                  <span className="text-sm">{award.operation}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {award.citation && (
          <div className="mt-4 border-t border-gray-200 dark:border-zinc-700 pt-4">
            <h4 className="font-medium mb-2">Citation</h4>
            <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-md text-sm italic">"{award.citation}"</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
