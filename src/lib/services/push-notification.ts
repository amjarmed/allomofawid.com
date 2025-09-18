import { createClient } from '@/lib/supabase/server';
import { type NotificationPayload } from '@/lib/types';
import webPush from 'web-push';

// VAPID keys should be set in environment variables
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
}

webPush.setVapidDetails(
  'mailto:notifications@allomofawid.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
) {
  try {
    await webPush.sendNotification(
      subscription,
      JSON.stringify(payload)
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error }
  }
}

export async function saveSubscription(
  userId: string,
  subscription: PushSubscription
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: userId,
      subscription: subscription,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error

  return { success: true }
}

export async function removeSubscription(userId: string, endpoint: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .match({ user_id: userId })
    .eq('subscription->endpoint', endpoint)

  if (error) throw error

  return { success: true }
}

export async function getUserSubscriptions(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId)

  if (error) throw error

  return data?.map(row => row.subscription as PushSubscription) || []
}

export async function notifyUser(
  userId: string,
  payload: NotificationPayload
) {
  const subscriptions = await getUserSubscriptions(userId)

  const results = await Promise.all(
    subscriptions.map(subscription =>
      sendPushNotification(subscription, payload)
    )
  )

  return {
    success: results.some(r => r.success),
    failures: results.filter(r => !r.success).length,
  }
}
