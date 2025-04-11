import { createClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase miljövariabler saknas. Kontrollera NEXT_PUBLIC_SUPABASE_URL och NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  client = createClient(supabaseUrl, supabaseAnonKey)
  return client
}
