'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FileIcon, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  value?: { name: string; url: string; type: string }[]
  onChange?: (files: { name: string; url: string; type: string }[]) => void
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: Record<string, string[]>
  className?: string
}

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg'],
  },
  className,
}: FileUploadProps) {
  const t = useTranslations('common')
  const [isUploading, setIsUploading] = React.useState(false)

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      if (!onChange) return

      try {
        setIsUploading(true)

        // Here you would normally upload to your storage service
        // For now, we'll just create object URLs
        const newFiles = acceptedFiles.map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
        }))

        onChange([...value, ...newFiles].slice(0, maxFiles))
      } catch (error) {
        console.error('Failed to upload files:', error)
      } finally {
        setIsUploading(false)
      }
    },
    [maxFiles, onChange, value]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - value.length,
    maxSize,
    accept: acceptedTypes,
    disabled: value.length >= maxFiles || isUploading,
  })

  const removeFile = (index: number) => {
    if (!onChange) return
    const newFiles = [...value]
    newFiles.splice(index, 1)
    onChange(newFiles)
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          value.length >= maxFiles && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-sm text-muted-foreground">{t('dropFilesHere')}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {value.length >= maxFiles
              ? t('maxFilesReached', { count: maxFiles })
              : t('dragAndDrop')}
          </p>
        )}
      </div>

      {value.length > 0 && (
        <ul className="mt-4 space-y-2">
          {value.map((file, index) => (
            <li
              key={file.url}
              className="flex items-center justify-between p-2 rounded-lg bg-muted"
            >
              <div className="flex items-center space-x-2">
                <FileIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate max-w-[200px]">
                  {file.name}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t('remove')}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
