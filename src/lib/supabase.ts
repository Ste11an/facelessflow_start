import { createClient } from '@supabase/supabase-js'

// ✅ Dessa kommer från Netlify / .env och funkar både lokalt & i produktion
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 📦 Exportera klienten
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
