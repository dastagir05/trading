const AiTrade = require("../models/aiTrade.model");
const StrategyTrade = require("../models/strategyTrade.model");

class StrategyTradeProcessor {
  init() {
    // Generate fresh trade suggestions every 30 minutes during market hours
    cron.schedule(
      "16,46 9-14 * * 1-5",
      () => {
        this.processAiTradesToStrategies();
        this.processExistingStrategyTrades().then((count) => {
          console.log(`Processed ${count} existing strategy trades on startup`);
        });
      },
      {
        timezone: "Asia/Kolkata",
      }
    );

    // Monitor suggested trades for activation every 2 minutes during market hours
    cron.schedule(
      "*/1 9-15 * * 1-5",
      async () => {
        console.log("Monitoring suggested trades for activation");
        await setOptData.fetchAndSaveOC();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.monitorSuggestedTrades();
      },
      {
        timezone: "Asia/Kolkata",
      }
    );

    // Monitor active AI trades every 5 minutes during market hours
    cron.schedule(
      "*/1 9-15 * * 1-5",
      () => {
        console.log("Monitoring active trades for exit conditions");
        this.monitorActiveTrades();
      },
      {
        timezone: "Asia/Kolkata",
      }
    );

    // Daily cleanup and reporting at 6 PM
    cron.schedule(
      "0 18 * * 1-5",
      () => {
        this.dailyCleanup();
      },
      {
        timezone: "Asia/Kolkata",
      }
    );

    console.log("🤖 AI Trade Processor initialized with cron jobs");
  }

  // Main method to process AI trades and convert to strategy trades
  async processAiTradesToStrategies() {
    try {
      console.log("🔄 Starting AI trade to Strategy trade processing...");

      // Get all suggested AI trades that haven't been processed into strategies yet
      const aiTrades = await AiTrade.find({
        status: "suggested",
        isValid: true,
        isStrategy: true,
        processedToStrategy: { $ne: true },
      }).sort({ createdAt: -1 });

      console.log(`Found ${aiTrades.length} AI trades to process`);

      for (const aiTrade of aiTrades) {
        await this.convertAiTradeToStrategy(aiTrade);
      }

      console.log("✅ AI trade to Strategy processing completed");
    } catch (error) {
      console.error("❌ Error processing AI trades to strategies:", error);
    }
  }

  // Convert individual AI trade to strategy format
  async convertAiTradeToStrategy(aiTrade) {
    try {
      // Check if this is a multi-instrument strategy
      const isMultiInstrument = aiTrade.setup.strike.includes(" & ");

      if (isMultiInstrument) {
        await this.processMultiInstrumentStrategy(aiTrade);
      }
      // else {
      //   await this.processSingleInstrumentStrategy(aiTrade);
      // }

      // Mark AI trade as processed // wed testing
      aiTrade.processedToStrategy = true;
      await aiTrade.save();
    } catch (error) {
      console.error(
        `❌ Error converting AI trade ${aiTrade.aiTradeId}:`,
        error
      );
    }
  }

