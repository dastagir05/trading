const cron = require("node-cron");
const AiTrade = require("../models/aiTrade.model");
const StrategyTrade = require("../models/strategyTrade.model");
const fs = require("fs").promises;
const path = require("path");
const getArrayLTP = require("./getLtp");

class StrategyTradeProcessor {
  constructor() {
    this.tradeSuggestionsPath = path.join(
      __dirname,
      "../aiTradeSugg/tradeSuggestions.json"
    );
    this.isProcessing = false;
    this.arrSuggIK = []; //all suggested symbol
    this.arractiveIK = []; //all active instrukey
    this.combineIK = []
    this.priceOfIK = [];
  }

  init() {
    // convert aitradeS to strategy trades every 30 minutes during market hours
    cron.schedule(
      "21,48 9-14 * * 1-5",
      () => {
        this.processAiTradesToStrategies();
      },
      {
        timezone: "Asia/Kolkata",
      }
    );

    // Monitor suggested strategy trades for activation every 1 minute
    cron.schedule(
      "*/1 9-15 * * 1-5",
      async () => {
        this.monitorSuggestedStrategyTrades();
      },
      {
        timezone: "Asia/Kolkata",
      }
    );

    // Monitor active strategy trades every 1 minute
    cron.schedule(
      "*/1 9-15 * * 1-5",
      () => {
        console.log("Monitoring active strategy trades for exit conditions");
        this.monitorActiveStrategyTrades();
      },
      {
        timezone: "Asia/Kolkata",
      }
    );

    console.log("🤖 Strategy Trade Processor initialized with cron jobs");
  }

  async setFreshValueOfIK(){
  
    this.combineIK = this.arrSuggIK.concat(this.arractiveIK.filter(x => !this.arrSuggIK.includes(x)));
    const Ik = await getArrayLTP(this.combineIK)
    console.log("IK setFFresh", Ik,this.combineIK)
    this.priceOfIK = Ik;
  }

