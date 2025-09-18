'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ServiceAreaSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

// This should come from an API or database
const moroccanCities = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kenitra',
  'Tétouan',
]

export function ServiceAreaSelector({
  value = [],
  onChange,
  disabled = false,
}: ServiceAreaSelectorProps) {
  const t = useTranslations('profile')

  const handleAddCity = (city: string) => {
    if (!value.includes(city)) {
      onChange([...value, city])
    }
  }

  const handleRemoveCity = (city: string) => {
    onChange(value.filter((v) => v !== city))
  }

  const availableCities = moroccanCities.filter((city) => !value.includes(city))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('serviceAreas')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          onValueChange={handleAddCity}
          disabled={disabled || availableCities.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('selectCity')} />
          </SelectTrigger>
          <SelectContent>
            {availableCities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2">
          {value.map((city) => (
            <Badge key={city} variant="secondary">
              {city}
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => handleRemoveCity(city)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
