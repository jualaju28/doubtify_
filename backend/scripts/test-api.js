#!/usr/bin/env node

/**
 * API Testing Script for Doubtify Backend
 * Tests all major endpoints to ensure they're working
 */

import fetch from 'node-fetch'

const API_BASE = 'http://localhost:5000'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

async function testAPI() {
  console.log('🧪 Testing Doubtify API Endpoints...\n')
  
  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      url: `${API_BASE}/health`,
      expectedStatus: 200
    },
    {
      name: 'Get Subjects',
      method: 'GET', 
      url: `${API_BASE}/api/subjects`,
      expectedStatus: 200
    },
    {
      name: 'Get Doubts (No Auth)',
      method: 'GET',
      url: `${API_BASE}/api/doubts`,
      expectedStatus: [200, 401] // May require auth
    },
    {
      name: 'Register User',
      method: 'POST',
      url: `${API_BASE}/api/auth/register`,
      body: {
        username: 'testuser123',
        email: 'test@doubtify.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User'
      },
      expectedStatus: [201, 400] // 400 if user exists
    },
    {
      name: 'Login User', 
      method: 'POST',
      url: `${API_BASE}/api/auth/login`,
      body: {
        username: 'testuser123',
        password: 'SecurePass123!'
      },
      expectedStatus: [200, 400, 401]
    }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      }
      
      if (test.body) {
        options.body = JSON.stringify(test.body)
      }
      
      console.log(`🔍 Testing: ${test.name}`)
      const response = await fetch(test.url, options)
      const data = await response.text()
      
      const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus]
      const statusMatch = expectedStatuses.includes(response.status)
      
      if (statusMatch) {
        console.log(`${colors.green}✅ PASS${colors.reset} - ${test.name} (${response.status})`)
        passed++
      } else {
        console.log(`${colors.red}❌ FAIL${colors.reset} - ${test.name} (Expected: ${expectedStatuses.join('/')}, Got: ${response.status})`)
        console.log(`Response: ${data.substring(0, 200)}...`)
        failed++
      }
    } catch (error) {
      console.log(`${colors.red}❌ ERROR${colors.reset} - ${test.name}: ${error.message}`)
      failed++
    }
    
    console.log() // Empty line
  }
  
  console.log('\n📊 Test Results:')
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`)
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`)
  console.log(`${colors.blue}📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%${colors.reset}`)
  
  if (failed === 0) {
    console.log(`\n${colors.green}🎉 All API tests passed! Backend is ready.${colors.reset}`)
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Check the logs above.${colors.reset}`)
  }
}

// Install node-fetch if needed
try {
  await import('node-fetch')
} catch (error) {
  console.log('Installing node-fetch...')
  const { spawn } = await import('child_process')
  spawn('npm', ['install', 'node-fetch'], { stdio: 'inherit' })
}

testAPI().catch(console.error)