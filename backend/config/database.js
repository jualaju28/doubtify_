import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uwrnbvfuudccqqxlgipl.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3cm5idmZ1dWRjY3FxeGxnaXBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MTYxNjQ3MSwiZXhwIjoxOTg3MTkyNDcxfQ.xG0Ic-lkwWEITKYvZrJ8w9TkGxB8dE5P3mQ5Ln6t7gM' // Default service role key

// Create Supabase client with service role (has elevated permissions)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Alternative direct PostgreSQL connection
import pg from 'pg'
const { Pool } = pg

export const pool = new Pool({
  connectionString: `postgresql://postgres.uwrnbvfuudccqqxlgipl:doubtify67%21%40%23%24%25@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  ssl: {
    rejectUnauthorized: false
  }
})

// Test database connection
export async function testConnection() {
  try {
    console.log('🔗 Testing database connection...')
    
    // Test with pg Pool
    const client = await pool.connect()
    const result = await client.query('SELECT version()')
    console.log('✅ PostgreSQL connected:', result.rows[0].version)
    client.release()
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    
    // Fallback to Supabase client
    try {
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('count(*)') 
        .limit(1)
      
      if (supabaseError) throw supabaseError
      console.log('✅ Supabase client connected successfully')
      return true
    } catch (supabaseErr) {
      console.error('❌ Supabase connection also failed:', supabaseErr.message)
      return false
    }
  }
}

export default pool