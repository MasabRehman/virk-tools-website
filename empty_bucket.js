require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase.storage.from('images').list();
  if (error) {
    console.error('Error listing files:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('Bucket is already empty');
    return;
  }
  
  const filesToRemove = data.map(x => x.name);
  console.log(`Removing ${filesToRemove.length} files...`);
  
  const { data: remData, error: remError } = await supabase.storage.from('images').remove(filesToRemove);
  
  if (remError) {
    console.error('Error removing files:', remError);
  } else {
    console.log(`Successfully deleted ${filesToRemove.length} files from bucket.`);
  }
}

run();
