import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Checking Supabase connection...');
console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Key:', supabaseKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error("Critical: Supabase environment variables are missing.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getData() {
  console.log('Fetching data from happening_now table...');
  const { data, error } = await supabase
    .from('happening_now')
    .select('*');

  if (error) {
    console.error('Supabase Error:', error);
    return;
  }

  console.log(`Found ${data.length} records.`);
  
  if (data.length > 0) {
    data.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log(`  ID: ${item.id}`);
      console.log(`  Company: ${item.company}`);
      console.log(`  Images:`, item.images);
      console.log(`  Video:`, item.video);
      console.log(`  Created At: ${item.created_at}`);
    });
  } else {
    console.log("Table 'happening_now' appears to be empty.");
  }
}

getData();
