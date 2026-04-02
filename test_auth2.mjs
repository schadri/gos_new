import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dxldnkmcmxcxikaibtne.supabase.co',
  'sb_publishable_BQUTdntNvcHnbpZFPFXd9w_1iqlzYSS'
)

async function test() {
  const email = 'test+1775162403169@example.com';
  const password = 'DifferentPassword123';
  
  console.log('Registering existing email with DIFFERENT password', email);
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

  console.log('Logging in with new password...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  console.log('SignIn Error:', signInError?.message || signInError);
}

test();
