'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, Desktop, Mail, Volume2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { TimeInput } from '@/components/ui/time-input'
import { useToast } from '@/components/ui/use-toast'
import { useServiceWorker } from '@/hooks/use-service-worker'
import type { NotificationPreferences } from '@/lib/types/preferences'

const notificationSchema = z.object({
  categories: z.object({
    request_status: z.boolean(),
    request_messages: z.boolean(),
    request_documents: z.boolean(),
    system_updates: z.boolean(),
  }),
  soundsEnabled: z.boolean(),
  desktopEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string(),
    end: z.string(),
    timezone: z.string(),
  }),
})

type FormValues = z.infer<typeof notificationSchema>

interface NotificationSettingsProps {
  preferences: NotificationPreferences
}

export function NotificationSettings({ preferences }: NotificationSettingsProps) {
  const t = useTranslations('settings.notifications')
  const { toast } = useToast()
  const { subscription, supported, subscribe, unsubscribe } = useServiceWorker()

  const form = useForm<FormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      categories: preferences.categories,
      soundsEnabled: preferences.soundsEnabled,
      desktopEnabled: preferences.desktopEnabled,
      emailEnabled: preferences.emailEnabled,
      quietHours: preferences.quietHours,
    },
  })

  // Watch desktop notifications toggle
  const desktopEnabled = form.watch('desktopEnabled')

  // Handle desktop notification permission
  useEffect(() => {
    if (desktopEnabled && supported && !subscription) {
      subscribe()
    } else if (!desktopEnabled && subscription) {
      unsubscribe()
    }
  }, [desktopEnabled, supported, subscription, subscribe, unsubscribe])

  async function onSubmit(data: FormValues) {
    try {
      const response = await fetch('/api/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save preferences')

      toast({
        title: t('success.title'),
        description: t('success.description'),
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        variant: 'destructive',
        title: t('error.title'),
        description: t('error.save'),
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('categories.title')}</CardTitle>
            <CardDescription>{t('categories.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="categories.request_status"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('categories.request_status.title')}
                    </FormLabel>
                    <FormDescription>
                      {t('categories.request_status.description')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Similar FormFields for other categories */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('channels.title')}</CardTitle>
            <CardDescription>{t('channels.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="desktopEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <Desktop className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('channels.desktop.title')}
                      </FormLabel>
                      <FormDescription>
                        {t('channels.desktop.description')}
                      </FormDescription>
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!supported}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('channels.email.title')}
                      </FormLabel>
                      <FormDescription>
                        {t('channels.email.description')}
                      </FormDescription>
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="soundsEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('channels.sounds.title')}
                      </FormLabel>
                      <FormDescription>
                        {t('channels.sounds.description')}
                      </FormDescription>
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('quietHours.title')}</CardTitle>
            <CardDescription>{t('quietHours.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="quietHours.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('quietHours.enable')}
                      </FormLabel>
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('quietHours.enabled') && (
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="quietHours.start"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t('quietHours.start')}</FormLabel>
                      <FormControl>
                        <TimeInput {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quietHours.end"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t('quietHours.end')}</FormLabel>
                      <FormControl>
                        <TimeInput {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            {t('save')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
