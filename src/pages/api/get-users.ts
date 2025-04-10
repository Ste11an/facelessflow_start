// src/pages/api/get-users.ts
import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from('users') // <-- ändra detta till din tabell om den heter något annat
    .select('*')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
}
