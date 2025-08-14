require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const tradePrompt = require('./tradePromt');
const setOptData = require('./setOptionData/setOptData');
const AiTrade = require('../models/aiTrade.model');
const connectDB = require("../config/db")

connectDB();
async function generateFreshTradeSuggestions() {
  try {
    console.log('🔄 Starting fresh trade suggestion generation...');
    
    // Step 1: Fetch fresh market data
    console.log('📊 Fetching fresh market data...');
    await setOptData.fetchAndSaveOC();
    
    // Wait a moment for file to be written
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Read fresh market data
    const marketDataPath = path.join(__dirname, 'setOptionData/marketData.json');
    if (!fs.existsSync(marketDataPath)) {
      throw new Error('Market data file not found. Please run setOptData first.');
    }
    
    const marketData = JSON.parse(fs.readFileSync(marketDataPath, 'utf8'));
    console.log('✅ Fresh market data loaded');
    
    // Step 3: Check if market is open
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 100 + minute;
    
    // Market hours: 9:15 AM to 3:30 PM (IST)
    if (currentTime < 915 || currentTime > 1530) {
      console.log('⚠️ Market is closed. Generating suggestions for next market session...');
    } else {
      console.log('✅ Market is open. Generating live trade suggestions...');
    }
    
    // Step 4: Generate AI trade suggestions
    console.log('🤖 Generating AI trade suggestions...');
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCoL4mZUg_oGWHvBa-jI4e0v2g0utr-vU0";
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const ai = new GoogleGenAI({ apiKey });
    const promptText = tradePrompt(marketData);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: promptText }]}],
    });

    const text = response.text;
    console.log('📝 Raw AI response received');
    
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Parse the cleaned JSON string
    const trades = JSON.parse(cleanText);
    
    // Step 5: Add timestamp and validate trades
    const validatedTrades = trades.map((trade, index) => ({
      ...trade,
      id: `fresh_${Date.now()}_${index + 1}`,
      timestamp: new Date().toISOString(),
      marketTime: `${hour}:${minute.toString().padStart(2, '0')} IST`,
      isFresh: true
    }));
    
    // Step 6: Save fresh suggestions
    fs.writeFileSync('tradeSuggestions.json', JSON.stringify(validatedTrades, null, 2), 'utf8');
    console.log('✅ Fresh trade suggestions saved to tradeSuggestions.json');
    
    // Step 7: Delete old AI trades from database
    console.log('🗑️ Cleaning up old AI trades from database...');
    const deleteResult = await AiTrade.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} old AI trades`);
    
    // Step 8: Create new AI trades in database
    console.log('📝 Creating new AI trades in database...');
    for (const trade of validatedTrades) {
      const aiTrade = new AiTrade({
        aiTradeId: trade.id,
        title: trade.title,
        sentiment: trade.sentiment,
        setup: {
          currentPrice: trade.setup.currentPrice,
          strategy: trade.setup.strategy,
          strike: trade.setup.strike,
          expiry: trade.setup.expiry,
          symbol: extractSymbol(trade.setup.strike),
          instrumentKey: generateInstrumentKey(trade.setup.strike),
        },
        tradePlan: trade.tradePlan,
        logic: trade.logic,
        confidence: trade.confidence,
        riskLevel: trade.riskLevel,
        suggestedAt: new Date(trade.timestamp),
        tags: generateTags(trade),
        notes: [{
          timestamp: new Date(),
          message: `Fresh trade suggestion generated at ${trade.marketTime}`,
          type: 'info'
        }]
      });
      
      await aiTrade.save();
      console.log(`✅ Created AI trade: ${trade.title}`);
    }
    
    console.log('🎉 Fresh trade generation workflow completed successfully!');
    console.log(`📊 Generated ${validatedTrades.length} new trade suggestions`);
    console.log(`🗑️ Cleaned up ${deleteResult.deletedCount} old trades`);
    console.log(`📝 Created ${validatedTrades.length} new AI trades in database`);
    
    return validatedTrades;
    
  } catch (err) {
    console.error('❌ Error in fresh trade generation:', err);
    throw err;
  }
}

// Helper functions
function extractSymbol(strike) {
  if (!strike) return 'Unknown';
  if (strike.includes('CE') || strike.includes('PE')) {
    return strike.split(' ')[0]; // Extract symbol from "NIFTY 24650 CE"
  }
  return strike;
}

function generateInstrumentKey(strike) {
  if (!strike) return 'Unknown';
  if (strike.includes('NIFTY')) return 'NSE_INDEX|Nifty 50';
  if (strike.includes('BANKNIFTY')) return 'NSE_INDEX|Nifty Bank';
  return 'Unknown';
}

function generateTags(trade) {
  const tags = [];
  
  if (trade.setup.strategy) tags.push(trade.setup.strategy);
  if (trade.sentiment) tags.push(trade.sentiment);
  if (trade.riskLevel) tags.push(trade.riskLevel);
  if (trade.tradePlan.timeFrame) tags.push(trade.tradePlan.timeFrame);
  tags.push('fresh');
  tags.push(new Date().toISOString().split('T')[0]); // Today's date
  
  return tags;
}

// Export for use in other files
module.exports = { generateFreshTradeSuggestions };

// Run if called directly
if (require.main === module) {
  generateFreshTradeSuggestions()
    .then(() => {
      console.log('🚀 Fresh trade generation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fresh trade generation failed:', error);
      process.exit(1);
    });
}