  // Process multi-instrument strategy (like "BankNifty 54300 PUT & BankNifty 55100 CALL")
  async processMultiInstrumentStrategy(aiTrade) {
    try {
      console.log(`Processing multi-instrument strategy: ${aiTrade.title}`);

      // Parse individual instruments
      const instruments = this.parseMultiInstrumentStrike(aiTrade.setup.strike);

      // Create strategy trade document
      const strategyTrade = new StrategyTrade({
        strategyId: aiTrade.aiTradeId,
        title: aiTrade.title,
        sentiment: aiTrade.sentiment,
        logic: aiTrade.logic,
        confidence: aiTrade.confidence,
        riskLevel: aiTrade.riskLevel,
        status: "suggested",
        suggestedAt: aiTrade.suggestedAt,
        tags: aiTrade.tags || [],

        // Convert instruments to individual trades
        trades: instruments.map((instrument, index) => ({
          tradeId: `${aiTrade.aiTradeId}_trade_${index + 1}`,
          symbol: this.extractSymbolFromStrike(instrument.strike),
          sentiment: aiTrade.sentiment,

          setup: {
            currentPrice: instrument.currentPrice || aiTrade.setup.currentPrice,
            strategy: aiTrade.setup.strategy,
            strike: instrument.strike,
            expiry: aiTrade.setup.expiry,
            instrumentKey: this.generateInstrumentKey(instrument.strike),
          },

          tradePlan: {
            entry: this.calculateIndividualEntry(
              aiTrade.tradePlan.entry,
              instruments.length,
              index
            ),
            target: this.calculateIndividualTarget(
              aiTrade.tradePlan.target,
              instruments.length,
              index
            ),
            stopLoss: this.calculateIndividualStopLoss(
              aiTrade.tradePlan.stopLoss,
              instruments.length,
              index
            ),
            timeFrame: aiTrade.tradePlan.timeFrame,
          },

          status: "pending",
          isValid: true,
          createdAt: new Date(),
        })),
      });

      await strategyTrade.save();
      console.log(
        `✅ Multi-instrument strategy created: ${aiTrade.title} with ${instruments.length} trades`
      );

      // Update original AI trade
      aiTrade.isStrategy = true;
      await aiTrade.save();
    } catch (error) {
      console.error(`❌ Error processing multi-instrument strategy:`, error);
    }
  }

  // Parse multi-instrument strike string
  parseMultiInstrumentStrike(strikeString) {
    // Handle cases like "BankNifty 54300 PUT & BankNifty 55100 CALL"
    if (!strikeString.includes(" & ")) {
      return [{ strike: strikeString.trim() }];
    }

    const instruments = strikeString.split(" & ");
    return instruments.map((instrument) => {
      const cleanStrike = instrument.trim();
      return {
        strike: cleanStrike,
        // You can add logic to parse individual current prices if available
        currentPrice: this.extractCurrentPriceFromStrike(cleanStrike),
      };
    });
  }

  // Extract symbol from strike (Nifty, BankNifty, etc.)
  extractSymbolFromStrike(strike) {
    if (!strike) return "Unknown";

    const parts = strike.split(" ");
    return parts[0]; // First word is usually the symbol
  }

  // Generate instrument key for API calls
  generateInstrumentKey(strike) {
    // This would generate the proper instrument key for your trading API
    // Example format: "NSE:BANKNIFTY2482754300PE"
    const parts = strike.split(" ");
    if (parts.length >= 3) {
      const symbol = parts[0];
      const strikePrice = parts[1];
      const optionType = parts[2];

      // Generate key based on your API format
      return `${symbol.toUpperCase()}${strikePrice}${
        optionType === "CALL" ? "CE" : "PE"
      }`;
    }

    return strike;
  }

  // Extract current price from strike if embedded
  extractCurrentPriceFromStrike(strike) {
    // If price is embedded in strike, extract it
    // Otherwise return null and it will use the main current price
    return null;
  }

  // Calculate individual entry prices for multi-instrument strategies
  calculateIndividualEntry(originalEntry, totalInstruments, instrumentIndex) {
    // For strategies, you might want to split the entry or keep it same
    // This is strategy-specific logic
    return originalEntry; // Keep same for now
  }

  // Calculate individual target prices
  calculateIndividualTarget(originalTarget, totalInstruments, instrumentIndex) {
    return originalTarget; // Strategy-specific logic here
  }

  // Calculate individual stop loss prices
  calculateIndividualStopLoss(
    originalStopLoss,
    totalInstruments,
    instrumentIndex
  ) {
    return originalStopLoss; // Strategy-specific logic here
  }

