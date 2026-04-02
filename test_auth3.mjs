import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://dxldnkmcmxcxikaibtne.supabase.co',
  'sb_publishable_BQUTdntNvcHnbpZFPFXd9w_1iqlzYSS'
)
async function test() {
  const email = `test_weak_${Date.now()}@example.com`;
  const password = '123';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: 'talent', user_type: 'TALENT' }
    }
  });
  console.log('Weak Password error:', error?.message);
}
test();
