require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const tradePrompt = require("./tradePrompt");
const setOptData = require("./setOptionData/setOptData");
const AiTrade = require("../models/aiTrade.model");
const connectDB = require("../config/db");
const TradingAnalysisEngine = require("./TradingSignal");

connectDB();

async function generateFreshTradeSuggestions() {
  try {
    console.log("🔄 Starting fresh trade suggestion generation...");

    // Step 1: Update Market Data First
    const marketData = await updateMarketData();

    // Step 2: Check Market Hours
    const marketStatus = checkMarketHours();
    console.log(marketStatus.message);

    // Step 3: Generate Enhanced AI Prompt with Technical Analysis
    console.log("🤖 Generating enhanced AI trade suggestions...");
    const enhancedPrompt = await generateEnhancedPrompt(marketData);

    // Step 4: Get AI Response
    const aiResponse = await getAIResponse(enhancedPrompt);

    // Step 5: Process and Validate Trades
    const validatedTrades = processAIResponse(aiResponse, marketStatus.time);

    // Step 6: Save and Store Trades
    await saveAndStoreTrades(validatedTrades);

    console.log("🎉 Fresh trade generation workflow completed successfully!");
    console.log(`📊 Generated ${validatedTrades.length} new trade suggestions`);

    return validatedTrades;
  } catch (err) {
    console.error("❌ Error in fresh trade generation:", err);
    throw err;
  }
}

// Step 1: Update Market Data
async function updateMarketData() {
  console.log("📊 Fetching fresh market data...");
  await setOptData.fetchAndSaveOC();

  // Wait for file to be written
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const marketDataPath = path.join(__dirname, "setOptionData/marketData.json");
  if (!fs.existsSync(marketDataPath)) {
    throw new Error("Market data file not found. Please run setOptData first.");
  }

  const marketData = JSON.parse(fs.readFileSync(marketDataPath, "utf8"));
  console.log("✅ Fresh market data loaded");

  return marketData;
}

// Step 2: Check Market Hours
function checkMarketHours() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 100 + minute;

  const isMarketOpen = currentTime >= 915 && currentTime <= 1530;
  const timeString = `${hour}:${minute.toString().padStart(2, "0")} IST`;

  return {
    isOpen: isMarketOpen,
    time: timeString,
    message: isMarketOpen
      ? "✅ Market is open. Generating live trade suggestions..."
      : "⚠️ Market is closed. Generating suggestions for next market session...",
  };
}

// Step 3: Generate Enhanced Prompt with Technical Analysis
async function generateEnhancedPrompt(marketData) {
  console.log("📈 Generating technical analysis...");

  const engine = new TradingAnalysisEngine();

  // Generate analysis for both indices
  const [niftyAnalysis, bankNiftyAnalysis] = await Promise.all([
    engine.generateCompleteAnalysis("NSE_INDEX|Nifty 50", marketData.nifty),
    engine.generateCompleteAnalysis(
      "NSE_INDEX|Nifty Bank",
      marketData.banknifty
    ),
  ]);

  console.log("✅ Technical analysis completed");

  // Use the enhanced tradePrompt function with analysis data
  return tradePrompt(marketData, {
    niftyAnalysis,
    bankNiftyAnalysis,
  });
}

// Step 4: Get AI Response
async function getAIResponse(promptText) {
  const apiKey =
    process.env.GEMINI_API_KEY || "AIzaSyCoL4mZUg_oGWHvBa-jI4e0v2g0utr-vU0";
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: promptText }] }],
  });

  console.log("📝 Raw AI response received");
  return response.text;
}

// Step 5: Process AI Response
function processAIResponse(aiResponse, marketTime) {
  let cleanText = aiResponse
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const trades = JSON.parse(cleanText);

  return trades.map((trade, index) => ({
    ...trade,
    id: `fresh_${Date.now()}_${index + 1}`,
    timestamp: new Date().toISOString(),
    marketTime,
    isFresh: true,
  }));
}

// Step 6: Save and Store Trades
async function saveAndStoreTrades(validatedTrades) {
  // Save to JSON file
  const filePath = path.join(__dirname, "tradeSuggestions.json");
  try {
    fs.writeFileSync(
      filePath,
      JSON.stringify(validatedTrades, null, 2),
      "utf8"
    );
    console.log("✅ Fresh trade suggestions saved to", filePath);
  } catch (err) {
    console.error("❌ Error saving file:", err);
    throw err;
  }

  // Save to database
  console.log("📝 Creating new AI trades in database...");
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
      notes: [
        {
          timestamp: new Date(),
          message: `Fresh trade suggestion generated at ${trade.marketTime}`,
          type: "info",
        },
      ],
    });

    await aiTrade.save();
    console.log(`✅ Created AI trade: ${trade.title}`);
  }

  console.log(`📝 Created ${validatedTrades.length} new AI trades in database`);
}

// Helper functions remain the same
function extractSymbol(strike) {
  if (!strike) return "Unknown";
  if (strike.includes("CE") || strike.includes("PE")) {
    return strike.split(" ")[0];
  }
  return strike;
}

function generateInstrumentKey(strike) {
  if (!strike) return "Unknown";
  if (strike.includes("NIFTY")) return "NSE_INDEX|Nifty 50";
  if (strike.includes("BANKNIFTY")) return "NSE_INDEX|Nifty Bank";
  return "Unknown";
}

function generateTags(trade) {
  const tags = [];
  if (trade.setup.strategy) tags.push(trade.setup.strategy);
  if (trade.sentiment) tags.push(trade.sentiment);
  if (trade.riskLevel) tags.push(trade.riskLevel);
  if (trade.tradePlan.timeFrame) tags.push(trade.tradePlan.timeFrame);
  tags.push("fresh");
  tags.push(new Date().toISOString().split("T")[0]);
  return tags;
}

module.exports = { generateFreshTradeSuggestions };

// Run if called directly
if (require.main === module) {
  generateFreshTradeSuggestions()
    .then(() => {
      console.log("🚀 Fresh trade generation completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Fresh trade generation failed:", error);
      process.exit(1);
    });
}
