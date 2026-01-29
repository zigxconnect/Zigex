import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendAttendanceReminderEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Basic security check to prevent unauthorized triggering
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        // Using a hardcoded key for simplicity in this context, 
        // in production this should be an environment variable.
        if (key !== 'zigex-cron-secret') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[CRON] Starting attendance reminder job...');

        // Fetch all supervisors
        const { data: supervisors, error } = await supabaseAdmin
            .from('supervisor_profiles')
            .select('user_id, full_name, email');

        if (error) {
            console.error('[CRON] DB Error:', error);
            throw new Error(error.message);
        }

        console.log(`[CRON] Found ${supervisors?.length || 0} supervisors.`);

        if (!supervisors || supervisors.length === 0) {
            return NextResponse.json({ success: true, message: 'No supervisors found' });
        }

        let sentCount = 0;
        const errors: any[] = [];

        // Process emails in parallel
        await Promise.all(supervisors.map(async (supervisor: any) => {
            let email = supervisor.email;

            // Resilient: Fetch from Auth if missing in profile
            if (!email && supervisor.user_id) {
                const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(supervisor.user_id);
                email = authUser?.user?.email;
            }

            if (email) {
                try {
                    await sendAttendanceReminderEmail({
                        email,
                        name: supervisor.full_name || 'Supervisor'
                    });
                    sentCount++;
                } catch (err: any) {
                    console.error(`[CRON] Failed to send to ${email}:`, err);
                    errors.push({ email, error: err.message });
                }
            } else {
                console.warn(`[CRON] Skipping supervisor ${supervisor.full_name} (ID: ${supervisor.user_id}) - No email found.`);
            }
        }));

        return NextResponse.json({
            success: true,
            sent: sentCount,
            total: supervisors.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (err: any) {
        console.error('[CRON] Job failed:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
