import { query } from './connection.js';

export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Test basic connection
    await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'subjects', 'doubts')
    `);
    
    if (result.rows.length === 0) {
      console.log('📋 No tables found, database needs to be set up');
      console.log('🔧 Please run the schema.sql file to create tables');
      return false;
    } else {
      console.log(`✅ Found ${result.rows.length} core tables`);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

export const runSchemaSetup = async () => {
  try {
    console.log('🔄 Setting up database schema...');
    
    // First, let's check if we can connect
    const connectionTest = await query('SELECT 1 as test');
    console.log('✅ Connection verified');
    
    return true;
  } catch (error) {
    console.error('❌ Schema setup failed:', error.message);
    throw error;
  }
};