import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dxldnkmcmxcxikaibtne.supabase.co',
  'sb_publishable_BQUTdntNvcHnbpZFPFXd9w_1iqlzYSS'
)

async function test() {
  const email = `test+${Date.now()}@example.com`;
  const password = 'Password@123';
  
  console.log('Registering', email);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'talent',
        user_type: 'TALENT'
      }
    }
  });

  console.log('SignUp Error:', signUpError);
  console.log('SignUp Session exists?', !!signUpData?.session);
  console.log('SignUp User exists?', !!signUpData?.user);

  console.log('Logging in...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  console.log('SignIn Error:', signInError);
  console.log('SignIn Session:', signInData?.session ? "Yes" : "No");
}

test();
