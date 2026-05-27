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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing keys!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Querying push_subscriptions columns...");
  // Let's do a select limit 1
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error querying push_subscriptions:", error);
  } else {
    console.log("Success! Sample data:", data);
  }
}

check();
