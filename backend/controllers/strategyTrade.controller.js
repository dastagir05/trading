const StrategyTrade = require("../models/strategyTrade.model");

// Create a new strategy trade
const createStrategyTrade = async (req, res) => {
  try {
    const strategyData = req.body;

    const strategyTrade = new StrategyTrade(strategyData);
    await strategyTrade.save();

    res.json({
      success: true,
      data: strategyTrade,
      message: "Strategy created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating strategy trade:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create strategy",
      error: error.message,
    });
  }
};

// Get all strategies (overview - without full trade details)
const getAllStrategies = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const strategies = await StrategyTrade.find(query, {
      strategyId: 1,
      title: 1,
      sentiment: 1,
      status: 1,
      confidence: 1,
      riskLevel: 1,
      totalTrades: 1,
      activeTrades: 1,
      completedTrades: 1,
      totalPnL: 1,
      totalNetPnL: 1,
      suggestedAt: 1,
      createdAt: 1,
      tags: 1,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: strategies,
      count: strategies.length,
    });
  } catch (error) {
    console.error("❌ Error getting strategies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch strategies",
      error: error.message,
    });
  }
};

// Get complete strategy details with all trades
const getStrategyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const strategy = await StrategyTrade.findOne({ strategyId: id });

    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: "Strategy not found",
      });
    }

    res.json({
      success: true,
      data: strategy,
    });
  } catch (error) {
    console.error("❌ Error getting strategy details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch strategy details",
      error: error.message,
    });
  }
};

// Get strategy trades summary (for strategy page)
const getStrategyTradeSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const strategy = await StrategyTrade.findOne(
      { strategyId: id },
      {
        title: 1,
        sentiment: 1,
        logic: 1,
        confidence: 1,
        riskLevel: 1,
        status: 1,
        totalTrades: 1,
        activeTrades: 1,
        completedTrades: 1,
        totalPnL: 1,
        totalNetPnL: 1,
        totalPercentPnL: 1,
        suggestedAt: 1,
        activatedAt: 1,
        completedAt: 1,
        "trades.symbol": 1,
        "trades.status": 1,
        "trades.pnl": 1,
        "trades.tradeId": 1,
      }
    );

    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: "Strategy not found",
      });
    }

    res.json({
      success: true,
      data: strategy,
    });
  } catch (error) {
    console.error("❌ Error getting strategy summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch strategy summary",
      error: error.message,
    });
  }
};

// Add individual trade to existing strategy
const addTradeToStrategy = async (req, res) => {
  try {
    const { id } = req.params;
    const tradeData = req.body;

    const strategy = await StrategyTrade.findOne({ strategyId: id });

    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: "Strategy not found",
      });
    }

    await strategy.addTrade(tradeData);

    res.json({
      success: true,
      data: strategy,
      message: "Trade added to strategy successfully",
    });
  } catch (error) {
    console.error("❌ Error adding trade to strategy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add trade to strategy",
      error: error.message,
    });
  }
};

// Update specific trade within strategy
const updateStrategyTrade = async (req, res) => {
  try {
    const { strategyId, tradeId } = req.params;
    const updateData = req.body;

    const strategy = await StrategyTrade.findOne({ strategyId });

    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: "Strategy not found",
      });
    }

    await strategy.updateTrade(tradeId, updateData);

    res.json({
      success: true,
      data: strategy,
      message: "Trade updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating strategy trade:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update trade",
      error: error.message,
    });
  }
};

// Get active trades across all strategies
const getActiveStrategyTrades = async (req, res) => {
  try {
    const strategies = await StrategyTrade.find(
      {
        $or: [{ status: "partial_active" }, { status: "fully_active" }],
      },
      {
        strategyId: 1,
        title: 1,
        trades: { $elemMatch: { status: "active" } },
        totalPnL: 1,
        activeTrades: 1,
      }
    ).sort({ activatedAt: -1 });

    res.json({
      success: true,
      data: strategies,
      count: strategies.length,
    });
  } catch (error) {
    console.error("❌ Error getting active strategy trades:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active trades",
      error: error.message,
    });
  }
};

// Get strategy performance metrics
const getStrategyPerformance = async (req, res) => {
  try {
    const { id } = req.params;

    const strategy = await StrategyTrade.findOne({ strategyId: id });

    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: "Strategy not found",
      });
    }

    const activeTrades = strategy.getActiveTrades();
    const completedTrades = strategy.getCompletedTrades();

    const winningTrades = completedTrades.filter((trade) => trade.pnl > 0);
    const losingTrades = completedTrades.filter((trade) => trade.pnl < 0);

    const performance = {
      strategyId: strategy.strategyId,
      title: strategy.title,
      totalTrades: strategy.totalTrades,
      activeTrades: activeTrades.length,
      completedTrades: completedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate:
        completedTrades.length > 0
          ? ((winningTrades.length / completedTrades.length) * 100).toFixed(2)
          : 0,
      totalPnL: strategy.totalPnL,
      totalNetPnL: strategy.totalNetPnL,
      avgPnLPerTrade:
        completedTrades.length > 0
          ? (strategy.totalPnL / completedTrades.length).toFixed(2)
          : 0,
      bestTrade:
        completedTrades.length > 0
          ? Math.max(...completedTrades.map((t) => t.pnl || 0))
          : 0,
      worstTrade:
        completedTrades.length > 0
          ? Math.min(...completedTrades.map((t) => t.pnl || 0))
          : 0,
      status: strategy.status,
      confidence: strategy.confidence,
      riskLevel: strategy.riskLevel,
    };

    res.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    console.error("❌ Error getting strategy performance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch strategy performance",
      error: error.message,
    });
  }
};

// Get strategies by status (for dashboard)
const getStrategiesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { limit = 20 } = req.query;

    const strategies = await StrategyTrade.find(
      { status },
      {
        strategyId: 1,
        title: 1,
        sentiment: 1,
        totalTrades: 1,
        activeTrades: 1,
        totalPnL: 1,
        confidence: 1,
        riskLevel: 1,
        createdAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: strategies,
      count: strategies.length,
      status,
    });
  } catch (error) {
    console.error("❌ Error getting strategies by status:", error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch ${status} strategies`,
      error: error.message,
    });
  }
};

// Add note to strategy
const addStrategyNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, type = "info" } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Note message is required",
      });
    }

    const strategy = await StrategyTrade.findOne({ strategyId: id });

    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: "Strategy not found",
      });
    }

    await strategy.addNote(message, type);

    res.json({
      success: true,
      message: "Note added successfully",
      data: strategy,
    });
  } catch (error) {
    console.error("❌ Error adding note to strategy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add note",
      error: error.message,
    });
  }
};

module.exports = {
  createStrategyTrade,
  getAllStrategies,
  getStrategyDetails,
  getStrategyTradeSummary,
  addTradeToStrategy,
  updateStrategyTrade,
  getActiveStrategyTrades,
  getStrategyPerformance,
  getStrategiesByStatus,
  addStrategyNote,
};
