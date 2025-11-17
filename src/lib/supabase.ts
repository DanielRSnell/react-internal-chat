import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Session {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  session_id: string
  content: string
  content_html: string | null
  role: 'user' | 'agent'
  type?: string
  final?: boolean
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}
