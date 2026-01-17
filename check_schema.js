
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple env parser
function loadEnv() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const lines = content.split('\n');
  const env = {};
  lines.forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
    }
  });
  return env;
}

const env = loadEnv();
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  // Try direct query because information_schema might be restricted
  const tablesToCheck = ['messages', 'chat_rooms', 'student_profiles', 'projects', 'project_submissions'];
  for (const table of tablesToCheck) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`Table '${table}' error or missing:`, error.message);
    } else {
      console.log(`Table '${table}' exists`);
    }
  }
}

checkTables();
