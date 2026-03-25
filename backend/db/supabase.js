import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count(*)').limit(1);
    if (error) {
      console.log('No tables found, will create schema when needed');
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

// Helper function for raw SQL queries (will use when database is properly set up)
export const query = async (text, params) => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: text, 
      sql_params: params || [] 
    });
    
    if (error) throw error;
    return { rows: data || [] };
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

export default supabase;