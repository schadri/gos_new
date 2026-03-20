const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function checkNotifications() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Missing env vars');
    return;
  }

  try {
    const res = await fetch(`${url}/rest/v1/notifications?select=*`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    if (!res.ok) {
        console.log('Error fetching:', await res.text());
        return;
    }
    
    const data = await res.json();
    console.log('Notifications in DB:', data.length);
    console.log(data);
  } catch(e) {
    console.error(e);
  }
}

checkNotifications();
