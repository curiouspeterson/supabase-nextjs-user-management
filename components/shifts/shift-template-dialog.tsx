'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface ShiftTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: {
    id: string
    name: string
    startTime: string
    endTime: string
    type: string
    staffingRequirements: {
      dispatchers: number
      supervisors: number
    }
    daysOfWeek: string[]
    color: string
  }
}

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const shiftTypes = ['Regular', 'Overtime', 'Training', 'Relief']

export function ShiftTemplateDialog({
  open,
  onOpenChange,
  template,
}: ShiftTemplateDialogProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(
    template?.daysOfWeek || []
  )

  const isEditing = !!template

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Shift Template' : 'Create Shift Template'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Make changes to the shift template here.'
              : 'Add a new shift template to define scheduling patterns.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              defaultValue={template?.name}
              placeholder="e.g., Day Shift Early"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                defaultValue={template?.startTime}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                defaultValue={template?.endTime}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select defaultValue={template?.type || 'Regular'}>
              <SelectTrigger>
                <SelectValue placeholder="Select shift type" />
              </SelectTrigger>
              <SelectContent>
                {shiftTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dispatchers">Dispatchers</Label>
              <Input
                id="dispatchers"
                type="number"
                min="0"
                defaultValue={template?.staffingRequirements.dispatchers}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supervisors">Supervisors</Label>
              <Input
                id="supervisors"
                type="number"
                min="0"
                defaultValue={template?.staffingRequirements.supervisors}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Days of Week</Label>
            <div className="grid grid-cols-2 gap-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={selectedDays.includes(day)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDays([...selectedDays, day])
                      } else {
                        setSelectedDays(selectedDays.filter((d) => d !== day))
                      }
                    }}
                  />
                  <Label htmlFor={day} className="text-sm font-normal">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              defaultValue={template?.color}
              className="h-10 px-2 py-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Save Changes' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 