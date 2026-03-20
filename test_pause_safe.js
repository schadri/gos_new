const { createClient } = require('@supabase/supabase-js');
async function run() {
  const supabase = createClient('https://dxldnkmcmxcxikaibtne.supabase.co', 'sb_publishable_BQUTdntNvcHnbpZFPFXd9w_1iqlzYSS');
  const { data, error } = await supabase.from('chats').select('id, is_paused').limit(5);
  console.log(JSON.stringify({data, error}, null, 2));
  process.exit(0);
}
run();
