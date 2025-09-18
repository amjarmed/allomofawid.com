'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { FileUpload } from '@/components/ui/file-upload'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RequestStatusEnum, updateRequestStatusSchema } from '@/lib/validations/request'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { useForm } from 'react-hook-form'

interface StatusUpdateFormProps {
  requestId: string
  currentStatus: string
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    status: string
    note?: string
    attachments?: { name: string; url: string; type: string }[]
  }) => Promise<void>
}

export function StatusUpdateForm({
  requestId,
  currentStatus,
  isOpen,
  onClose,
  onSubmit,
}: StatusUpdateFormProps) {
  const t = useTranslations('requests')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm({
    resolver: zodResolver(updateRequestStatusSchema.omit({ requestId: true })),
    defaultValues: {
      status: currentStatus,
      note: '',
      attachments: [],
    },
  })

  const handleSubmit = async (values: {
    status: string
    note?: string
    attachments?: { name: string; url: string; type: string }[]
  }) => {
    try {
      setIsSubmitting(true)
      await onSubmit(values)
      form.reset()
      onClose()
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get available status transitions based on current status
  const getAvailableStatuses = (current: string) => {
    switch (current) {
      case RequestStatusEnum.PENDING:
        return [RequestStatusEnum.ACCEPTED, RequestStatusEnum.REJECTED]
      case RequestStatusEnum.ACCEPTED:
        return [RequestStatusEnum.IN_PROGRESS, RequestStatusEnum.CANCELLED]
      case RequestStatusEnum.IN_PROGRESS:
        return [RequestStatusEnum.COMPLETED, RequestStatusEnum.CANCELLED]
      default:
        return []
    }
  }

  const availableStatuses = getAvailableStatuses(currentStatus)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('updateStatus')}</DialogTitle>
          <DialogDescription>{t('updateStatusDesc')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('status.label')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={availableStatuses.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('status.select')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`status.${status.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('status.note')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('status.notePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('status.attachments')}</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value}
                      onChange={field.onChange}
                      maxFiles={3}
                      acceptedTypes={{
                        'application/pdf': ['.pdf'],
                        'image/*': ['.png', '.jpg', '.jpeg'],
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('updating') : t('update')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
