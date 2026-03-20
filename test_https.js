const https = require('https');
const url = 'https://dxldnkmcmxcxikaibtne.supabase.co/rest/v1/';

console.log('Testing Node HTTPS directly...');

const req = https.request(url, { method: 'GET', timeout: 5000 }, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Successfully received response. Body length:', data.length));
});

req.on('error', (e) => {
  console.error('HTTPS Error:', e);
});

req.on('timeout', () => {
  console.error('HTTPS Timeout!');
  req.destroy();
});

req.end();
