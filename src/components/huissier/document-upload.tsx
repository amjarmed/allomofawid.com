'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

interface Document {
  type: 'license' | 'id' | 'other'
  url: string
  verified: boolean
}

interface DocumentUploadProps {
  value: Document[]
  onChange: (value: Document[]) => void
  disabled?: boolean
}

export function DocumentUpload({
  value = [],
  onChange,
  disabled = false,
}: DocumentUploadProps) {
  const t = useTranslations('profile')
  const [isUploading, setIsUploading] = useState(false)
  const [documentType, setDocumentType] = useState<Document['type']>('license')
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(`${Date.now()}-${file.name}`, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) throw error

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(data.path)

      // Add to documents list
      const newDocument: Document = {
        type: documentType,
        url: publicUrl,
        verified: false,
      }

      onChange([...value, newDocument])
      toast.success(t('documentUploaded'))
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(t('uploadError'))
    } finally {
      setIsUploading(false)
      e.target.value = '' // Reset input
    }
  }

  const handleRemoveDocument = async (url: string) => {
    try {
      // Extract path from URL
      const path = url.split('/').pop()
      if (!path) return

      // Delete from storage
      const { error } = await supabase.storage.from('documents').remove([path])
      if (error) throw error

      // Remove from list
      onChange(value.filter((doc) => doc.url !== url))
      toast.success(t('documentRemoved'))
    } catch (error) {
      console.error('Remove error:', error)
      toast.error(t('removeError'))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('documents')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Select
              value={documentType}
              onValueChange={(value: Document['type']) => setDocumentType(value)}
              disabled={disabled || isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectDocumentType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="license">{t('license')}</SelectItem>
                <SelectItem value="id">{t('id')}</SelectItem>
                <SelectItem value="other">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
              className="hidden"
              id="document-upload"
            />
            <Label htmlFor="document-upload" className="w-full">
              <Button
                variant="outline"
                className="w-full"
                disabled={disabled || isUploading}
                asChild
              >
                <span>
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {t('uploadDocument')}
                </span>
              </Button>
            </Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {value.map((doc) => (
            <Badge
              key={doc.url}
              variant={doc.verified ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {t(doc.type)}
              {doc.verified && <span className="text-xs">✓</span>}
              {!disabled && !doc.verified && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveDocument(doc.url)}
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
