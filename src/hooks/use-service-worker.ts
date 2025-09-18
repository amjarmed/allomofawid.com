'use client'

import { useToast } from '@/components/ui/use-toast'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

interface SubscriptionState {
  subscription: PushSubscription | null
  loading: boolean
  supported: boolean
  error: string | null
}

export function useServiceWorker() {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    subscription: null,
    loading: true,
    supported: true,
    error: null,
  })
  const { toast } = useToast()
  const t = useTranslations('notifications')

  useEffect(() => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSubscriptionState(prev => ({
        ...prev,
        loading: false,
        supported: false,
        error: 'Push notifications are not supported'
      }))
      return
    }

    async function registerAndSubscribe() {
      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        // Check for existing subscription
        const subscription = await registration.pushManager.getSubscription()

        setSubscriptionState(prev => ({
          ...prev,
          subscription,
          loading: false
        }))
      } catch (error) {
        console.error('Error registering service worker:', error)
        setSubscriptionState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to register service worker'
        }))
      }
    }

    registerAndSubscribe()
  }, [])

  // Subscribe to push notifications
  const subscribe = async () => {
    try {
      setSubscriptionState(prev => ({ ...prev, loading: true }))

      // Get the service worker registration
      const registration = await navigator.serviceWorker.ready

      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Get public VAPID key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not found')
      }

      // Convert VAPID key to Uint8Array
      const key = urlBase64ToUint8Array(vapidPublicKey)

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key
      })

      // Save subscription to backend
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON())
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setSubscriptionState(prev => ({
        ...prev,
        subscription,
        loading: false,
        error: null
      }))

      toast({
        title: t('subscribed.title'),
        description: t('subscribed.description'),
      })
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      setSubscriptionState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))

      toast({
        variant: 'destructive',
        title: t('error.title'),
        description: t('error.subscribe'),
      })
    }
  }

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    try {
      setSubscriptionState(prev => ({ ...prev, loading: true }))

      if (!subscriptionState.subscription) {
        throw new Error('No active subscription')
      }

      // Unsubscribe from push manager
      await subscriptionState.subscription.unsubscribe()

      // Remove subscription from backend
      const response = await fetch(`/api/push-subscription?endpoint=${
        encodeURIComponent(subscriptionState.subscription.endpoint)
      }`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove subscription')
      }

      setSubscriptionState(prev => ({
        ...prev,
        subscription: null,
        loading: false,
        error: null
      }))

      toast({
        title: t('unsubscribed.title'),
        description: t('unsubscribed.description'),
      })
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      setSubscriptionState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))

      toast({
        variant: 'destructive',
        title: t('error.title'),
        description: t('error.unsubscribe'),
      })
    }
  }

  return {
    ...subscriptionState,
    subscribe,
    unsubscribe
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
