
console.log('Starting schema check...');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  const supabase = createClient(
    'https://dxldnkmcmxcxikaibtne.supabase.co',
    'sb_publishable_BQUTdntNvcHnbpZFPFXd9w_1iqlzYSS'
  );

  const { data, error } = await supabase.from('chats').select('*').limit(1);
  if (error) {
    console.error('Error selecting from chats:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns in chats:', Object.keys(data[0]));
  } else {
    console.log('No data in chats to infer columns. Trying common ones...');
    const commonCols = ['id', 'employer_id', 'applicant_id', 'job_id', 'created_at', 'updated_at', 'status', 'is_paused'];
    for (const col of commonCols) {
        const { error: colErr } = await supabase.from('chats').select(col).limit(1);
        if (!colErr) {
            console.log(`Column ${col} exists`);
        } else if (colErr && colErr.code === '42703') {
            console.log(`Column ${col} does NOT exist`);
        } else {
            console.log(`Error checking column ${col}:`, colErr.message);
        }
    }
  }
}

checkSchema();
