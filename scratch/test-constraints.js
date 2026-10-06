import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local manually
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Querying unique constraints on push_subscriptions...");
  // Let's run a query on pg_constraint
  const { data: constraints, error: cError } = await supabase
    .rpc('get_table_constraints', { t_name: 'push_subscriptions' }) // Check if helper exists, otherwise run direct query if possible. Since we can't run raw sql easily without rpc or postgres schema tool, let's query the supabase API's OpenAPI schema or similar.
    // Actually, we can just run a query using postgres information_schema. But Supabase JS client doesn't allow raw SQL unless we use a function.
    // Wait, let's query the policies on the table:
    
  console.log("Checking RLS policies...");
  const { data: policies, error: pError } = await supabase
    .from('pg_policies') // wait, pg_policies is system catalog, standard REST API doesn't expose it unless exposed in 'public' schema or we use RPC.
    .select('*');
    
  // Since we cannot query system tables directly via PostgREST, let's try to upsert a fake record using the Anon key vs Service Role key, to test RLS!
  const anonClient = createClient(supabaseUrl, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // Try to insert a dummy subscription for a dummy user (or active user)
  console.log("Trying to insert as anon/unauthenticated user...");
  const { data: anonData, error: anonError } = await anonClient
    .from('push_subscriptions')
    .insert({
      user_id: '334518ad-6de5-4e1f-963b-f47bf3f50552',
      endpoint: 'https://test-anon.com',
      p256dh: 'test-p256dh',
      auth: 'test-auth'
    });
  console.log("Anon insert result:", anonError ? anonError.message : "Success");

  console.log("Trying to upsert with Service Role...");
  const { data: srData, error: srError } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: '334518ad-6de5-4e1f-963b-f47bf3f50552',
      endpoint: 'https://test-sr.com',
      p256dh: 'test-p256dh',
      auth: 'test-auth'
    }, {
      onConflict: 'user_id,endpoint'
    });
  console.log("SR upsert result (user_id,endpoint):", srError ? srError.message : "Success");

  // Let's also try onConflict: 'endpoint' or no onConflict
  console.log("Trying to upsert with Service Role onConflict endpoint...");
  const { data: srData2, error: srError2 } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: '334518ad-6de5-4e1f-963b-f47bf3f50552',
      endpoint: 'https://test-sr.com',
      p256dh: 'test-p256dh-updated',
      auth: 'test-auth'
    }, {
      onConflict: 'endpoint'
    });
  console.log("SR upsert result (endpoint):", srError2 ? srError2.message : "Success");
}

check();
