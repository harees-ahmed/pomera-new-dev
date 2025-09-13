import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

console.log('Server Supabase URL:', supabaseConfig.url);
console.log('Server Supabase Key (first 10 chars):', supabaseServiceKey?.substring(0, 10));

export const supabaseServer = createClient(supabaseConfig.url, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
