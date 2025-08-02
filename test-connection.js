#!/usr/bin/env node

// Test script to verify frontend-backend connection
// Using built-in fetch (Node.js 18+)

async function testConnection() {
  console.log('🏀 Testing Basketball Stat Tracker Connection...\n');

  const tests = [
    {
      name: 'Backend API - Players',
      url: 'http://localhost:8000/games/players/',
      expected: 'Array of players'
    },
    {
      name: 'Backend API - Games',
      url: 'http://localhost:8000/games/games/',
      expected: 'Array of games'
    },
    {
      name: 'Frontend - Homepage',
      url: 'http://localhost:3000/',
      expected: 'HTML content'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await fetch(test.url);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`✅ ${test.name} - SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Content Length: ${data.length} characters`);
        
        if (test.url.includes('localhost:8000')) {
          // Try to parse as JSON for API endpoints
          try {
            const jsonData = JSON.parse(data);
            console.log(`   Data Type: JSON Array with ${jsonData.length} items`);
          } catch (e) {
            console.log(`   Data Type: Text/HTML`);
          }
        }
      } else {
        console.log(`❌ ${test.name} - FAILED`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR`);
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎯 Connection Test Summary:');
  console.log('   Backend API: http://localhost:8000');
  console.log('   Frontend App: http://localhost:3000');
  console.log('   API Base URL: http://localhost:8000/games/');
}

testConnection().catch(console.error); 