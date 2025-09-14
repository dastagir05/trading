const AiTrade = require("../models/aiTrade.model");
const Trades = require("../models/trade.model");
const aiTradeProcessor = require("../services/aiTradeProcessor");

class AiTradeIntegration {
  constructor() {
    this.isProcessing = false;
  }

  // Convert AI trade suggestion to actual trade
  async convertAiTradeToTrade(aiTradeId, userId, tradeData) {
    try {
      const aiTrade = await AiTrade.findOne({ aiTradeId });

      if (!aiTrade) {
        throw new Error("AI trade not found");
      }

      if (aiTrade.status !== "suggested" && aiTrade.status !== "active") {
        throw new Error("AI trade is not available for execution");
      }

      // Create new trade based on AI suggestion
      const newTrade = new Trades({
        userId,
        symbol:
          aiTrade.setup.symbol || this.extractSymbol(aiTrade.setup.strike),
        instrumentKey:
          aiTrade.setup.instrumentKey || this.generateInstrumentKey(aiTrade),
        quantity: tradeData.quantity || 1,
        entryPrice: parseFloat(
          aiTrade.tradePlan.entry.replace("₹", "").replace(",", "")
        ),
        validityTime: this.calculateValidityTime(aiTrade.tradePlan.timeFrame),
        side: this.determineTradeSide(aiTrade.sentiment),
        marginUsed: tradeData.marginUsed || 0,
        stoploss: parseFloat(
          aiTrade.tradePlan.stopLoss.replace("₹", "").replace(",", "")
        ),
        target: parseFloat(
          aiTrade.tradePlan.target.replace("₹", "").replace(",", "")
        ),
        lotSize: tradeData.lotSize || 1,

        // AI Trade tracking
        isAiTrade: true,
        aiTradeId: aiTrade.aiTradeId,
        aiConfidence: aiTrade.confidence,
        aiSentiment: aiTrade.sentiment,
      });

      await newTrade.save();

      // Update AI trade status
      await aiTrade.updateStatus("active");
      await aiTrade.addNote(`Trade executed by user ${userId}`, "success");

      console.log(
        `🔄 AI trade ${aiTradeId} converted to trade ${newTrade._id} for user ${userId}`
      );

      return {
        success: true,
        trade: newTrade,
        aiTrade: aiTrade,
      };
    } catch (error) {
      console.error(`❌ Error converting AI trade to trade:`, error);
      throw error;
    }
  }

  // Update AI trade when actual trade status changes
  async updateAiTradeFromTrade(tradeId, newStatus, exitPrice = null) {
    try {
      const trade = await Trades.findById(tradeId);

      if (!trade || !trade.isAiTrade) {
        return;
      }

      const aiTrade = await AiTrade.findOne({ aiTradeId: trade.aiTradeId });

      if (!aiTrade) {
        return;
      }

      let aiTradeStatus = aiTrade.status;
      let exitReason = "";

      switch (newStatus) {
        case "target achieve":
          aiTradeStatus = "target_hit";
          exitReason = "Target price achieved";
          break;
        case "stoploss hit":
          aiTradeStatus = "stoploss_hit";
          exitReason = "Stop loss triggered";
          break;
        case "expired":
          aiTradeStatus = "expired";
          exitReason = "Trade validity expired";
          break;
        case "user exited manually":
          aiTradeStatus = "cancelled";
          exitReason = "User manually exited trade";
          break;
      }

      if (aiTradeStatus !== aiTrade.status) {
        await aiTrade.updateStatus(aiTradeStatus, exitReason);

        if (exitPrice) {
          aiTrade.exitPrice = exitPrice;
          aiTrade.exitTime = new Date();
          await aiTrade.save();
        }

        await aiTrade.addNote(
          `Trade ${newStatus} - Exit price: ₹${exitPrice || "N/A"}`,
          "info"
        );

        console.log(
          `🔄 AI trade ${aiTrade.aiTradeId} status updated to ${aiTradeStatus}`
        );
      }
    } catch (error) {
      console.error(`❌ Error updating AI trade from trade:`, error);
    }
  }

