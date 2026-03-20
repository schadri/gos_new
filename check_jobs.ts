
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.log('Missing credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkJobValues() {
    const { data: jobs, error } = await supabase.from('jobs').select('contract_type, experience_required').limit(50)
    if (error) {
        console.error(error)
        return
    }

    const contracts = new Set(jobs.map(j => j.contract_type))
    const experiences = new Set(jobs.map(j => j.experience_required))

    console.log('Available Contract Types:', Array.from(contracts))
    console.log('Available Experience Values:', Array.from(experiences))
}

checkJobValues()
