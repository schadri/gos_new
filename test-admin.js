const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error('Credentials missing');
    process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
    console.log('Testing RPC increment_job_applications...');
    const { error: err1 } = await supabase.rpc('increment_job_applications', { 
        job_uuid: 'ec6cc092-2155-4040-9197-98865f9e26e8' // Chef de partie job id from previous logs
    });
    console.log('Result increment_job_applications:', err1 ? err1.message : 'Success');

    console.log('Testing RPC increment_job_contacted_count...');
    const { error: err2 } = await supabase.rpc('increment_job_contacted_count', { 
        job_uuid: 'ec6cc092-2155-4040-9197-98865f9e26e8'
    });
    console.log('Result increment_job_contacted_count:', err2 ? err2.message : 'Success');

    console.log('Fetching active jobs...');
    const { data: jobs, error: jobErr } = await supabase.from('jobs').select('id, title').eq('status', 'active').limit(1);
    console.log('Jobs check:', jobErr ? jobErr.message : `Found ${jobs.length} jobs`);
}

test();
