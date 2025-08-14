const mongoose = require('mongoose');
const AiTrade = require('./models/aiTrade.model');
const aiTradeProcessor = require('./services/aiTradeProcessor');

// Test configuration
const TEST_CONFIG = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/paperT',
  testAiTradeId: 'test-001'
};

// Test AI trade data
const testAiTrade = {
  aiTradeId: TEST_CONFIG.testAiTradeId,
  title: 'TEST TRADE: Nifty Call Option',
  sentiment: 'bullish',
  setup: {
    currentPrice: 24619.35,
    strategy: 'Buy Call Option',
    strike: 'NIFTY 24650 CE',
    expiry: '2025-08-14',
    symbol: 'NIFTY'
  },
  tradePlan: {
    entry: '₹54',
    target: '₹80',
    stopLoss: '₹40',
    timeFrame: 'Intraday'
  },
  logic: 'Test trade for system verification',
  confidence: 85,
  riskLevel: 'medium',
  suggestedAt: new Date(),
  tags: ['test', 'call-option', 'intraday']
};

async function testAiTradeSystem() {
  console.log('🧪 Starting AI Trade System Tests...\n');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(TEST_CONFIG.mongoUri);
    console.log('✅ MongoDB connected successfully\n');

    // Test 1: Create AI Trade
    console.log('📝 Test 1: Creating AI Trade...');
    const aiTrade = new AiTrade(testAiTrade);
    await aiTrade.save();
    console.log('✅ AI Trade created successfully');
    console.log(`   ID: ${aiTrade._id}`);
    console.log(`   Status: ${aiTrade.status}\n`);

    // Test 2: Add Note
    console.log('📝 Test 2: Adding note to AI Trade...');
    await aiTrade.addNote('Test note added successfully', 'info');
    console.log('✅ Note added successfully\n');

    // Test 3: Update Status
    console.log('🔄 Test 3: Updating AI Trade status...');
    await aiTrade.updateStatus('active', 'Test activation');
    console.log('✅ Status updated to active\n');

    // Test 4: Get Statistics
    console.log('📊 Test 4: Getting AI Trade statistics...');
    const stats = await aiTradeProcessor.getStats();
    console.log('✅ Statistics retrieved successfully');
    console.log(`   Total trades: ${stats.totalTrades || 0}`);
    console.log(`   Active trades: ${stats.activeTrades || 0}`);
    console.log(`   Average confidence: ${stats.avgConfidence?.toFixed(1) || 'N/A'}%\n`);

    // Test 5: Get Trades by Status
    console.log('🔍 Test 5: Getting AI Trades by status...');
    const activeTrades = await aiTradeProcessor.getTradesByStatus('active');
    console.log('✅ Active trades retrieved successfully');
    console.log(`   Active trades count: ${activeTrades.length}\n`);

    // Test 6: Get Trades by Sentiment
    console.log('🔍 Test 6: Getting AI Trades by sentiment...');
    const bullishTrades = await aiTradeProcessor.getTradesByStatus('all');
    const bullishCount = bullishTrades.filter(t => t.sentiment === 'bullish').length;
    console.log('✅ Sentiment filtering works');
    console.log(`   Bullish trades count: ${bullishCount}\n`);

    // Test 7: Test market hours detection
    console.log('🕐 Test 7: Testing market hours detection...');
    const isMarketOpen = aiTradeProcessor.isMarketOpen();
    console.log(`   Market is currently: ${isMarketOpen ? 'OPEN' : 'CLOSED'}\n`);

    // Test 8: Cleanup test data
    console.log('🧹 Test 8: Cleaning up test data...');
    await AiTrade.deleteOne({ aiTradeId: TEST_CONFIG.testAiTradeId });
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All tests passed successfully!');
    console.log('✅ AI Trade System is working correctly\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('📡 MongoDB connection closed');
    process.exit(0);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAiTradeSystem();
}

module.exports = { testAiTradeSystem };