  // Process AI trades that are strategies
  async processAiTradesToStrategies() {
    if (this.isProcessing) {
      console.log("⏳ Strategy processing already in progress, skipping...");
      return;
    }

    try {
      this.isProcessing = true;
      console.log("🔄 Processing AI strategy trades...");

      // Find AI trades marked as strategies that haven't been processed
      const aiTrades = await AiTrade.find({
        isStrategy: true,
        processedToStrategy: { $ne: true },
        isValid: true,
        status: "suggested",
      }).sort({ createdAt: -1 });

      console.log(`Found ${aiTrades.length} AI strategy trades to process`);

      for (const aiTrade of aiTrades) {
        await this.convertAiTradeToStrategy(aiTrade);
      }

      console.log("✅ AI strategy trade processing completed");
    } catch (error) {
      console.error("❌ Error processing AI strategy trades:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  parseMultipleValues(valueString) {
    if (!valueString) return [];

    // Handle both "&" and "," separators
    const values = valueString.split(/[&,]/).map((val) => val.trim());
    return values;
  }

  // Convert AI trade to strategy format
  async convertAiTradeToStrategy(aiTrade) {
    try {
      console.log(`Processing strategy: ${aiTrade.title}`);

      // Check if strategy already exists
      const existingStrategy = await StrategyTrade.findOne({
        strategyId: aiTrade.aiTradeId,
      });

      if (existingStrategy) {
        console.log(`Strategy ${aiTrade.aiTradeId} already exists`);
        aiTrade.processedToStrategy = true;
        await aiTrade.save();
        return;
      }

      // Parse individual instruments from strike
      const instruments = this.parseMultiInstrumentStrike(aiTrade.setup.strike);
      // Parse entry, target, and stopLoss values
      const instrument_keys = this.parseMultipleValues(aiTrade.setup.instrument_key)
      const entryValues = this.parseMultipleValues(aiTrade.tradePlan.entry);
      const targetValues = this.parseMultipleValues(aiTrade.tradePlan.target);
      const stopLossValues = this.parseMultipleValues(
        aiTrade.tradePlan.stopLoss
      );

      this.validateTradePlanValues(
        instruments,
        instrument_keys,
        entryValues,
        targetValues,
        stopLossValues
      );
      console.log(`Found ${instruments.length} instruments`);
      console.log(`Instrument keys: ${instrument_keys}`)
      console.log(`Entry values: ${entryValues}`);
      console.log(`Target values: ${targetValues}`);
      console.log(`StopLoss values: ${stopLossValues}`);

      // Determine trade type (BUY/SELL) from sentiment or strategy
      const tradeType = this.determineTradeType(aiTrade);
      console.log(`Determined trade type as: ${tradeType}`);

      // Create strategy trade
      const strategyTrade = new StrategyTrade({
        strategyId: aiTrade.aiTradeId,
        title: aiTrade.title,
        sentiment: aiTrade.sentiment,
        logic: aiTrade.logic,
        confidence: aiTrade.confidence,
        riskLevel: aiTrade.riskLevel,
        status: "suggested",
        expiryDate: aiTrade.expiryDate,
        instrument_keys: aiTrade.setup.instrument_key,
        suggestedAt: aiTrade.suggestedAt,
        tags: aiTrade.tags || [],
        tradeType: tradeType, // Add trade type to strategy

        // Convert instruments to individual trades
        trades: instruments.map((instrument, index) => ({
          tradeId: `${aiTrade.aiTradeId}_trade_${index + 1}`,
          symbol: this.extractSymbolFromStrike(instrument.strike),
          sentiment: aiTrade.sentiment,
          tradeType: tradeType, // BUY or SELL

          setup: {
            instrument_key: instrument_keys[index] ||
            instrument_keys[0] ||
            aiTrade.setup.instrument_key,
            currentPrice: instrument.currentPrice || aiTrade.setup.currentPrice,
            strategy: aiTrade.setup.strategy,
            strike: instrument.strike,
            expiry: aiTrade.setup.expiry,
          },

          tradePlan: {
            entry:
              entryValues[index] || entryValues[0] || aiTrade.tradePlan.entry,
            target:
              targetValues[index] ||
              targetValues[0] ||
              aiTrade.tradePlan.target,
            stopLoss:
              stopLossValues[index] ||
              stopLossValues[0] ||
              aiTrade.tradePlan.stopLoss,
            timeFrame: aiTrade.tradePlan.timeFrame,
          },

          status: "pending",
          isValid: true,
          createdAt: new Date(),
        })),
      });

      await strategyTrade.save();

      // Mark AI trade as processed
      aiTrade.processedToStrategy = true;
      await aiTrade.save();

      console.log(
        `✅ Strategy Trade Separated: ${aiTrade.title} with ${instruments.length} trades (${tradeType})`
      );
    } catch (error) {
      console.error(`❌ Error converting AI trade to strategy:`, error);
    }
  }

  // NEW: Determine if this is a BUY or SELL strategy
  determineTradeType(aiTrade) {
    // First check if "SELL" is explicitly mentioned in the strike
    const strikeString = aiTrade.setup?.strike?.toUpperCase() || "";
    console.log(`Determining trade type from strike: ${strikeString}`);
    if (strikeString.includes(" SELL")) {
      return "SELL";
    }

    // Check for BUY explicitly mentioned
    if (strikeString.includes(" BUY")) {
      return "BUY";
    }

    // Fallback: Check strategy name or title for SELL indicators
    const sellIndicators = [
      "sell",
      "short",
      "write",
      "covered call",
      "cash secured put",
      "iron condor",
      "iron butterfly",
    ];
    const titleLower = aiTrade.title?.toLowerCase() || "";
    const strategyLower = aiTrade.setup?.strategy?.toLowerCase() || "";

    const isSellStrategy = sellIndicators.some(
      (indicator) =>
        titleLower.includes(indicator) || strategyLower.includes(indicator)
    );
    console.log(`Inferred trade type as: ${isSellStrategy ? "SELL" : "BUY"}`);
    return isSellStrategy ? "SELL" : "BUY";
  }

  // Monitor suggested strategy trades for activation
  async monitorSuggestedStrategyTrades() {
    try {
      const suggestedStrategies = await StrategyTrade.find({
        status: "suggested",
        isValid: true,
      });

      console.log(
        `Found ${suggestedStrategies.length} suggested strategies to monitor`
      );

      for (const strategy of suggestedStrategies) {
        await this.checkStrategyForActivation(strategy);
      }
    } catch (error) {
      console.error("❌ Error monitoring suggested strategies:", error);
    }
  }

  // Monitor active strategy trades
  async monitorActiveStrategyTrades() {
    try {
      const activeStrategies = await StrategyTrade.find({
        status: { $in: ["partial_active", "fully_active"] },
        isValid: true,
      });

      console.log(
        `Found ${activeStrategies.length} active strategies to monitor`
      );

      for (const strategy of activeStrategies) {
        await this.checkActiveStrategyStatus(strategy);
      }
    } catch (error) {
      console.error("❌ Error monitoring active strategies:", error);
    }
  }

  // Check strategy for activation
  async checkStrategyForActivation(strategy) {
    try {
      const now = new Date();

      // Check if any trade in strategy has expired
      const expiredTrades = strategy.trades.filter(
        (trade) => trade.expiryDate && now > trade.expiryDate
      );

      if (strategy.expiryDate && now > strategy.expiryDate) {
        for (const trade of expiredTrades) {
          await strategy.updateTrade(trade.tradeId, {
            status: "expired",
            exitReason: "Trade expired before activation",
          });
        }
        strategy.status = "expired"
        // Update parent AiTrade status
        await this.updateAiTradeStatus(strategy.strategyId, "expired");
        return;
      }

      const pendingTrades = strategy.trades.filter(
        (t) => t.status === "pending"
      );
      const activeTrades = strategy.trades.filter((t) => t.status === "active");

      if (pendingTrades.length === 0) return;

      // If any trade is already active, activate all pending trades immediately
      if (activeTrades.length > 0) {
        console.log(
          `🔥 Found ${activeTrades.length} active trades, activating all ${pendingTrades.length} pending trades immediately`
        );
        for (const trade of pendingTrades) {
          await this.activateStrategyTrade(strategy, trade);
        }
        // Update parent AiTrade status to active
        await this.updateAiTradeStatus(strategy.strategyId, "active");
        return;
      }

      // Check individual trades for first activation
      for (const trade of pendingTrades) {
        const shouldActivate = await this.checkTradeEntryConditions(trade);
        if (shouldActivate) {
          // Activate this trade
          await this.activateStrategyTrade(strategy, trade);

          // Immediately activate all other pending trades in the same strategy
          const otherPendingTrades = pendingTrades.filter(
            (t) => t.tradeId !== trade.tradeId
          );
          if (otherPendingTrades.length > 0) {
            console.log(
              `🚀 First trade activated, immediately activating ${otherPendingTrades.length} other trades in strategy`
            );
            for (const otherTrade of otherPendingTrades) {
              await this.activateStrategyTrade(strategy, otherTrade);
            }
          }

          // Update parent AiTrade status to active
          await this.updateAiTradeStatus(strategy.strategyId, "active");
          break; // Exit loop after first activation
        }
      }
    } catch (error) {
      console.error(`❌ Error checking strategy for activation:`, error);
    }
  }

  // UPDATED: Check trade entry conditions with SELL support
  async checkTradeEntryConditions(trade) {
    try {
      const words = trade.setup.strike.split(" ");
      const currentPrice = await this.getCurrentMarketPrice(words,trade);
      const suggestedEntry = this.parsePrice(trade.tradePlan.entry);

      if (!currentPrice || !suggestedEntry) {
        console.log(`Cannot get price data for ${trade.setup.strike}`);
        return false;
      }

      // Use different tolerances for BUY vs SELL
      const tolerancePercent = trade.tradeType === "SELL" ? 0.15 : 0.1; // Higher tolerance for SELL
      const tolerance = suggestedEntry * tolerancePercent;
      const priceDiff = Math.abs(currentPrice - suggestedEntry);
      const priceInRange = priceDiff <= tolerance;

      console.log(
        `Entry check for ${trade.setup.strike} (${trade.tradeType}):
        Current: ₹${currentPrice}
        Suggested: ₹${suggestedEntry} 
        Difference: ₹${priceDiff.toFixed(2)}
        Tolerance: ₹${tolerance.toFixed(2)} (${tolerancePercent * 100}%)
        In Range: ${priceInRange}`
      );

      return priceInRange;
    } catch (error) {
      console.error(`❌ Error checking trade entry conditions:`, error);
      return false;
    }
  }

  // Activate individual trade within strategy
  async activateStrategyTrade(strategy, trade) {
    try {
      const words = trade.setup.strike.split(" ");
      const currentPrice = await this.getCurrentMarketPrice(words,trade);

      if (!currentPrice) {
        console.log(
          `⚠️ Cannot get current price for ${trade.setup.strike}, skipping activation`
        );
        return false;
      }

      await strategy.updateTrade(trade.tradeId, {
        status: "active",
        entryPrice: currentPrice,
        entryTime: new Date(),
        quantity: words[0] === "Nifty" ? 75 : 35,
      });

      await strategy.addNote(
        `Trade ${trade.tradeId} (${trade.tradeType}) activated at ₹${currentPrice}`,
        "success"
      );

      console.log(
        `🚀 Strategy trade activated: ${trade.setup.strike} (${trade.tradeType}) at ₹${currentPrice}`
      );
      return true;
    } catch (error) {
      console.error(`❌ Error activating strategy trade:`, error);
      return false;
    }
  }

  // Check active strategy status
  async checkActiveStrategyStatus(strategy) {
    try {
      const now = new Date();

      for (const trade of strategy.trades.filter(
        (t) => t.status === "active"
      )) {
        // Check if trade has expired
        if (trade.expiryDate && now > trade.expiryDate) {
          await this.handleExpiredTrade(strategy, trade);
          continue;
        }

        // Check target/stop loss with SELL support
        await this.checkTradeTargetStopLoss(strategy, trade);
      }

      // Update overall strategy status
      await this.updateStrategyStatus(strategy);
    } catch (error) {
      console.error(`❌ Error checking active strategy status:`, error);
    }
  }

  // Handle expired trade
  async handleExpiredTrade(strategy, trade) {
    try {
      const words = trade.setup.strike.split(" ");
      const currentPrice = await this.getCurrentMarketPrice(words,trade);

      const pnl = this.calculatePnL(
        trade.entryPrice,
        currentPrice,
        trade.sentiment,
        trade.tradeType
      );

      await strategy.updateTrade(trade.tradeId, {
        status: "expired",
        exitPrice: currentPrice,
        exitTime: new Date(),
        exitReason: "Trade expired based on timeframe",
        pnl: pnl * trade.quantity,
      });

      this.calculateTradeCharges(currentPrice, trade);

      await strategy.addNote(
        `Trade ${trade.tradeId} (${trade.tradeType}) expired at ₹${currentPrice}`,
        "warning"
      );
    } catch (error) {
      console.error(`❌ Error handling expired trade:`, error);
    }
  }

  // UPDATED: Check target and stop loss for individual trade with SELL support
  async checkTradeTargetStopLoss(strategy, trade) {
    try {
      const words = trade.setup.strike.split(" ");
      const currentPrice = await this.getCurrentMarketPrice(words,trade);
      const targetPrice = this.parsePrice(trade.tradePlan.target);
      const stopLossPrice = this.parsePrice(trade.tradePlan.stopLoss);

      if (!currentPrice || !targetPrice || !stopLossPrice) {
        console.log(`Missing price data for ${trade.setup.strike}`);
        return;
      }

      const tradeType = trade.tradeType || "SELL";

      // UPDATED logic for BUY vs SELL strategies
      let targetHit = false;
      let stopLossHit = false;

      if (tradeType === "SELL") {
        // For SELL strategies - we sold at entry price, target is when we can buy back cheaper
        // Entry = premium received, Target = lower premium to buy back, StopLoss = higher premium
        targetHit = currentPrice <= targetPrice; // Can buy back cheaper = profit
        stopLossHit = currentPrice >= stopLossPrice; // Must buy back expensive = loss

        console.log(
          `🔍 SELL Trade Check - Current: ₹${currentPrice}, Target: ₹${targetPrice}, SL: ₹${stopLossPrice}`
        );
      } else {
        // For BUY strategies - existing logic
        if (trade.sentiment === "bullish") {
          targetHit = currentPrice >= targetPrice;
          stopLossHit = currentPrice <= stopLossPrice;
        } else {
          targetHit = currentPrice <= targetPrice;
          stopLossHit = currentPrice >= stopLossPrice;
        }

        console.log(
          `🔍 BUY Trade Check (${trade.sentiment}) - Current: ₹${currentPrice}, Target: ₹${targetPrice}, SL: ₹${stopLossPrice}`
        );
      }

      // Handle conditions
      if (targetHit) {
        await this.handleTargetHit(strategy, trade, currentPrice);
      } else if (stopLossHit) {
        await this.handleStopLossHit(strategy, trade, currentPrice);
      }
    } catch (error) {
      console.error(`❌ Error checking trade target/stop loss:`, error);
    }
  }

  // Handle target hit
  async handleTargetHit(strategy, trade, currentPrice) {
    const pnl = this.calculatePnL(
      trade.entryPrice,
      currentPrice,
      trade.sentiment,
      trade.tradeType
    );

    await strategy.updateTrade(trade.tradeId, {
      status: "target_hit",
      exitPrice: currentPrice,
      exitTime: new Date(),
      exitReason: "Target price achieved",
      pnl: pnl * trade.quantity,
    });

    this.calculateTradeCharges(currentPrice, trade);

    await strategy.addNote(
      `Trade ${trade.tradeId} (${
        trade.tradeType
      }) target hit at ₹${currentPrice}. P&L: ₹${pnl.toFixed(2)}`,
      "success"
    );

    // Exit all other active trades in the strategy
    await this.exitAllOtherActiveTrades(
      strategy,
      trade.tradeId,
      "Target hit on another trade"
    );
  }

  // Handle stop loss hit
  async handleStopLossHit(strategy, trade, currentPrice) {
    const pnl = this.calculatePnL(
      trade.entryPrice,
      currentPrice,
      trade.sentiment,
      trade.tradeType
    );
    if (pnl > 0){
      pnl = -pnl
    }

    await strategy.updateTrade(trade.tradeId, {
      status: "stoploss_hit",
      exitPrice: currentPrice,
      exitTime: new Date(),
      exitReason: "Stop loss triggered",
      pnl: pnl * trade.quantity,
    });

    this.calculateTradeCharges(currentPrice, trade);

    await strategy.addNote(
      `Trade ${trade.tradeId} (${
        trade.tradeType
      }) stop loss hit at ₹${currentPrice}. P&L: ₹${pnl.toFixed(2)}`,
      "warning"
    );

    // Exit all other active trades in the strategy
    await this.exitAllOtherActiveTrades(
      strategy,
      trade.tradeId,
      "Stop loss hit on another trade"
    );
  }

  // Exit all other active trades when one trade hits SL/Target
  async exitAllOtherActiveTrades(strategy, excludeTradeId, exitReason) {
    try {
      const otherActiveTrades = strategy.trades.filter(
        (trade) => trade.status === "active" && trade.tradeId !== excludeTradeId
      );

      if (otherActiveTrades.length === 0) {
        console.log("No other active trades to exit");
        return;
      }

      console.log(
        `🔄 Exiting ${otherActiveTrades.length} other active trades due to: ${exitReason}`
      );

      for (const trade of otherActiveTrades) {
        try {
          const words = trade.setup.strike.split(" ");
          const currentPrice = await this.getCurrentMarketPrice(words,trade);

          if (!currentPrice) {
            console.log(
              `⚠️ Cannot get current price for ${trade.setup.strike}, skipping exit`
            );
            continue;
          }

          const pnl = this.calculatePnL(
            trade.entryPrice,
            currentPrice,
            trade.sentiment,
            trade.tradeType
          );

          await strategy.updateTrade(trade.tradeId, {
            status: "strategy_exit",
            exitPrice: currentPrice,
            exitTime: new Date(),
            exitReason: exitReason,
            pnl: pnl * trade.quantity,
          });

          this.calculateTradeCharges(currentPrice, trade);

          await strategy.addNote(
            `Trade ${trade.tradeId} (${
              trade.tradeType
            }) exited at ₹${currentPrice} due to ${exitReason}. P&L: ₹${pnl.toFixed(
              2
            )}`,
            "info"
          );

          console.log(
            `✅ Exited trade ${trade.tradeId} (${trade.tradeType}) at ₹${currentPrice}`
          );
        } catch (tradeError) {
          console.error(`❌ Error exiting trade ${trade.tradeId}:`, tradeError);
        }
      }
    } catch (error) {
      console.error(`❌ Error exiting other active trades:`, error);
    }
  }

  // Update strategy status based on trade statuses
  async updateStrategyStatus(strategy) {
    try {
      const activeTrades = strategy.trades.filter((t) => t.status === "active");
      const completedTrades = strategy.trades.filter((t) =>
        ["target_hit", "stoploss_hit", "strategy_exit", "expired"].includes(
          t.status
        )
      );

      // Update strategy status
      if (activeTrades.length === 0 && completedTrades.length > 0) {
        // All trades are completed, mark strategy as completed
        strategy.status = "completed";
        strategy.completedAt = new Date();

        // UPDATED: Calculate overall strategy P&L with proper SELL handling
        const totalPnL = this.calculateStrategyTotalPnL(strategy.trades);
        const totalCharges = this.calculateStrategyTotalCharges(
          strategy.trades
        );
        const netPnL = totalPnL - totalCharges;

        strategy.totalPnL = totalPnL;
        strategy.netPnL = netPnL;
        strategy.totalCharges.total = totalCharges;
        await strategy.save();

        // Update parent AiTrade status
        await this.updateAiTradeStatus(
          strategy.strategyId,
          "completed",
          netPnL
        );

        console.log(
          `📊 Strategy ${
            strategy.strategyId
          } completed with total P&L: ₹${totalPnL.toFixed(
            2
          )}, Net P&L: ₹${netPnL.toFixed(2)}`
        );
      } else if (activeTrades.length > 0 && completedTrades.length > 0) {
        // Some trades active, some completed
        strategy.status = "partial_active";
        await strategy.save();

        // Update parent AiTrade status
        await this.updateAiTradeStatus(strategy.strategyId, "active");
      } else if (activeTrades.length === strategy.trades.length) {
        // All trades active
        strategy.status = "fully_active";
        await strategy.save();

        // Update parent AiTrade status
        await this.updateAiTradeStatus(strategy.strategyId, "active");
      }
    } catch (error) {
      console.error("❌ Error updating strategy status:", error);
    }
  }

  // UPDATED: Calculate P&L based on trade type (BUY/SELL)
  calculatePnL(entryPrice, exitPrice, sentiment, tradeType = "BUY") {
    if (tradeType === "SELL") {
      // For SELL strategies: We receive premium at entry, pay premium at exit
      // Profit = Entry Premium - Exit Premium
      return entryPrice - exitPrice;
    } else {
      // For BUY strategies: We pay premium at entry, receive premium at exit
      // Existing logic based on sentiment
      if (sentiment === "bullish") {
        return exitPrice - entryPrice; // Buy low, sell high
      } else {
        return entryPrice - exitPrice; // Buy puts - profit when price falls
      }
    }
  }

  // NEW: Calculate strategy total P&L properly handling mixed BUY/SELL trades
  calculateStrategyTotalPnL(trades) {
    return trades.reduce((total, trade) => {
      if (trade.netPnL !== undefined && trade.netPnL !== null) {
        return total + trade.netPnL;
      } else if (trade.pnl !== undefined && trade.pnl !== null) {
        return total + trade.pnl;
      }
      return total;
    }, 0);
  }

  // NEW: Calculate strategy total charges
  calculateStrategyTotalCharges(trades) {
    return trades.reduce((total, trade) => {
      if (trade.charges?.total) {
        return total + trade.charges.total;
      }
      return total;
    }, 0);
  }

  // UPDATED: Calculate trade charges with proper net P&L
  calculateTradeCharges(exitPrice, trade) {
    const brokerage = 40;
    const stt = exitPrice * trade.quantity * 0.001;
    const sebi = trade.entryPrice * exitPrice * trade.quantity * 0.000001;
    const gst = brokerage * 0.18;
    const totalCharges = parseFloat((brokerage + stt + sebi + gst).toFixed(2));

    const grossPnl = trade.pnl || 0;
    const netPnl = grossPnl - totalCharges;
    const percentPnL =
      trade.entryPrice > 0
        ? parseFloat(
            ((grossPnl / (trade.entryPrice * trade.quantity)) * 100).toFixed(2)
          )
        : 0;

    // Update trade object
    trade.netPnL = parseFloat(netPnl.toFixed(2));
    trade.percentPnL = percentPnL;
    trade.charges = {
      brokerage: +brokerage.toFixed(2),
      stt: +stt.toFixed(2),
      sebi: +sebi.toFixed(2),
      gst: +gst.toFixed(2),
      total: totalCharges,
    };

    console.log(
      `💰 Trade charges calculated - Gross P&L: ₹${grossPnl.toFixed(
        2
      )}, Net P&L: ₹${netPnl.toFixed(2)}, Charges: ₹${totalCharges}`
    );
  }

  // Update parent AiTrade status
  async updateAiTradeStatus(strategyId, status, totalPnL = null) {
    try {
      const aiTrade = await AiTrade.findOne({ aiTradeId: strategyId });
      if (!aiTrade) {
        console.log(`AiTrade with ID ${strategyId} not found`);
        return;
      }

      // Only update if status is different
      if (aiTrade.status !== status) {
        aiTrade.status = status;

        // Set P&L if provided (this should be net P&L)
        if (totalPnL !== null) {
          aiTrade.netPnL = totalPnL; // Store as net P&L
          aiTrade.pnl = totalPnL; // Keep both for compatibility
        }

        await aiTrade.save();
        await aiTrade.addNote(`Strategy status updated to: ${status}`, "info");

        console.log(
          `Updated parent AiTrade ${strategyId} status to: ${status}`
        );
      }
    } catch (error) {
      console.error(`Error updating AiTrade status for ${strategyId}:`, error);
    }
  }

  // Helper methods (keep your existing implementations)
  parseMultiInstrumentStrike(strikeString) {
    if (!strikeString.includes(" & ")) {
      return [{ strike: strikeString.trim() }];
    }

    const instruments = strikeString.split(" & ");
    return instruments.map((instrument) => ({
      strike: instrument.trim(),
      currentPrice: this.extractCurrentPriceFromStrike(instrument.trim()),
    }));
  }

  extractSymbolFromStrike(strike) {
    if (!strike) return "Unknown";
    const parts = strike.split(" ");
    return parts[0];
  }

  extractCurrentPriceFromStrike(strike) {
    return null;
  }

  parsePrice(priceString) {
    if (!priceString) return null;
    const cleanPrice = priceString.toString().replace(/[₹,\s]/g, "");
    const price = parseFloat(cleanPrice);
    return isNaN(price) ? null : price;
  }

  validateTradePlanValues(
    instruments,
    instrument_key,
    entryValues,
    targetValues,
    stopLossValues
  ) {
    const instrumentCount = instruments.length;

    if (entryValues.length !== instrumentCount) {
      console.warn(
        `⚠️ Entry values count (${entryValues.length}) doesn't match instruments count (${instrumentCount})`
      );
    }
    if (instrument_key.length !== instrumentCount) {
      console.warn(
        `⚠️ Entry values count (${instrument_key.length}) doesn't match instruments count (${instrumentCount})`
      );
    }

    if (targetValues.length !== instrumentCount) {
      console.warn(
        `⚠️ Target values count (${targetValues.length}) doesn't match instruments count (${instrumentCount})`
      );
    }

    if (stopLossValues.length !== instrumentCount) {
      console.warn(
        `⚠️ StopLoss values count (${stopLossValues.length}) doesn't match instruments count (${instrumentCount})`
      );
    }
  }

  async getCurrentMarketPrice(words,trade) {
    const [name, strikePrice, side] = words;
    const filePath = path.join(
      __dirname,
      "../aiTradeSugg/setOptionData/marketData.json"
    );
    try {
      const rawData = await fs.readFile(filePath, "utf8");
      const marketData = JSON.parse(rawData);

      if (name === "Nifty") {
        const activeOP = marketData.nifty.optionChain;
        for (const stpr of activeOP) {
          if (stpr.strike_price == strikePrice) {
            return side === "CALL" ? stpr.call?.ltp : stpr.put?.ltp;
          }
        }
      } else {
        const activeOP = marketData.bankNifty.optionChain;
        for (const stpr of activeOP) {
          if (stpr.strike_price == strikePrice) {
            return side === "CALL" ? stpr.call?.ltp : stpr.put?.ltp;
          }
        }
      }

      // Fallback to random price if not found
      const basePrice = 100;
      const randomVariation = (Math.random() - 0.5) * 10;
      return basePrice + randomVariation;
    } catch (error) {
      console.error(`Error getting current price for ${strikePrice}:`, error);
      return null;
    }
  }
}

module.exports = new StrategyTradeProcessor();
