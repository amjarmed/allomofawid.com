import { RequestDetail } from '@/components/requests/request-detail'
import { getRequest } from '@/lib/api/requests'
import { notFound } from 'next/navigation'

type Props = {
  params: { id: string }
}

export default async function RequestDetailPage({ params }: Props) {
  try {
    await getRequest(params.id) // Pre-fetch for SSR
    return <RequestDetail requestId={params.id} />
  } catch (error) {
    notFound()
  }
}
