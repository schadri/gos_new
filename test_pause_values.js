
const { createClient } = require('@supabase/supabase-js');

async function checkPaused() {
  const supabase = createClient(
    'https://dxldnkmcmxcxikaibtne.supabase.co',
    'sb_publishable_BQUTdntNvcHnbpZFPFXd9w_1iqlzYSS'
  );

  const { data, error } = await supabase.from('chats').select('id, is_paused').limit(5);
  console.log("Error:", error);
  console.log("Data:", data);
}

checkPaused();