  // Get AI trade performance for a specific user
  async getUserAiTradePerformance(userId) {
    try {
      const userAiTrades = await Trades.find({
        userId,
        isAiTrade: true,
      }).populate("aiTradeId");

      const performance = {
        totalTrades: userAiTrades.length,
        activeTrades: 0,
        completedTrades: 0,
        totalPnL: 0,
        winRate: 0,
        avgConfidence: 0,
        sentimentBreakdown: {
          bullish: 0,
          bearish: 0,
          neutral: 0,
        },
        trades: [],
      };

      let totalConfidence = 0;
      let winningTrades = 0;

      userAiTrades.forEach((trade) => {
        if (trade.status === "active") {
          performance.activeTrades++;
        } else if (
          [
            "target achieve",
            "stoploss hit",
            "expired",
            "user exited manually",
          ].includes(trade.status)
        ) {
          performance.completedTrades++;

          if (trade.pnl > 0) {
            winningTrades++;
          }

          performance.totalPnL += trade.pnl || 0;
        }

        if (trade.aiConfidence) {
          totalConfidence += trade.aiConfidence;
        }

        if (trade.aiSentiment) {
          performance.sentimentBreakdown[trade.aiSentiment]++;
        }

        performance.trades.push({
          id: trade._id,
          symbol: trade.symbol,
          status: trade.status,
          pnl: trade.pnl,
          aiConfidence: trade.aiConfidence,
          aiSentiment: trade.aiSentiment,
          createdAt: trade.createdAt,
          completedAt: trade.exitTime,
        });
      });

      if (performance.completedTrades > 0) {
        performance.winRate =
          (winningTrades / performance.completedTrades) * 100;
      }

      if (userAiTrades.length > 0) {
        performance.avgConfidence = totalConfidence / userAiTrades.length;
      }

      return performance;
    } catch (error) {
      console.error(`❌ Error getting user AI trade performance:`, error);
      throw error;
    }
  }

  // Get AI trade suggestions for a user based on their preferences
  async getPersonalizedAiTradeSuggestions(userId, preferences = {}) {
    try {
      const userPerformance = await this.getUserAiTradePerformance(userId);

      // Get AI trades based on user's historical performance
      let query = {
        status: "suggested",
        isValid: true,
      };

      // Filter by confidence level based on user's success rate
      if (userPerformance.winRate > 70) {
        query.confidence = { $gte: 60 }; // High performers can take higher risk
      } else if (userPerformance.winRate > 50) {
        query.confidence = { $gte: 70 }; // Medium performers need higher confidence
      } else {
        query.confidence = { $gte: 80 }; // Low performers need very high confidence
      }

      // Filter by sentiment based on user's historical performance
      if (preferences.sentiment) {
        query.sentiment = preferences.sentiment;
      }

      // Filter by risk level based on user's preferences
      if (preferences.riskLevel) {
        query.riskLevel = preferences.riskLevel;
      }

      const suggestions = await AiTrade.find(query)
        .sort({ confidence: -1, createdAt: -1 })
        .limit(10);

      return {
        success: true,
        suggestions,
        userPerformance,
        filters: query,
      };
    } catch (error) {
      console.error(
        `❌ Error getting personalized AI trade suggestions:`,
        error
      );
      throw error;
    }
  }

  // Helper methods
  extractSymbol(strike) {
    if (!strike) return "Unknown";
    if (strike.includes("CE") || strike.includes("PE")) {
      return strike.split(" ")[0];
    }
    return strike;
  }

  generateInstrumentKey(aiTrade) {
    // This would integrate with your instrument key generation logic
    return `${aiTrade.setup.symbol}_${Date.now()}`;
  }

  calculateValidityTime(timeFrame) {
    const now = new Date();

    if (timeFrame === "Intraday") {
      // Set to today's market close (3:30 PM)
      const validity = new Date();
      validity.setHours(15, 30, 0, 0);

      if (now > validity) {
        validity.setDate(validity.getDate() + 1);
      }

      return validity;
    } else if (timeFrame.includes("days")) {
      const days = parseInt(timeFrame.match(/\d+/)[0]);
      return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

    return now;
  }

  determineTradeSide(sentiment) {
    return sentiment === "bullish" ? "buy" : "sell";
  }

  // Sync AI trade data with market data (placeholder for integration)
  async syncAiTradeWithMarketData(aiTradeId) {
    try {
      const aiTrade = await AiTrade.findOne({ aiTradeId });

      if (!aiTrade) {
        throw new Error("AI trade not found");
      }

      // Here you would integrate with your market data service
      // const currentPrice = await getCurrentPrice(aiTrade.setup.symbol);
      // const entryPrice = parseFloat(aiTrade.tradePlan.entry.replace('₹', ''));
      // const targetPrice = parseFloat(aiTrade.tradePlan.target.replace('₹', ''));
      // const stopLossPrice = parseFloat(aiTrade.tradePlan.stopLoss.replace('₹', ''));

      // Update AI trade with current market data
      // aiTrade.setup.currentPrice = currentPrice;
      // await aiTrade.save();

      return aiTrade;
    } catch (error) {
      console.error(`❌ Error syncing AI trade with market data:`, error);
      throw error;
    }
  }
}

module.exports = new AiTradeIntegration();
