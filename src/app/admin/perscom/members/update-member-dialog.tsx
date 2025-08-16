'use client'

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { PerscomUserResponse } from "@/types/api/perscomApi"
import { fetchMemberUpdateData, updateMember, UpdateMemberData } from "./action"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import Image from "next/image";

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
  const [data, setData] = useState<UpdateMemberData>({ units: [], positions: [], ranks: [], awards: [], qualifications: [] })
  const { data: session } = useSession()

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
            award_id: Number(formData.get('awardId')),
            text: formData.get('awardText'),
            user_id: member?.id,
            author_id: session?.user.perscomId
          }
          break
        case 'combat':
          payload.combatRecord = {
            description: formData.get('combatDescription'),
            date: formData.get('combatDate'),
            user_id: member?.id,
            author_id: session?.user.perscomId
          }
          break
        case 'rank':
          payload.rank = {
            rank_id: Number(formData.get('rankId')),
            text: formData.get('rankText'),
            user_id: member?.id,
            author_id: session?.user.perscomId
          }
          break
        case 'assignment':
          payload.assignment = {
            unit_id: Number(formData.get('unitId')),
            position_id: Number(formData.get('positionId')),
            text: formData.get('assignmentText'),
            user_id: member?.id,
            author_id: session?.user.perscomId
          }
          break
        case 'qualification':
          payload.qualification = {
            qualification_id: Number(formData.get('qualificationId')),
            text: formData.get('qualificationText'),
            user_id: member?.id,
            author_id: session?.user.perscomId
          }
          break
        case 'unit':
          payload.unit = {
            unit_id: Number(formData.get('unitId')),
            text: formData.get('unitText'),
            user_id: member?.id,
            author_id: session?.user.perscomId
          }
          break
      }

      await updateMember({type: selectedTab, data: payload})
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
    <Dialog open={open} onOpenChange={onOpenChangeAction} modal={true}>
      <DialogContent className="w-[90vw] md:w-[50vw] !max-w-none overflow-hidden">
        <DialogHeader>
          <DialogTitle>Update Member - {member?.name}</DialogTitle>
          <DialogDescription>
            Modify member information by selecting a category below and filling in the required details.
          </DialogDescription>
        </DialogHeader>

        <div
          role="tablist"
          aria-label="Member update options"
          className="flex flex-wrap gap-2 mb-6"
        >
          {['award', 'combat', 'rank', 'assignment', 'qualification', 'unit'].map((tab) => (
            <Button
              key={tab}
              variant={selectedTab === tab ? 'default' : 'outline'}
              onClick={() => setSelectedTab(tab as any)}
              className="capitalize text-xs sm:text-sm"
              role="tab"
              id={`${tab}-tab`}
              aria-selected={selectedTab === tab}
              aria-controls={`${tab}-panel`}
            >
              {tab}
            </Button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            role="tabpanel"
            id={`${selectedTab}-panel`}
            aria-labelledby={`${selectedTab}-tab`}
          >
            {selectedTab === 'award' && (
              <div className="space-y-4">
                <Select name="awardId" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Award" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {data.awards.map((award) => (
                      <SelectItem
                        key={award.id}
                        value={award.id.toString()}
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={award.image?.image_url || "/placeholder.svg"}
                            alt=""
                            className={cn(
                              "h-8 w-8 object-contain",
                              !award.image?.image_url && "bg-gray-100 dark:bg-zinc-800 p-1"
                            )}
                            width={32}
                            height={32}
                          />
                          <span>{award.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  name="awardText"
                  placeholder="Award Citation"
                  className="min-h-[100px]"
                  aria-label="Award citation text"
                />
              </div>
            )}

            {selectedTab === 'combat' && (
              <div className="space-y-4">
                <Textarea
                  name="combatDescription"
                  placeholder="Combat Record Description"
                  required
                  className="min-h-[100px]"
                  aria-label="Combat record description"
                />
                <Input
                  name="combatDate"
                  type="date"
                  required
                  aria-label="Combat record date"
                />
              </div>
            )}

            {selectedTab === 'rank' && (
              <div className="space-y-4">
                <Select name="rankId" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Rank" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {data.ranks.map((rank) => (
                      <SelectItem
                        key={rank.id}
                        value={rank.id.toString()}
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={rank.image?.image_url || "/placeholder.svg"}
                            alt=""
                            className={cn(
                              "h-8 w-8 object-contain",
                              !rank.image?.image_url && "bg-gray-100 dark:bg-zinc-800 p-1"
                            )}
                            width={32}
                            height={32}
                          />
                          <span>{rank.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  name="rankText"
                  placeholder="Promotion Citation"
                  className="min-h-[100px]"
                  aria-label="Rank promotion citation"
                />
              </div>
            )}

            {selectedTab === 'assignment' && (
              <div className="space-y-4">
                <Select name="unitId" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {data.units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select name="positionId" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Position" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {data.positions.map((position) => (
                      <SelectItem key={position.id} value={position.id.toString()}>
                        {position.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  name="assignmentText"
                  placeholder="Assignment Notes"
                  className="min-h-[100px]"
                  aria-label="Assignment notes"
                />
              </div>
            )}

            {selectedTab === 'qualification' && (
              <div className="space-y-4">
                <Select name="qualificationId" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Qualification" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {data.qualifications.map((qual) => (
                      <SelectItem
                        key={qual.id}
                        value={qual.id.toString()}
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={qual.image?.image_url || "/placeholder.svg"}
                            alt=""
                            className={cn(
                              "h-8 w-8 object-contain",
                              !qual.image?.image_url && "bg-gray-100 dark:bg-zinc-800 p-1"
                            )}
                            width={32}
                            height={32}
                          />
                          <span>{qual.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  name="qualificationText"
                  placeholder="Qualification Notes"
                  className="min-h-[100px]"
                  aria-label="Qualification notes"
                />
              </div>
            )}

            {selectedTab === 'unit' && (
              <div className="space-y-4">
                <Select name="unitId" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {data.units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  name="unitText"
                  placeholder="Unit Assignment Notes"
                  className="min-h-[100px]"
                  aria-label="Unit assignment notes"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChangeAction(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}