import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

// service_role 키 — RLS 우회, 서버에서만 사용
export const supabase = createClient(supabaseUrl, supabaseServiceKey)
