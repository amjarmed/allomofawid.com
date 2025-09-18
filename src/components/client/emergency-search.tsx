'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { HuissierCard } from './huissier-card'

interface Huissier {
  id: string
  name: string
  email: string | null
  phone: string
  whatsapp: string | null
  office_address: string
  city: string
  distance: number
  is_verified: boolean
  rating: number | null
}

interface NearbyHuissiersResponse {
  huissiers: Huissier[]
  total: number
}
interface Huissier {
  id: string
  name: string
  email: string | null
  phone: string
  whatsapp: string | null
  office_address: string
  city: string
  distance: number
  is_verified: boolean
  rating: number | null
}

interface NearbyHuissiersResponse {
  huissiers: Huissier[]
  total: number
}

export function EmergencySearch() {
  const t = useTranslations('emergency')

  const {
    location,
    error,
    loading,
    requestPermission,
    supported
  } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 10000,
    onPermissionDenied: () => {
      toast.error(t('errors.permissionDenied'), {
        description: t('errors.permissionDeniedDescription'),
        action: {
          label: t('actions.settings'),
          onClick: () => window.open('chrome://settings/content/location')
        }
      })
    }
  })

  const { data: nearbyHuissiers, isLoading: isLoadingHuissiers } = useQuery({
    queryKey: ['nearbyHuissiers', location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location) return null
      const res = await fetch(
        `/api/huissiers/nearby?lat=${location.latitude}&lng=${location.longitude}`
      )
      if (!res.ok) throw new Error('Failed to fetch nearby huissiers')
      return res.json()
    },
    enabled: !!location,
  })
  if (!supported) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t('errors.locationNotSupported')}</AlertTitle>
        <AlertDescription>
          {t('errors.locationNotSupportedDescription')}
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t(`errors.${error.type}`)}</AlertTitle>
        <AlertDescription>
          {t(`errors.${error.type}Description`)}
          {error.type === 'PERMISSION_DENIED' && (
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => requestPermission()}
            >
              {t('actions.requestPermission')}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full max-w-md p-6 text-center shadow-lg">
      <div className="space-y-4">
        <Button
          size="lg"
          className="w-full"
          onClick={() => requestPermission()}
          disabled={loading || isLoadingHuissiers}
        >
          {loading || isLoadingHuissiers ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="mr-2 h-4 w-4" />
          )}
          {t('actions.findNearestHuissier')}
        </Button>

        {nearbyHuissiers?.huissiers?.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('foundHuissiers', { count: nearbyHuissiers.huissiers.length })}
            </p>
            {nearbyHuissiers.huissiers.map((huissier) => (
              <HuissierCard
                key={huissier.id}
                huissier={huissier}
              />
            ))}
          </div>
        ) : nearbyHuissiers && (
          <Alert>
            <AlertTitle>{t('noHuissiersFound')}</AlertTitle>
            <AlertDescription>
              {t('noHuissiersFoundDescription')}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
      <h2 className="mb-6 text-2xl font-bold">{t('needHelpNow')}</h2>
      <Button
        size="lg"
        className="w-full gap-2"
        onClick={handleEmergencySearch}
        disabled={isLocating}
      >
        <MapPin className="h-5 w-5" />
        {isLocating ? t('locating') : t('findNearestHuissier')}
      </Button>
      <p className="mt-4 text-sm text-muted-foreground">
        {t('locationPermissionNote')}
      </p>
    </Card>
  )
}
