import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface AssessmentRecord {
  id: string;
  user_id: string;
  form_data: Record<string, unknown>;
  risk_score: number;
  risk_stage: string;
  created_at: string;
}