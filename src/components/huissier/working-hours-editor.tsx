'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { WorkingHoursSchema } from '@/lib/validations/huissier'
import { useTranslations } from 'next-intl'
import { z } from 'zod'

type WorkingHours = z.infer<typeof WorkingHoursSchema>

interface WorkingHoursEditorProps {
  value: WorkingHours[]
  onChange: (value: WorkingHours[]) => void
  disabled?: boolean
}

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return {
    value: `${hour}:00`,
    label: `${hour}:00`,
  }
})

export function WorkingHoursEditor({
  value = [],
  onChange,
  disabled = false,
}: WorkingHoursEditorProps) {
  const t = useTranslations('profile')

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const

  const handleToggleDay = (day: (typeof days)[number], isOpen: boolean) => {
    const updatedHours = [...value]
    const dayIndex = updatedHours.findIndex((h) => h.day === day)

    if (dayIndex === -1) {
      updatedHours.push({
        day,
        isOpen,
        start: '09:00',
        end: '17:00',
      })
    } else {
      updatedHours[dayIndex] = {
        ...updatedHours[dayIndex],
        isOpen,
      }
    }

    onChange(updatedHours)
  }

  const handleTimeChange = (
    day: (typeof days)[number],
    field: 'start' | 'end',
    time: string
  ) => {
    const updatedHours = [...value]
    const dayIndex = updatedHours.findIndex((h) => h.day === day)

    if (dayIndex === -1) {
      updatedHours.push({
        day,
        isOpen: true,
        [field]: time,
        [field === 'start' ? 'end' : 'start']: field === 'start' ? '17:00' : '09:00',
      })
    } else {
      updatedHours[dayIndex] = {
        ...updatedHours[dayIndex],
        [field]: time,
      }
    }

    onChange(updatedHours)
  }

  const getDayHours = (day: (typeof days)[number]) => {
    return value.find((h) => h.day === day) || {
      day,
      isOpen: false,
      start: '09:00',
      end: '17:00',
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('workingHours')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {days.map((day) => {
          const hours = getDayHours(day)
          return (
            <div key={day} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={hours.isOpen}
                  onCheckedChange={(checked) => handleToggleDay(day, checked)}
                  disabled={disabled}
                />
                <Label>{t(`days.${day}`)}</Label>
              </div>

              {hours.isOpen && (
                <div className="flex items-center gap-2">
                  <Select
                    value={hours.start}
                    onValueChange={(time) => handleTimeChange(day, 'start', time)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder={t('select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>-</span>
                  <Select
                    value={hours.end}
                    onValueChange={(time) => handleTimeChange(day, 'end', time)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder={t('select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
