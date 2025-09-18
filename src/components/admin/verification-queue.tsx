'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { createClient } from '@supabase/supabase-js'
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"
// Types
type VerificationStatus = "approved" | "rejected" | "pending"

interface DocumentWithUser {
  id: string
  type: string
  url: string
  verified: boolean
  verification_status: VerificationStatus
  verified_at?: string
  verified_by?: string
  user?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  } | null
}

interface VerificationItemProps {
  document: DocumentWithUser
  onVerify: (id: string, status: "approved" | "rejected") => Promise<void>
}

function VerificationItem({ document, onVerify }: VerificationItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('admin')

  const handleVerify = async (status: "approved" | "rejected") => {
    try {
      setIsLoading(true)
      await onVerify(document.id, status)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={document.user?.avatar_url} alt={document.user?.full_name} />
              <AvatarFallback>{document.user?.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{document.user?.full_name}</p>
              <p className="text-sm text-muted-foreground">{document.user?.email}</p>
            </div>
          </div>
          <Badge variant={document.type === "license" ? "default" : "secondary"}>
            {document.type}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Document Preview */}
        <div className="aspect-video w-full overflow-hidden rounded-md">
          <img
            src={document.url}
            alt={`${document.type} document`}
            className="h-full w-full object-cover"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="destructive"
          disabled={isLoading}
          onClick={() => handleVerify("rejected")}
        >
          {t('reject')}
        </Button>
        <Button
          disabled={isLoading}
          onClick={() => handleVerify("approved")}
        >
          {t('approve')}
        </Button>
      </CardFooter>
    </Card>
  )
}

export function VerificationQueue() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const t = useTranslations('admin')
  const [documents, setDocuments] = useState<DocumentWithUser[]>([])

  // Fetch unverified documents on component mount
  useEffect(() => {
    fetchUnverifiedDocuments()
  }, [])

  // Fetch unverified documents
  async function fetchUnverifiedDocuments() {
    const { data, error } = await supabase
      .from("documents")
      .select('*, user:profiles(*)')
      .eq("verification_status", "pending")
      .order("created_at", { ascending: true })

    if (error) {
      toast.error(t('fetchError'))
      return
    }

    setDocuments(data || [])
  }

  // Handle verification
  const handleVerify = async (id: string, status: "approved" | "rejected") => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error("Authentication required")
      }

      const { error: updateError } = await supabase
        .from('documents')
        .update({
          verified: status === "approved",
          verification_status: status,
          verified_at: new Date().toISOString(),
          verified_by: user.id
        } satisfies Partial<DocumentWithUser>)
        .eq('id', id)
        .single()

      if (updateError) throw updateError

      // Refresh documents
      await fetchUnverifiedDocuments()
      toast.success(
        status === "approved"
          ? t('documentApproved')
          : t('documentRejected')
      )
    } catch (error) {
      console.error('Verification error:', error)
      toast.error(t('verificationError'))
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <VerificationItem
          key={doc.id}
          document={doc}
          onVerify={handleVerify}
        />
      ))}
    </div>
  )
}
