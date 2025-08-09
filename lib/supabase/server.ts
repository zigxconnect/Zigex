import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! as string
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY! as string

// Log the variables to check if they are loaded correctly
// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Service Role Key Loaded:', !!supabaseServiceRoleKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
