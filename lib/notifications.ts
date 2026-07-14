import { supabaseAdmin } from './supabase/server';
import { broadcastPushNotification } from './push';
import { Resend } from 'resend';
import { NewPostEmail } from '@/emails/NewPostEmail';
import React from 'react';

type PostType = 'program' | 'internship' | 'event' | 'announcement';

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
    // Instead of creating hundreds of individual rows, we insert ONE global notification.
    // This saves massive database space. The frontend is already set up to fetch `user_id = null`.
    const globalNotification = {
      user_id: null,
      title: `New ${payload.type.charAt(0).toUpperCase() + payload.type.slice(1)}!`,
      message: payload.message,
      type: payload.type,
      reference_id: payload.referenceId,
      is_global: true,
    };

    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert([globalNotification]);
    
    if (notifError) {
      console.error('[NOTIF_DISPATCH] Failed to insert global notification:', notifError);
    } else {
      console.log(`[NOTIF_DISPATCH] Successfully inserted global in-app notification.`);
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
        const resend = new Resend(process.env.RESEND_API_KEY);
        const batchSize = 50; // Resend BCC limit

        console.log(`[NOTIF_DISPATCH] Sending emails to ${emails.length} users in batches of ${batchSize}.`);

        for (let i = 0; i < emails.length; i += batchSize) {
          const recipientsBatch = emails.slice(i, i + batchSize);
          
          await resend.emails.send({
            from: 'ZIGEX <notifications@zigexconnect.com>',
            to: 'notifications@zigexconnect.com',
            bcc: recipientsBatch,
            subject: `New ${payload.type.charAt(0).toUpperCase() + payload.type.slice(1)} Available: ${payload.title}`,
            react: React.createElement(NewPostEmail, {
              postTitle: payload.title,
              postType: payload.type.charAt(0).toUpperCase() + payload.type.slice(1),
              postLocation: payload.location || 'Remote',
              viewPostUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zigexconnect.com'}${payload.link}`,
              companyLogoUrl: 'https://tmvipinvvhgklmqwvows.supabase.co/storage/v1/object/public/company-assets/Seed%20Company/events/SEED%20community%20Challenge-1757769838240.jpg',
              managePreferencesUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zigexconnect.com'}/profile/notifications`,
              postedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            })
          }).catch(err => console.error(`[NOTIF_DISPATCH] Email batch ${Math.floor(i / batchSize) + 1} sending error:`, err));
        }
      }
    } else {
      console.warn('[NOTIF_DISPATCH] RESEND_API_KEY missing. Skipping emails.');
    }

  } catch (err) {
    console.error('[NOTIF_DISPATCH] Critical failure:', err);
  }
}

export async function createNotification(payload: {
  userId?: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  url?: string;
}) {
  const { error } = await supabaseAdmin.from('notifications').insert([{
    user_id: payload.userId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    reference_id: payload.referenceId,
    is_global: false
  }]);

  if (error) {
    console.error('[NOTIFICATIONS] Error creating notification:', error);
  }
}
