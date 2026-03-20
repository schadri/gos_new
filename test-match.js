const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function testAutomatch(talentId) {
    console.log(`[Test] Starting auto-match for talent: ${talentId}`);

    const { data: talent, error: talentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', talentId)
        .single();

    if (talentError) {
        return console.error('Error fetching talent:', talentError);
    }
    
    console.log(`[Test] Talent Positions: ${JSON.stringify(talent.position)}, Coords: ${talent.latitude}, ${talent.longitude}`);

    const talentPositions = Array.isArray(talent.position) ? talent.position : (typeof talent.position === 'string' ? [talent.position] : []);

    const { data: jobs, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active');

    console.log(`[Test] Active jobs found: ${jobs?.length}`);

    for (const job of jobs) {
        const lowerJobTitle = job.title.toLowerCase();
        const positionMatch = talentPositions.some((p) => p.toLowerCase() === lowerJobTitle);
        
        console.log(`[Test] Checking Job "${job.title}" vs Talent Match: ${positionMatch}`);

        if (positionMatch && talent.latitude && job.latitude) {
            const distance = calculateDistance(talent.latitude, talent.longitude, job.latitude, job.longitude);
            console.log(`[Test] Distance to job: ${distance.toFixed(2)}km. Max allowed: ${job.search_radius || 5}km`);
        }
    }
}

// Llama al script con el ID del usuario del log "d4jtC7..."
// Test id fallback
testAutomatch('a0000000-0000-0000-0000-000000000000').catch(console.error);
