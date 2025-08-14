#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const AiTrade = require('../models/aiTrade.model');

async function testDatabaseConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paperT');
    console.log('✅ Connected to MongoDB successfully');
    
    // Check if aiTrades collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const aiTradesExists = collections.some(col => col.name === 'aiTrades');
    
    if (!aiTradesExists) {
      console.log('⚠️ aiTrades collection does not exist. Creating it...');
      
      // Create a dummy document to initialize the collection
      const dummyTrade = new AiTrade({
        aiTradeId: 'test_connection',
        title: 'Test Connection Trade',
        sentiment: 'neutral',
        setup: {
          currentPrice: 0,
          strategy: 'test',
          strike: 'test',
          expiry: 'test',
          symbol: 'test',
          instrumentKey: 'test',
        },
        tradePlan: {
          entry: 'test',
          target: 'test',
          stopLoss: 'test',
          timeFrame: 'test',
        },
        logic: 'Test connection',
        confidence: 50,
        riskLevel: 'medium',
        status: 'suggested',
        isValid: false, // Mark as invalid so it can be cleaned up
        tags: ['test', 'connection']
      });
      
      await dummyTrade.save();
      console.log('✅ aiTrades collection created successfully');
      
      // Clean up the test document
      await AiTrade.deleteOne({ aiTradeId: 'test_connection' });
      console.log('🧹 Test document cleaned up');
      
    } else {
      console.log('✅ aiTrades collection already exists');
    }
    
    // Test basic operations
    console.log('🧪 Testing basic database operations...');
    
    // Count documents
    const count = await AiTrade.countDocuments();
    console.log(`📊 Current document count: ${count}`);
    
    // Test insert
    const testTrade = new AiTrade({
      aiTradeId: 'test_operation',
      title: 'Test Operation Trade',
      sentiment: 'bullish',
      setup: {
        currentPrice: 100,
        strategy: 'test',
        strike: 'test',
        expiry: 'test',
        symbol: 'test',
        instrumentKey: 'test',
      },
      tradePlan: {
        entry: 'test',
        target: 'test',
        stopLoss: 'test',
        timeFrame: 'test',
      },
      logic: 'Test operation',
      confidence: 75,
      riskLevel: 'medium',
      status: 'suggested',
      isValid: false,
      tags: ['test', 'operation']
    });
    
    await testTrade.save();
    console.log('✅ Insert operation successful');
    
    // Test find
    const foundTrade = await AiTrade.findOne({ aiTradeId: 'test_operation' });
    console.log('✅ Find operation successful');
    
    // Test update
    await AiTrade.updateOne(
      { aiTradeId: 'test_operation' },
      { $set: { confidence: 80 } }
    );
    console.log('✅ Update operation successful');
    
    // Test delete
    await AiTrade.deleteOne({ aiTradeId: 'test_operation' });
    console.log('✅ Delete operation successful');
    
    console.log('🎉 All database operations tested successfully!');
    console.log('🚀 You can now run the fresh trade generation');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the test
testDatabaseConnection();
