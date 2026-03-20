const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const customFetch = async (url, options) => {
    return fetch(url, {
        ...options,
        duplex: 'half',
    });
};

const supabase = createClient(url, key, {
    global: { fetch: customFetch }
});

async function check() {
    let log = '';
    try {
        const { data, error } = await supabase.rpc('increment_job_applications', { job_uuid: 'ec6cc092-2155-4040-9197-98865f9e26e8' });
        log += `increment_job_applications: ${error ? error.message : 'SUCCESS'}\n`;
        
        const { data: data2, error: error2 } = await supabase.rpc('increment_job_contacted_count', { job_uuid: 'ec6cc092-2155-4040-9197-98865f9e26e8' });
        log += `increment_job_contacted_count: ${error2 ? error2.message : 'SUCCESS'}\n`;
    } catch (e) {
        log += `FATAL ERROR: ${e.message}\n`;
    }
    
    fs.writeFileSync('rpc-check.log', log);
    console.log('Done');
}

check();
