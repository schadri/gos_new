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

async function testQuery() {
    console.log('Querying notifications...')
    const { data, error } = await supabase.from('notifications').select('*')
    if (error) {
        console.error('Error fetching notifications:', error)
    } else {
        console.log(`Found ${data.length} notifications:`)
        console.dir(data, { depth: null })
    }
}

testQuery()
