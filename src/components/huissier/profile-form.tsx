'use client'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { huissierProfileSchema } from '@/lib/validations/huissier'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { DocumentUpload } from './document-upload'
import { ServiceAreaSelector } from './service-area-selector'
import { WorkingHoursEditor } from './working-hours-editor'

type ProfileFormValues = z.infer<typeof huissierProfileSchema>

interface ProfileFormProps {
  initialData?: Partial<ProfileFormValues>
  userId: string
}

export function ProfileForm({ initialData, userId }: ProfileFormProps) {
  const t = useTranslations('profile')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(huissierProfileSchema),
    defaultValues: {
      userId,
      ...initialData,
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsLoading(true)

      const { error } = await supabase
        .from('huissier_profiles')
        .upsert({
          ...data,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success(t('profileUpdated'))
    } catch (error) {
      toast.error(t('error'))
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fullName')}</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="licenseNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('licenseNumber')}</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone')}</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('address')}</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('about')}</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <WorkingHoursEditor
          value={form.watch('workingHours')}
          onChange={(hours) => form.setValue('workingHours', hours)}
          disabled={isLoading}
        />

        <ServiceAreaSelector
          value={form.watch('serviceAreas')}
          onChange={(areas) => form.setValue('serviceAreas', areas)}
          disabled={isLoading}
        />

        <DocumentUpload
          value={form.watch('documents')}
          onChange={(docs) => form.setValue('documents', docs)}
          disabled={isLoading}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('saving') : t('saveChanges')}
        </Button>
      </form>
    </Form>
  )
}
