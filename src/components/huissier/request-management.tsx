'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Request {
  id: string
  created_at: string
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  client: {
    full_name: string
    phone: string
    email: string
  }
  description: string
  urgency: 'normal' | 'urgent'
}

export function RequestManagement() {
  const t = useTranslations('requests')
  const [requests, setRequests] = useState<Request[]>([])
  const [status, setStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [status])

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('requests')
        .select('*, client:profiles(*)')
        .order('created_at', { ascending: false })

      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error

      setRequests(data as Request[])
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error(t('fetchError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (requestId: string, newStatus: Request['status']) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', requestId)

      if (error) throw error

      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      )

      toast.success(t('statusUpdated'))
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(t('updateError'))
    }
  }

  const filteredRequests = requests.filter((request) =>
    request.client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusColors = {
    pending: 'bg-yellow-500',
    accepted: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('requests')}</CardTitle>
        <CardDescription>{t('requestsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Select
            value={status}
            onValueChange={setStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="pending">{t('pending')}</SelectItem>
              <SelectItem value="accepted">{t('accepted')}</SelectItem>
              <SelectItem value="completed">{t('completed')}</SelectItem>
              <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('client')}</TableHead>
                <TableHead>{t('description')}</TableHead>
                <TableHead>{t('urgency')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {t('loading')}
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {t('noRequests')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {format(new Date(request.created_at), 'PP')}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{request.client.full_name}</div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(`tel:${request.client.phone}`)}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(`mailto:${request.client.email}`)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              window.open(
                                `https://wa.me/${request.client.phone.replace(
                                  /\D/g,
                                  ''
                                )}`
                              )
                            }
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{request.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant={request.urgency === 'urgent' ? 'destructive' : 'secondary'}
                      >
                        {t(request.urgency)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={statusColors[request.status]}
                      >
                        {t(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.status}
                        onValueChange={(value: Request['status']) =>
                          handleStatusChange(request.id, value)
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t('pending')}</SelectItem>
                          <SelectItem value="accepted">{t('accepted')}</SelectItem>
                          <SelectItem value="completed">{t('completed')}</SelectItem>
                          <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
