#!/usr/bin/env node

/**
 * Database Schema Setup for Doubtify Platform
 * Runs schema.sql to create all tables and initial data
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool, testConnection } from '../config/database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function setupDatabase() {
  console.log('🚀 Setting up Doubtify Database...\n')
  
  try {
    // Test connection first
    const connected = await testConnection()
    if (!connected) {
      console.error('❌ Cannot proceed without database connection')
      process.exit(1)
    }
    
    console.log('\n📖 Reading schema file...')
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('🔨 Creating database schema...')
    await pool.query(schema)
    console.log('✅ Schema created successfully')
    
    console.log('\n🌱 Reading seed data...')
    const seedPath = path.join(__dirname, 'seed.sql')
    
    if (fs.existsSync(seedPath)) {
      const seedData = fs.readFileSync(seedPath, 'utf8')
      console.log('🌱 Inserting seed data...')
      await pool.query(seedData)
      console.log('✅ Seed data inserted successfully')
    } else {
      console.log('ℹ️  No seed file found, creating with basic data...')
      await createBasicSeedData()
    }
    
    console.log('\n🎯 Database setup complete!')
    console.log('✅ All tables created')
    console.log('✅ Indexes and constraints applied') 
    console.log('✅ Sample data inserted')
    console.log('✅ Reputation system functions installed')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    console.error(error.stack)
  } finally {
    await pool.end()
  }
}

async function createBasicSeedData() {
  const basicData = `
    -- Insert subjects
    INSERT INTO subjects (name, description) VALUES 
    ('Mathematics', 'Mathematical concepts and problem solving'),
    ('Physics', 'Physical sciences and natural phenomena'),
    ('Chemistry', 'Chemical reactions and molecular science'),
    ('Computer Science', 'Programming and computational thinking'),
    ('Biology', 'Life sciences and biological processes')
    ON CONFLICT (name) DO NOTHING;
    
    -- Insert sample users  
    INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
    ('admin', 'admin@doubtify.com', '$2b$10$rOx7PqJpF5a5x9bWg6XbzO.YxvP7Nx7wUf7T4nH8xP7lJwpN3zT2G', 'Admin', 'User'),
    ('john_doe', 'john@example.com', '$2b$10$rOx7PqJpF5a5x9bWg6XbzO.YxvP7Nx7wUf7T4nH8xP7lJwpN3zT2G', 'John', 'Doe'),
    ('jane_smith', 'jane@example.com', '$2b$10$rOx7PqJpF5a5x9bWg6XbzO.YxvP7Nx7wUf7T4nH8xP7lJwpN3zT2G', 'Jane', 'Smith')
    ON CONFLICT (username) DO NOTHING;
  `
  
  await pool.query(basicData)
  console.log('✅ Basic seed data created')
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
}

export { setupDatabase }