  // Get processing statistics
  async getProcessingStats() {
    try {
      const totalAiTrades = await AiTrade.countDocuments();
      const processedToStrategy = await AiTrade.countDocuments({
        processedToStrategy: true,
      });
      const totalStrategies = await StrategyTrade.countDocuments();
      const pendingProcessing = await AiTrade.countDocuments({
        processedToStrategy: { $ne: true },
        status: "suggested",
        isValid: true,
      });

      return {
        totalAiTrades,
        processedToStrategy,
        totalStrategies,
        pendingProcessing,
        processingRate:
          totalAiTrades > 0
            ? ((processedToStrategy / totalAiTrades) * 100).toFixed(2)
            : 0,
      };
    } catch (error) {
      console.error("❌ Error getting processing stats:", error);
      return {};
    }
  }

  // Process specific AI trade by ID
  async processSpecificAiTrade(aiTradeId) {
    try {
      const aiTrade = await AiTrade.findOne({ aiTradeId });

      if (!aiTrade) {
        throw new Error(`AI Trade with ID ${aiTradeId} not found`);
      }

      if (aiTrade.processedToStrategy) {
        console.log(`AI Trade ${aiTradeId} already processed to strategy`);
        return false;
      }

      await this.convertAiTradeToStrategy(aiTrade);
      return true;
    } catch (error) {
      console.error(
        `❌ Error processing specific AI trade ${aiTradeId}:`,
        error
      );
      return false;
    }
  }

  // Reprocess all AI trades (useful for updates or corrections)
  async reprocessAllAiTrades(force = false) {
    try {
      console.log("🔄 Starting reprocessing of all AI trades...");

      let query = { status: "suggested", isValid: true, isStrategy: true };
      if (!force) {
        query.processedToStrategy = { $ne: true };
      }

      const aiTrades = await AiTrade.find(query);
      console.log(
        `Found ${aiTrades.length} AI trades to ${
          force ? "reprocess" : "process"
        }`
      );

      for (const aiTrade of aiTrades) {
        if (force) {
          // Delete existing strategy if reprocessing
          await StrategyTrade.deleteOne({ strategyId: aiTrade.aiTradeId });
        }

        await this.convertAiTradeToStrategy(aiTrade);
      }

      console.log("✅ Reprocessing completed");
      return true;
    } catch (error) {
      console.error("❌ Error reprocessing AI trades:", error);
      return false;
    }
  }

  async processExistingStrategyTrades() {
    try {
      console.log("🔄 Processing existing isStrategy trades...");

      // Find all AiTrades marked as strategy but not processed yet
      const aiTrades = await AiTrade.find({
        isStrategy: true,
        processedToStrategy: { $ne: true },
        isValid: true,
      });

      console.log(
        `Found ${aiTrades.length} existing strategy trades to process`
      );

      for (const aiTrade of aiTrades) {
        await this.convertAiTradeToStrategy(aiTrade);
      }

      console.log("✅ Existing strategy trades processing completed");
      return aiTrades.length;
    } catch (error) {
      console.error("❌ Error processing existing strategy trades:", error);
      return 0;
    }
  }

  // Clean up orphaned or invalid strategy trades
  async cleanupStrategyTrades() {
    try {
      console.log("🧹 Starting strategy trades cleanup...");

      // Find strategy trades without corresponding AI trades
      const strategyTrades = await StrategyTrade.find();
      let cleanedCount = 0;

      for (const strategy of strategyTrades) {
        const correspondingAiTrade = await AiTrade.findOne({
          aiTradeId: strategy.strategyId,
        });

        if (!correspondingAiTrade) {
          console.log(`Removing orphaned strategy: ${strategy.strategyId}`);
          await StrategyTrade.deleteOne({ _id: strategy._id });
          cleanedCount++;
        }
      }

      console.log(
        `✅ Cleanup completed - removed ${cleanedCount} orphaned strategies`
      );
      return cleanedCount;
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
      return 0;
    }
  }
}

// Export singleton instance
module.exports = new StrategyTradeProcessor();
