import { RequestStatus, type RequestRecord } from '@/lib/validations/request'
import { User } from '@supabase/supabase-js'

export type RequestAction = 'update_status' | 'cancel' | 'delete' | 'assign_huissier'

type StatusTransition = {
  from: RequestStatus
  to: RequestStatus[]
}

const huissierStatusFlow: StatusTransition[] = [
  { from: 'PENDING', to: ['ACCEPTED', 'REJECTED'] },
  { from: 'ACCEPTED', to: ['IN_PROGRESS'] },
  { from: 'IN_PROGRESS', to: ['COMPLETED'] }
]

const userStatusFlow: StatusTransition[] = [
  { from: 'PENDING', to: ['CANCELLED'] },
  { from: 'REJECTED', to: ['CANCELLED'] }
]

/**
 * Check if a user has permission to perform an action on a request
 */
export function checkRequestPermission(
  request: RequestRecord,
  user: User,
  action: RequestAction,
  params?: {
    newStatus?: RequestStatus
  }
): {
  allowed: boolean
  reason?: string
} {
  // Basic ownership check
  const isOwner = request.userId === user.id
  const isAssignedHuissier = request.huissierId === user.id

  if (!isOwner && !isAssignedHuissier) {
    return {
      allowed: false,
      reason: 'You do not have permission to perform this action'
    }
  }

  switch (action) {
    case 'update_status': {
      const newStatus = params?.newStatus
      if (!newStatus) {
        return {
          allowed: false,
          reason: 'New status is required'
        }
      }

      // Get allowed transitions based on user role
      const statusFlow = isAssignedHuissier ? huissierStatusFlow : userStatusFlow
      const allowedTransitions = statusFlow.find(t => t.from === request.status)

      if (!allowedTransitions) {
        return {
          allowed: false,
          reason: 'Current status cannot be updated'
        }
      }

      if (!allowedTransitions.to.includes(newStatus)) {
        return {
          allowed: false,
          reason: `Cannot change status from ${request.status} to ${newStatus}`
        }
      }

      return { allowed: true }
    }

    case 'cancel':
      if (!isOwner) {
        return {
          allowed: false,
          reason: 'Only the request owner can cancel'
        }
      }

      if (['ACCEPTED', 'IN_PROGRESS'].includes(request.status)) {
        return {
          allowed: false,
          reason: 'Cannot cancel a request that is already in progress'
        }
      }

      return { allowed: true }

    case 'delete':
      // Only allow deletion of draft or cancelled requests by owner
      if (!isOwner) {
        return {
          allowed: false,
          reason: 'Only the request owner can delete'
        }
      }

      if (!['DRAFT', 'CANCELLED'].includes(request.status)) {
        return {
          allowed: false,
          reason: 'Only draft or cancelled requests can be deleted'
        }
      }

      return { allowed: true }

    case 'assign_huissier':
      // Only pending requests can be assigned
      if (request.status !== 'PENDING') {
        return {
          allowed: false,
          reason: 'Only pending requests can be assigned'
        }
      }

      // Only owner can assign huissier
      if (!isOwner) {
        return {
          allowed: false,
          reason: 'Only the request owner can assign a huissier'
        }
      }

      return { allowed: true }

    default:
      return {
        allowed: false,
        reason: 'Unknown action'
      }
  }
}
