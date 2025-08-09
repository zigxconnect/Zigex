import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!||"https://tmvipinvvhgklmqwvows.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!|| "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdmlwaW52dmhna2xtcXd2b3dzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE4MjQ4MiwiZXhwIjoyMDY3NzU4NDgyfQ.8YJlls7rDdK5DvezGosyRbk7gMUHXXAK8XqZlwGZMWU";

// Log the variables to check if they are loaded correctly
// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Service Role Key Loaded:', !!supabaseServiceRoleKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
