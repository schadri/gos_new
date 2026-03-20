
const { createClient } = require('@supabase/supabase-js');

async function testUpdate() {
  const supabase = createClient(
    'https://dxldnkmcmxcxikaibtne.supabase.co',
    'sb_publishable_BQUTdntNvcHnbpZFPFXd9w_1iqlzYSS'
  );

  // Attempt raw update to see the exact error
  // Not passing auth might fail RLS, but we can also just select a dummy row
  const { error } = await supabase.from('chats').select('is_paused').limit(1);
  console.log("Select is_paused error:", error);
}

testUpdate();
