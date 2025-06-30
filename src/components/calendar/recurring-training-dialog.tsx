"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createRecurringTraining } from "@/app/calendar/recurring-actions"
import { toast } from "sonner"

interface RecurringTrainingDialogProps {
  onSuccess: () => void
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

export function RecurringTrainingDialog({ onSuccess }: RecurringTrainingDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dayOfWeek: "",
    time: "",
    location: "",
    instructor: "",
    maxPersonnel: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.dayOfWeek || !formData.time || !formData.location) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      await createRecurringTraining({
        name: formData.name,
        description: formData.description,
        dayOfWeek: Number.parseInt(formData.dayOfWeek),
        time: formData.time,
        location: formData.location,
        instructor: formData.instructor || undefined,
        maxPersonnel: formData.maxPersonnel ? Number.parseInt(formData.maxPersonnel) : undefined,
      })

      toast.success("Recurring training created successfully!")
      setFormData({
        name: "",
        description: "",
        dayOfWeek: "",
        time: "",
        location: "",
        instructor: "",
        maxPersonnel: "",
      })
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Failed to create recurring training:", error)
      toast.error("Failed to create recurring training")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Add Recurring Training
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Recurring Training</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Training Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Weekly Flight Training"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this training covers..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day of Week *</Label>
              <Select
                value={formData.dayOfWeek}
                onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Training Room A"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="e.g., John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPersonnel">Max Personnel</Label>
              <Input
                id="maxPersonnel"
                type="number"
                min="1"
                value={formData.maxPersonnel}
                onChange={(e) => setFormData({ ...formData, maxPersonnel: e.target.value })}
                placeholder="e.g., 20"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-black" disabled={loading}>
              {loading ? "Creating..." : "Create Recurring Training"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
