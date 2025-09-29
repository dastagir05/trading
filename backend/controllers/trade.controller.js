const Trades = require("../models/trade.model");
const User = require("../models/user.model");
const updateTradeAfterTrade = require("../utils/updateTradeAfterComTrade");
const updateUserAfterTrade = require("../utils/updateUserAfterComTrade");
const aiTradeIntegration = require("../services/aiTradeIntegration");

exports.getTrades = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
  }

  const trades = await Trades.find({ userId });
  res.status(200).json(trades);
};

exports.createTrade = async (req, res) => {
  const {
    userId,
    symbol,
    instrumentKey,
    quantity,
    entryPrice,
    side,
    capCategory,
    entryTime,
    description,
    validityTime,
    status,
    lotSize,
    stoploss,
    target,
  } = req.body;

  try {
    const marginUsed = quantity * entryPrice;
    const timestampIST = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
    const trade = await Trades.create({
      userId,
      symbol,
      instrumentKey,
      quantity,
      entryPrice,
      capCategory,
      entryTime,
      side,
      description,
      marginUsed,
      validityTime,
      status,
      lotSize,
      stoploss,
      target,
      notes: [
        {
          timestamp: Date.now(),
          message: `Trade Created- Entry at ₹${entryPrice}, Quantity: ${quantity}, Side: ${side}, at ${timestampIST}`,
          type: "success",
        },
      ],
    });

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.openPositions += 1;
    // ✅ If the trade is already marked as inprocess, do similar updates
    if (status === "inprocess") {
      user.totalMoney -= marginUsed;
      user.currSymbols = symbol;
      user.totalTrades += 1;

      trade.notes.push({
        timestamp: Date.now(),
        message: "Trade activated and is now in process",
        type: "success",
      });
      await trade.save();

      const prevQuantity = user.frequencySymbols.get(symbol) || 0;
      user.frequencySymbols.set(symbol, prevQuantity + quantity);

      const sorted = [...user.frequencySymbols.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([sym]) => sym);

      user.favouriteSymbols = sorted;

      await user.save();
    }

    console.log("Trade", trade);

    res.status(200).json({ success: true, trade });
  } catch (error) {
    console.log("Trade Error", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.closeTradeManual = async (req, res) => {
  const { userId, tradeId } = req.body;
  console.log("user in close manuaal", userId, tradeId);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const trade = await Trades.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    if (trade.status !== "pending" && trade.status !== "inprocess") {
      return res.status(400).json({ error: "Trade already closed" });
    }

    const now = new Date();
    if (trade.status === "pending") {
      trade.status = "user exited manually";
      trade.exitTime = now;
      await trade.save();
      return res
        .status(200)
        .json({ success: true, message: "Pending trade closed" });
    }

    await updateTradeAfterTrade({ trade, status: "user exited manually" });
    updateUserAfterTrade({ user, trade });

    // Update AI trade if this is an AI-generated trade
    if (trade.isAiTrade) {
      await aiTradeIntegration.updateAiTradeFromTrade(
        trade._id,
        "user exited manually"
      );
    }

    await trade.save();
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Trade closed successfully" });
  } catch (error) {
    console.error("❌ closeTradeManual error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.modifyTargetStoploss = async (req, res) => {
  const { userId, tradeId, target, stoploss } = req.body;
  console.log("mtarget sl", userId, tradeId, target, stoploss);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const trade = await Trades.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    if (trade.status !== "pending" && trade.status !== "inprocess") {
      return res.status(400).json({ error: "Trade are completed" });
    }

    if (target !== 0) {
      trade.target = target;
    }
    if (stoploss !== 0) {
      trade.stoploss = stoploss;
    }

    await trade.save();
    return res.json({ message: "Target and/or Stoploss updated", trade });
  } catch (error) {
    console.error("❌ modifyTargetStoploss error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// AI Trade Integration Methods

// Execute AI trade suggestion
exports.executeAiTrade = async (req, res) => {
  try {
    const { userId, aiTradeId, quantity, marginUsed, lotSize } = req.body;

    if (!userId || !aiTradeId) {
      return res.status(400).json({
        error: "User ID and AI Trade ID are required",
      });
    }

    const result = await aiTradeIntegration.convertAiTradeToTrade(
      aiTradeId,
      userId,
      { quantity, marginUsed, lotSize }
    );

    res.status(200).json({
      success: true,
      message: "AI trade executed successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ executeAiTrade error:", error);
    res.status(500).json({
      error: "Failed to execute AI trade",
      details: error.message,
    });
  }
};

// Get user's AI trade performance
exports.getUserAiTradePerformance = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    const performance = await aiTradeIntegration.getUserAiTradePerformance(
      userId
    );

    res.status(200).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    console.error("❌ getUserAiTradePerformance error:", error);
    res.status(500).json({
      error: "Failed to get AI trade performance",
      details: error.message,
    });
  }
};

// Get personalized AI trade suggestions for user
exports.getPersonalizedAiTradeSuggestions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sentiment, riskLevel } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    const preferences = {};
    if (sentiment) preferences.sentiment = sentiment;
    if (riskLevel) preferences.riskLevel = riskLevel;

    const result = await aiTradeIntegration.getPersonalizedAiTradeSuggestions(
      userId,
      preferences
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ getPersonalizedAiTradeSuggestions error:", error);
    res.status(500).json({
      error: "Failed to get personalized AI trade suggestions",
      details: error.message,
    });
  }
};
