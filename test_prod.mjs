import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://db.goscentral.online', 'sb_publishable_BQUTdntNvcHnbpZFPFXd9w_1iqlzYSS')

async function test() {
  const email = `test_prod_${Date.now()}@example.com`;
  console.log("Registering NEW email:", email);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email, 
      password: 'Password123'
    });
    
    console.log("SignUp error:", error?.message || null);
    console.log("Has Session?:", !!data.session);
    console.log("Has User?:", !!data.user);
    
    if (data.user && !data.session) {
      console.log("CONCLUSION: Server DEFINITELY has email confirmation ENABLED for new signups.");
    } else if (data.session) {
      console.log("CONCLUSION: Server has email confirmation DISABLED for new signups.");
    }
  } catch (err) {
    console.log("Caught exception:", err.message);
  }
}

test();
