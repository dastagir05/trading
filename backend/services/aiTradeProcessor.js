const cron = require("node-cron");
const AiTrade = require("../models/aiTrade.model");
const fs = require("fs").promises;
const path = require("path");
const setOptData = require("../aiTradeSugg/setOptionData/setOptData");
const getArrayLTP = require("./getLtp");

class AiTradeProcessor {
  constructor() {
    this.tradeSuggestionsPath = path.join(
      __dirname,
      "../aiTradeSugg/tradeSuggestions.json"
    );
    this.isProcessing = false;
    this.arrSuggIK = []; //all suggested symbol
    this.arractiveIK = []; //all active instrukey
    this.combineIK = []
    this.priceOfIK = []; //allsuggactive ik with their price 
  }

  // Initialize the cron jobs
  init() {
    // Generate fresh trade suggestions every 30 minutes during market hours
    cron.schedule(
      "20,47 9-14 * * 1-5",
      () => {
        this.generateFreshSuggestions();
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
      "0 16 * * 1-5",
      () => {
        this.dailyCleanup();
      },
      {
        timezone: "Asia/Kolkata",
      }
    );

    console.log("🤖 AI Trade Processor initialized with cron jobs");
  }

  async deleteExpiredTrades() {
    try {
      const result = await AiTrade.deleteMany({
        status: "expired",
        isValid: true,
      });

      console.log(`🗑 Deleted ${result.deletedCount} expired trades`);
    } catch (error) {
      console.error("❌ Error deleting expired trades:", error);
    }
  }

  async testActiveExpire() {
    try {
      const suggestedTrades = await AiTrade.find({
        status: "active_expired",
        isValid: true,
      });

      console.log(
        `Found ${suggestedTrades.length} suggested trades to monitor`
      );

      for (const trade of suggestedTrades) {
        await this.checkTargetStopLoss(trade);
      }
    } catch (error) {
      console.error("❌ Error monitoring suggested trades:", error);
    }
  }

  async setFreshValueOfIK(){
  
    this.combineIK = this.arrSuggIK.concat(this.arractiveIK.filter(x => !this.arrSuggIK.includes(x)));
    const Ik = await getArrayLTP(this.combineIK)
    console.log("IK setFFresh", Ik,this.combineIK)
    this.priceOfIK = Ik;
  }

  // Generate fresh trade suggestions
  async generateFreshSuggestions() {
    if (this.isProcessing) {
      console.log("⏳ Fresh trade generation already in progress, skipping...");
      return;
    }

    try {
      this.isProcessing = true;
      console.log("🔄 Generating fresh AI trade suggestions...");

      // Import the fresh trade generator
      const {
        generateFreshTradeSuggestions,
      } = require("../aiTradeSugg/generateFreshTrades");

      // Generate fresh suggestions
      const freshTrades = await generateFreshTradeSuggestions();

      console.log(`✅ Generated ${freshTrades.length} fresh trade suggestions`);
    } catch (error) {
      console.error("❌ Error generating fresh trade suggestions:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Monitor suggested trades for activation
  async monitorSuggestedTrades() {
    try {
      const suggestedTrades = await AiTrade.find({
        status: "suggested",
        isValid: true,
      });

      console.log(
        `Found ${suggestedTrades.length} suggested trades to monitor`
      );

      for (const trade of suggestedTrades) {
        if (trade.setup.strike.split(" ").length < 5) {
          if (trade.setup.instrument_key && !this.combineIK.includes(trade.setup.instrument_key)){
              this.arrSuggIK.push(trade.setup.instrument_key);
              this.setFreshValueOfIK()
              console.log("sugg ik found ", trade.setup.instrument_key);
          }
          await this.checkSuggestedTradeForActivation(trade);
        } else {
          console.log(
            "two trade strike have more then 3 letter",
            trade.setup.strike
          );
        }
      }
    } catch (error) {
      console.error("❌ Error monitoring suggested trades:", error);
    }
  }

  // Monitor active AI trades for exit conditions
  async monitorActiveTrades() {
    try {
      const activeTrades = await AiTrade.find({
        status: "active",
        isValid: true,
      });

      console.log(`Found ${activeTrades.length} active trades to monitor`);
      // if (trade.setup.strike.split(" ").length < 4) {
      //   await this.checkSuggestedTradeForActivation(trade);
      // }
      for (const trade of activeTrades) {
        if (trade.isStrategy === true) {
          continue;
        } else {
          if (trade.setup.instrument_key && !this.combineIK.includes(trade.setup.instrument_key)){
            this.arractiveIK.push(trade.setup.instrument_key)
            console.log("act ik found ", trade.setup.instrument_key);
            this.setFreshValueOfIK()
        }
          await this.checkActiveTradeStatus(trade);
        }
      }
    } catch (error) {
      console.error("❌ Error monitoring active trades:", error);
    }
  }

  // Check suggested trade for activation
  async checkSuggestedTradeForActivation(trade) {
    try {
      const now = new Date();

      // Check if trade has expired before activation
      if (trade.expiryDate && now > trade.expiryDate) {
        await trade.updateStatus(
          "expired",
          "Trade suggestion expired before activation"
        );
        await trade.addNote(
          `Trade suggestion expired at ${trade.expiryDate}`,
          "warning"
        );
        console.log(`⏰ AI trade suggestion expired: ${trade.title}`);
        return;
      }

      // Check if market is open and conditions are met for activation
      if (this.isMarketOpen()) {
        // Check if entry conditions are met (you can add more sophisticated logic here)
        const shouldActivate = await this.checkEntryConditions(trade);

        if (shouldActivate) {
          await this.activateTrade(trade);
        }
      }
    } catch (error) {
      console.error(
        `❌ Error checking suggested trade for activation ${trade.aiTradeId}:`,
        error
      );
    }
  }

  // Check active trade for exit conditions
  async checkActiveTradeStatus(trade) {
    try {
      const now = new Date();

      // Check if trade has expired
      if (trade.expiryDate && now > trade.expiryDate) {
        await trade.updateStatus(
          "active_expired",
          "Active trade expired based on timeframe"
        );
        await trade.addNote(
          `Active trade expired at ${trade.expiryDate}`,
          "warning"
        );
        console.log(`⏰ Active AI trade expired: ${trade.title}`);
        await this.checkTargetStopLoss(trade);
        return;
      }

      // For active trades, check target and stop loss
      await this.checkTargetStopLoss(trade);
    } catch (error) {
      console.error(
        `❌ Error checking active trade status for ${trade.aiTradeId}:`,
        error
      );
    }
  }

  // Check entry conditions for suggested trades
  async checkEntryConditions(trade) {
    try {
      let words = trade.setup.strike.split(" ");
      const currentPrice = await this.getCurrentMarketPrice(words,trade);
      const suggestedEntry = this.parsePrice(trade.tradePlan.entry);
      const suggestedTarget = this.parsePrice(trade.tradePlan.target);

      if (!currentPrice || !suggestedEntry) {
        console.log(`Cannot get price data for ${trade.setup.symbol}`);
        return false;
      }

      // Allow 1% tolerance for entry price
      const tolerance = suggestedEntry * 0.01;
      let priceInRange = Math.abs(currentPrice - suggestedEntry) <= tolerance;
      if (
        priceInRange === false &&
        currentPrice > suggestedEntry &&
        currentPrice + 10 < suggestedTarget
      ) {
        // this also good for buy not for sell
        priceInRange = true;
      }
      // console.log("tooll", Math.abs(currentPrice - suggestedEntry),tolerance,)
      console.log(
        `Entry check for ${trade.title}: Current: ${currentPrice}, Entry: ${suggestedEntry}, In Range: ${priceInRange}`
      );

      return priceInRange;
    } catch (error) {
      console.error(
        `❌ Error checking entry conditions for ${trade.aiTradeId}:`,
        error
      );
      return false;
    }
  }

  // Activate a trade
  async activateTrade(trade) {
    try {
      // Get current market price for entry
      console.log("active trades", trade);
      let words = trade.setup.strike.split(" ");
      const currentPrice = await this.getCurrentMarketPrice(words,trade);

      // Update trade status and record entry details
      await trade.updateStatus(
        "active",
        `Trade activated at market price ₹${currentPrice}`
      );

      // Record entry price and time
      trade.entryPrice = currentPrice;
      // console.log("active trde with quantity", words, words[0])
      if (words[0] === "Nifty") {
        trade.quantity = 75;
      } else {
        trade.quantity = 35;
      }
      trade.entryTime = new Date();
      await trade.save();

      await trade.addNote(
        `Trade activated - Entry at ₹${currentPrice}`,
        "success"
      );

      console.log(`🚀 AI trade activated: ${trade.title} at ₹${currentPrice}`);
      return true;
    } catch (error) {
      console.error(`❌ Error activating trade ${trade.aiTradeId}:`, error);
      return false;
    }
  }

  // Check target and stop loss for active trades
  async checkTargetStopLoss(trade) {
    try {
      // console.log("cTS", trade)
      let words = trade.setup.strike.split(" ");
      const currentPrice = await this.getCurrentMarketPrice(words,trade);
      const entryPrice =
        trade.entryPrice || this.parsePrice(trade.tradePlan.entry);
      const targetPrice = this.parsePrice(trade.tradePlan.target);
      const stopLossPrice = this.parsePrice(trade.tradePlan.stopLoss);

      if (!currentPrice || !entryPrice || !targetPrice || !stopLossPrice) {
        console.log(`Missing price data for ${trade.setup.symbol}`);
        return;
      }

      console.log(
        `Price check for ${trade.title}: Current: ${currentPrice}, Target: ${targetPrice}, SL: ${stopLossPrice}`
      );

      if (trade.status === "active_expired") {
        const pnl = this.calculatePnL(
          entryPrice,
          currentPrice,
          trade.sentiment
        );
        await trade.addNote(
          `Expired at ₹${currentPrice}. P&L: ₹${pnl}`,
          "warning"
        );

        // Update P&L
        trade.pnl = pnl * trade.quantity;
        trade.exitPrice = currentPrice;
        trade.exitTime = new Date();
        this.calculateCharges(currentPrice, trade);
        await trade.save();

        console.log(
          `Sum up Active Expired for ${trade.title}: ₹${currentPrice}, P&L: ₹${pnl}`
        );
      }

      // Check for target hit // i add active_expired
      /*
       if (
        (trade.sentiment === "bullish" && currentPrice+1 >= targetPrice ) ||
        (trade.sentiment === "bearish" && currentPrice <= targetPrice) 
      )
      */
      if (currentPrice >= targetPrice) {
        const pnl = this.calculatePnL(
          entryPrice,
          currentPrice,
          trade.sentiment
        );
        await trade.updateStatus("target_hit", "Target price achieved");
        await trade.addNote(
          `Target hit at ₹${currentPrice}. P&L: ₹${pnl}`,
          "success"
        );

        // Update P&L
        trade.pnl = pnl * trade.quantity;
        trade.exitPrice = currentPrice;
        trade.exitTime = new Date();
        this.calculateCharges(currentPrice, trade);
        await trade.save();

        console.log(
          `🎯 Target hit for ${trade.title}: ₹${currentPrice}, P&L: ₹${pnl}`
        );
      }
      // Check for stop loss hit
      /* 
      (
        (trade.sentiment === "bullish" && currentPrice <= stopLossPrice) ||
        (trade.sentiment === "bearish" && currentPrice >= stopLossPrice)
      )
      */
      else if (currentPrice <= stopLossPrice) {
        const pnl = this.calculatePnL(
          entryPrice,
          currentPrice,
          trade.sentiment
        );
        await trade.updateStatus("stoploss_hit", "Stop loss triggered");
        await trade.addNote(
          `Stop loss hit at ₹${currentPrice}. P&L: ₹${pnl.toFixed(2)}`,
          "warning"
        );

        // Update P&L
        trade.pnl = pnl * trade.quantity;
        trade.exitPrice = currentPrice;
        trade.exitTime = new Date();
        this.calculateCharges(currentPrice, trade);
        await trade.save();

        console.log(
          `🛑 Stop loss hit for ${trade.title}: ₹${currentPrice}, P&L: ₹${pnl}`
        );
      }
    } catch (error) {
      console.error(
        `❌ Error checking target/stop loss for ${trade.aiTradeId}:`,
        error
      );
    }
  }

  // Calculate P&L based on entry and exit prices
  /*
  calculatePnL(entryPrice, exitPrice, sentiment) 
  { if (sentiment === "bullish") { return exitPrice - entryPrice; } 
   else if (sentiment === "bearish") { return entryPrice - exitPrice; } 
   return 0; }
  */
  // this is hadling only Buying either call or sell but we need to implement sell option to
  calculatePnL(entryPrice, exitPrice) {
    return exitPrice - entryPrice; // Same for CE & PE because you BUY both
  }

  async calculateCharges(last_price, trade) {
    // console.log("CalCHar", last_price, trade)
    const brokerage = 40;
    const stt = last_price * trade.quantity * 0.001;
    const sebi = trade.entryPrice * last_price * trade.quantity * 0.000001;
    const gst = brokerage * 0.18;
    const totalCharges = parseFloat((brokerage + stt + sebi + gst).toFixed(2));

    const grossPnl = trade.pnl;

    const netPnl = grossPnl - totalCharges;
    const percentPnL = parseFloat(
      ((grossPnl / (trade.entryPrice * trade.quantity)) * 100).toFixed(2)
    );
    console.log("my exit", grossPnl, netPnl, trade.entryPrice);
    trade.netPnL = parseFloat(netPnl.toFixed(2));
    trade.percentPnL = percentPnL;
    trade.charges = {
      brokerage: +brokerage.toFixed(2),
      stt: +stt.toFixed(2),
      sebi: +sebi.toFixed(2),
      gst: +gst.toFixed(2),
      total: totalCharges,
    };
  }

  // Get current market price (placeholder - integrate with your market data provider)
  async getCurrentMarketPrice(words,trade) {

    if(trade.setup.instrument_key){
      if(this.priceOfIK.length > 0){
        console.log("i am sending cuMP")
        let r1 =  this.priceOfIK.find(obj => (obj.instrument_key === trade.setup.instrument_key)? obj.last_price : null)
        console.log("r1",trade.setup.instrument_key,r1.last_price)
        return r1.last_price 
      } else {
        console.log("Price of IK arr is 0")
      }
    }

    // console.log("words", words); //expected Nifty 25000 CALL/PUT
    // const [name, strikePrice, side] = words;
    // const filePath = path.join(
    //   __dirname,
    //   "../aiTradeSugg/setOptionData/marketData.json"
    // );
    // const rawData = await fs.readFile(filePath, "utf8"); // 👈 async version
    // const marketData = JSON.parse(rawData);

    // try {
    //   console.log(
    //     `Getting current price for ${name} ${strikePrice} ${side} ...`
    //   );

    //   if (name === "Nifty") {
    //     let activeOP = marketData.nifty.optionChain;
    //     // console.log("nifty price at procc", marketData.nifty.currentPrice)
    //     for (const stpr of activeOP) {
    //       if (stpr.strike_price == strikePrice) {
    //         if (side === "CALL") {
    //           return stpr.call?.ltp; // return ltp if exists
    //         } else {
    //           return stpr.put?.ltp;
    //         }
    //       }
    //     }
    //   } else {
    //     let activeOP = marketData.bankNifty.optionChain;
    //     for (const stpr of activeOP) {
    //       if (stpr.strike_price == strikePrice) {
    //         if (side === "CALL") {
    //           return stpr.call?.ltp; // return ltp if exists
    //         } else {
    //           return stpr.put?.ltp;
    //         }
    //       }
    //     }
    //   }

    //   // if not found, return random variation
    //   const basePrice = 100;
    //   const randomVariation = (Math.random() - 0.5) * 10;
    //   console.log("rnvarr", randomVariation);
    //   return basePrice + randomVariation;
    // } catch (error) {
    //   console.error(`Error getting current price for ${strikePrice}:`, error);
    //   return null;
    // }
  }

  // Parse price string to number
  parsePrice(priceString) {
    if (!priceString) return null;
    const cleanPrice = priceString.toString().replace(/[₹,\s]/g, "");
    const price = parseFloat(cleanPrice);
    return isNaN(price) ? null : price;
  }

  // Process new trade suggestions from JSON file (legacy method)
  async processNewSuggestions() {
    if (this.isProcessing) {
      console.log("⏳ AI Trade processing already in progress, skipping...");
      return;
    }

    try {
      this.isProcessing = true;
      console.log("🔄 Processing new AI trade suggestions...");

      const suggestionsData = await fs.readFile(
        this.tradeSuggestionsPath,
        "utf8"
      );
      const suggestions = JSON.parse(suggestionsData);

      for (const suggestion of suggestions) {
        await this.processSuggestion(suggestion);
      }

      console.log("✅ AI trade suggestions processed successfully");
    } catch (error) {
      console.error("❌ Error processing AI trade suggestions:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process individual trade suggestion
  async processSuggestion(suggestion) {
    try {
      // Check if this suggestion already exists
      const existingTrade = await AiTrade.findOne({ aiTradeId: suggestion.id });

      if (existingTrade) {
        // Update existing trade if it's still in suggested state
        if (existingTrade.status === "suggested") {
          await this.updateSuggestion(existingTrade, suggestion);
        }
        return;
      }

      // Create new AI trade with 'suggested' status
      console.log("creating new suggestion to AiTrade", suggestion.isStrategy);
      const aiTrade = new AiTrade({
        aiTradeId: suggestion.id,
        title: suggestion.title,
        sentiment: suggestion.sentiment,
        setup: {
          currentPrice: suggestion.setup.currentPrice,
          strategy: suggestion.setup.strategy,
          strike: suggestion.setup.strike,
          expiry: suggestion.setup.expiry,
          symbol: this.extractSymbol(suggestion.setup.strike),
        },
        isStrategy: suggestion.isStrategy === "true",
        tradePlan: suggestion.tradePlan,
        logic: suggestion.logic,
        confidence: suggestion.confidence,
        riskLevel: suggestion.riskLevel,
        suggestedAt: new Date(suggestion.timestamp),
        status: "suggested", // Explicitly set status
        tags: this.generateTags(suggestion),
      });

      await aiTrade.save();
      console.log(`📝 New AI trade suggestion created: ${suggestion.title}`);

      // Add initial note
      await aiTrade.addNote("AI trade suggestion created", "info");
    } catch (error) {
      console.error(`❌ Error processing suggestion ${suggestion.id}:`, error);
    }
  }

  // Update existing suggestion
  async updateSuggestion(existingTrade, suggestion) {
    try {
      // Update relevant fields
      existingTrade.setup.currentPrice = suggestion.setup.currentPrice;
      existingTrade.confidence = suggestion.confidence;
      existingTrade.riskLevel = suggestion.riskLevel;
      existingTrade.tradePlan = suggestion.tradePlan;

      await existingTrade.save();
      await existingTrade.addNote("Trade suggestion updated", "info");

      console.log(`🔄 Updated AI trade suggestion: ${suggestion.title}`);
    } catch (error) {
      console.error(`❌ Error updating suggestion ${suggestion.id}:`, error);
    }
  }

  // Daily cleanup and reporting
  async dailyCleanup() {
    try {
      console.log("🧹 Starting daily AI trade cleanup...");

      // Mark expired suggestions as invalid
      const expiredSuggestions = await AiTrade.find({
        status: "suggested",
        // processedToStrategy:false,
        // expiryDate: { $lt: new Date() },
        isValid: true,
      });

      for (const trade of expiredSuggestions) {
        await trade.updateStatus(
          "expired",
          "Trade suggestion expired during cleanup"
        );
        await trade.addNote(
          "Trade suggestion expired and marked as invalid",
          "warning"
        );
      }

      // Generate daily report
      await this.generateDailyReport();

      console.log(
        `✅ Daily cleanup completed - ${expiredSuggestions.length} expired suggestions cleaned up`
      );
    } catch (error) {
      console.error("❌ Error during daily cleanup:", error);
    }
  }

  // Generate daily report
  async generateDailyReport() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dailyStats = await AiTrade.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalConfidence: { $avg: "$confidence" },
            totalPnL: { $sum: { $ifNull: ["$pnl", 0] } },
          },
        },
      ]);

      const totalTrades = await AiTrade.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      });

      console.log("📊 Daily AI Trade Report:");
      console.log(`Total suggestions: ${totalTrades}`);
      let reportText = `📊 Daily AI Trade Report - ${new Date().toLocaleString(
        "en-IN",
        { timeZone: "Asia/Kolkata" }
      )}\n`;
      reportText += `Total suggestions: ${totalTrades}\n`;

      dailyStats.forEach((stat) => {
        reportText += `${stat._id}: ${stat.count} trades, Avg confidence: ${
          stat.totalConfidence?.toFixed(1) || "N/A"
        }%, P&L: ₹${stat.totalPnL?.toFixed(2) || "0"}\n`;
      });

      // write to file (overwrite each day)
      await fs.appendFile("ai-daily-report.txt", reportText, "utf-8");
      console.log("Report saved ✅");
    } catch (error) {
      console.error("❌ Error generating daily report:", error);
    }
  }

  // Helper methods
  extractSymbol(strike) {
    if (!strike) return "Unknown";
    if (strike.includes("CE") || strike.includes("PE")) {
      return strike.split(" ")[0]; // Extract symbol from "NIFTY 24650 CE"
    }
    return strike;
  }

  generateTags(suggestion) {
    const tags = [];

    if (suggestion.setup.strategy) tags.push(suggestion.setup.strategy);
    if (suggestion.sentiment) tags.push(suggestion.sentiment);
    if (suggestion.riskLevel) tags.push(suggestion.riskLevel);
    if (suggestion.tradePlan.timeFrame)
      tags.push(suggestion.tradePlan.timeFrame);

    return tags;
  }

  isMarketOpen() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 100 + minute;
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Market hours: 9:15 AM to 3:30 PM (IST), Monday to Friday
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = currentTime >= 915 && currentTime <= 1530;

    return isWeekday && isMarketHours;
  }

  // Get AI trade statistics
  async getStats() {
    try {
      const stats = await AiTrade.aggregate([
        {
          $group: {
            _id: null,
            totalTrades: { $sum: 1 },
            suggestedTrades: {
              $sum: { $cond: [{ $eq: ["$status", "suggested"] }, 1, 0] },
            },
            activeTrades: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
            },
            targetHitNumber: {
              $sum: { $cond: [{ $eq: ["$status", "target_hit"] }, 1, 0] },
            },
            stopLossHitNumber: {
              $sum: { $cond: [{ $eq: ["$status", "stoploss_hit"] }, 1, 0] },
            },
            activeExpiredNumber: {
              $sum: { $cond: [{ $eq: ["$status", "active_expired"] }, 1, 0] },
            },
            completedTrades: {
              $sum: {
                $cond: [
                  {
                    $in: ["$status", ["target_hit", "stoploss_hit", "expired"]],
                  },
                  1,
                  0,
                ],
              },
            },
            avgConfidence: { $avg: "$confidence" },
            totalPnL: { $sum: { $ifNull: ["$pnl", 0] } },
            winRate: {
              $avg: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$status", "suggested"] },
                      { $ne: ["$status", "active"] },
                      { $ne: ["$status", "active_expired"] },
                    ],
                  },
                  { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] },
                  null,
                ],
              },
            },
          },
        },
      ]);

      return stats[0] || {};
    } catch (error) {
      console.error("❌ Error getting AI trade stats:", error);
      return {};
    }
  }

  // Get AI trades by status
  async getTradesByStatus(status, limit = 50) {
    try {
      const query = status === "all" ? {} : { status };
      return await AiTrade.find(query).sort({ createdAt: -1 }).limit(limit);
    } catch (error) {
      console.error(`❌ Error getting trades by status ${status}:`, error);
      return [];
    }
  }
}

module.exports = new AiTradeProcessor();
