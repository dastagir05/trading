#!/usr/bin/env node

require('dotenv').config();
const path = require('path');

// Add the parent directory to the path so we can require the modules
const projectRoot = path.join(__dirname, '..');
require('module').globalPaths.push(projectRoot);

const { generateFreshTradeSuggestions } = require('../aiTradeSugg/generateFreshTrades');

async function main() {
  try {
    console.log('🚀 Starting Fresh Trade Generation Workflow...');
    console.log('⏰ Time:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.log('📍 Market: NSE (India)');
    console.log('=' .repeat(60));
    
    const result = await generateFreshTradeSuggestions();
    
    console.log('=' .repeat(60));
    console.log('🎉 Workflow completed successfully!');
    console.log(`📊 Generated ${result.length} fresh trade suggestions`);
    console.log('🔄 Old trades have been cleaned up from database');
    console.log('📝 New AI trades are now active in the system');
    console.log('⏰ Next update will be in 30 minutes (if market is open)');
    
  } catch (error) {
    console.error('💥 Workflow failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the main function
main();
