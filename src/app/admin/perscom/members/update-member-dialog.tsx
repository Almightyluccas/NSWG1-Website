'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { PerscomUserResponse } from "@/types/perscomApi"
import { fetchMemberUpdateData } from "./action"

interface UpdateMemberDialogProps {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  member: PerscomUserResponse | null
}

export function UpdateMemberDialog({
  open,
  onOpenChangeAction,
  member,
}: UpdateMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'award' | 'combat' | 'rank' | 'assignment' | 'qualification' | 'unit'>('award')
  const [data, setData] = useState<{
    units: { id: number; name: string }[];
    positions: { id: number; name: string }[];
    ranks: { id: number; name: string }[];
  }>({ units: [], positions: [], ranks: [] })

  useEffect(() => {
    if (open) {
      fetchMemberUpdateData()
        .then(setData)
        .catch(() => toast.error('Failed to load data'))
    }
  }, [open])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.target as HTMLFormElement)
      const payload: any = {}

      switch (selectedTab) {
        case 'award':
          payload.award = {
            name: formData.get('awardName'),
            description: formData.get('awardDescription')
          }
          break
        case 'combat':
          payload.combatRecord = {
            description: formData.get('combatDescription'),
            date: formData.get('combatDate')
          }
          break
        // Add other cases for remaining tabs
      }

      const response = await fetch(`/api/perscom/members/${member?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update member')

      toast.success('Member updated successfully')
      onOpenChangeAction(false)
    } catch (error) {
      toast.error('Failed to update member')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Member - {member?.name}</DialogTitle>
        </DialogHeader>

        <div className="flex space-x-4 mb-4">
          {['award', 'combat', 'rank', 'assignment', 'qualification', 'unit'].map((tab) => (
            <Button
              key={tab}
              variant={selectedTab === tab ? 'default' : 'outline'}
              onClick={() => setSelectedTab(tab as any)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedTab === 'award' && (
            <>
              <Input name="awardName" placeholder="Award Name" required />
              <Textarea name="awardDescription" placeholder="Award Description" />
            </>
          )}

          {selectedTab === 'combat' && (
            <>
              <Textarea name="combatDescription" placeholder="Combat Record Description" required />
              <Input name="combatDate" type="date" required />
            </>
          )}

          {selectedTab === 'rank' && (
            <Select name="rankId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select Rank" />
              </SelectTrigger>
              <SelectContent>
                {data.ranks.map((rank) => (
                  <SelectItem key={rank.id} value={rank.id.toString()}>
                    {rank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Add remaining tab contents */}

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChangeAction(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}