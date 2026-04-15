
import { supabaseAdmin } from './supabase/server';
import { broadcastPushNotification } from './push';
import { Resend } from 'resend';
import { NewPostEmail } from '@/emails/NewPostEmail';
import React from 'react';

type PostType = 'program' | 'internship' | 'event';

interface NotificationPayload {
  title: string;
  message: string;
  type: PostType;
  referenceId: string;
  link: string;
  location?: string;
}

/**
 * Robust notification dispatcher that handles:
 * 1. In-App Notifications (inserted into DB)
 * 2. Push Notifications (via WebPush broadcast)
 * 3. Email Notifications (via Resend batch)
 */
export async function dispatchBroadcastNotification(payload: NotificationPayload) {
  console.log(`[NOTIF_DISPATCH] Starting broadcast for ${payload.type}: ${payload.title}`);

  try {
    // 1. Fetch all students who have opted into notifications
    const { data: subscribers, error: subError } = await supabaseAdmin
      .from('student_profiles')
      .select('user_id, email, full_name')
      .eq('is_subscribed_to_notifications', true);

    if (subError) throw new Error(`Failed to fetch subscribers: ${subError.message}`);
    if (!subscribers || subscribers.length === 0) {
      console.log('[NOTIF_DISPATCH] No subscribers found to notify.');
      return;
    }

    const subscriberIds = subscribers.map(s => s.user_id).filter(Boolean);
    console.log(`[NOTIF_DISPATCH] Found ${subscribers.length} subscribers. Target IDs:`, subscriberIds.slice(0, 5));

    // --- A. In-App Notifications ---
    const inAppNotifications = subscribers
      .filter(s => s.user_id)
      .map(s => ({
        user_id: s.user_id,
        title: `New ${payload.type.charAt(0).toUpperCase() + payload.type.slice(1)}!`,
        message: payload.message,
        type: payload.type,
        reference_id: payload.referenceId,
      }));

    if (inAppNotifications.length > 0) {
      const { error: notifError } = await supabaseAdmin
        .from('notifications')
        .insert(inAppNotifications);
      
      if (notifError) {
        console.error('[NOTIF_DISPATCH] Failed to insert in-app notifications:', notifError);
      } else {
        console.log(`[NOTIF_DISPATCH] Successfully inserted ${inAppNotifications.length} in-app notifications.`);
      }
    }

    // --- B. Push Notifications ---
    // This is async and handled by the broadcastPushNotification function
    broadcastPushNotification({
      title: payload.title,
      body: payload.message,
      url: payload.link
    }).catch(err => console.error('[NOTIF_DISPATCH] Push broadcast error:', err));

    // --- C. Email Notifications ---
    if (process.env.RESEND_API_KEY) {
      const emails = subscribers.map(s => s.email).filter(Boolean) as string[];
      
      if (emails.length > 0) {
        // Resend batch limit is 50 for BCC. Ideally we'd loop if there are more.
        // For now we'll do one batch of 50 to avoid hanging the request too long.
        const resend = new Resend(process.env.RESEND_API_KEY);
        const batchSize = 50;
        const recipientsBatch = emails.slice(0, batchSize);

        console.log(`[NOTIF_DISPATCH] Sending email batch to ${recipientsBatch.length} users.`);

        resend.emails.send({
          from: 'ZIGEX <notifications@zigexconnect.com>',
          to: 'notifications@zigexconnect.com',
          bcc: recipientsBatch,
          subject: `New ${payload.type.charAt(0).toUpperCase() + payload.type.slice(1)} Available: ${payload.title}`,
          react: React.createElement(NewPostEmail, {
            postTitle: payload.title,
            postType: payload.type.charAt(0).toUpperCase() + payload.type.slice(1),
            postLocation: payload.location || 'Remote',
            viewPostUrl: `https://zigexconnect.com${payload.link}`,
            companyLogoUrl: 'https://tmvipinvvhgklmqwvows.supabase.co/storage/v1/object/public/company-assets/Seed%20Company/events/SEED%20community%20Challenge-1757769838240.jpg',
            managePreferencesUrl: 'https://zigexconnect.com/profile/notifications',
            postedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          })
        }).catch(err => console.error('[NOTIF_DISPATCH] Email sending error:', err));
      }
    } else {
      console.warn('[NOTIF_DISPATCH] RESEND_API_KEY missing. Skipping emails.');
    }

  } catch (err) {
    console.error('[NOTIF_DISPATCH] Critical failure:', err);
  }
}
