import { Client } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Replace the supabase connection string from env if available, or just construct it.
// Assuming we have NEXT_PUBLIC_SUPABASE_URL, we'll need the direct DB connection string
// Often we don't have it in local dev unless we check supabase status. Let's run `supabase status` instead if this fails.

const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

async function main() {
    const client = new Client({
        connectionString,
    })

    try {
        await client.connect()
        console.log('Connected to DB')

        await client.query(`
      CREATE OR REPLACE FUNCTION public.increment_job_applications(job_uuid uuid)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        UPDATE public.jobs
        SET applications_count = applications_count + 1
        WHERE id = job_uuid;
      END;
      $$;
    `)

        await client.query(`
      CREATE OR REPLACE FUNCTION public.increment_job_views(job_uuid uuid)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        UPDATE public.jobs
        SET views_count = views_count + 1
        WHERE id = job_uuid;
      END;
      $$;
    `)

        console.log('Successfully created RPC functions')
    } catch (error) {
        console.error('Error executing query:', error)
    } finally {
        await client.end()
    }
}

main()
