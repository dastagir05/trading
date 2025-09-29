const AiTrade = require("../models/aiTrade.model");
const aiTradeProcessor = require("../services/aiTradeProcessor");

// Get all AI trades with optional filtering
const getAllAiTrades = async (req, res) => {
  try {
    const status = req.query.status;

    let trades;

    if (status === "all") {
      trades = await AiTrade.find().sort({ createdAt: -1 });
      console.log("fetch all trades", trades.length);
    } else if (status === "active") {
      console.log("fetch active trade");
      trades = await AiTrade.find({ status: "active" }).sort({ createdAt: -1 });
    } else {
      trades = await AiTrade.find({ status: "suggested" }).sort({
        createdAt: -1,
      });
    }

    return res.json({
      success: true,
      data: trades,
    });
  } catch (error) {
    console.error("❌ Error getting AI trades:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch AI trades",
      error: error.message,
    });
  }
};

// Get AI trade by ID
const getAiTradeById = async (req, res) => {
  try {
    const { id } = req.params;

    const trade = await AiTrade.findOne({ aiTradeId: id });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "AI trade not found",
      });
    }

    res.json({
      success: true,
      data: trade,
    });
  } catch (error) {
    console.error("❌ Error getting AI trade:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch AI trade",
      error: error.message,
    });
  }
};

// Get AI trade statistics
const getAiTradeStats = async (req, res) => {
  try {
    const stats = await aiTradeProcessor.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Error getting AI trade stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch AI trade statistics",
      error: error.message,
    });
  }
};

// Get AI trades by sentiment
const getAiTradesBySentiment = async (req, res) => {
  try {
    const { sentiment } = req.params;
    const { limit = 20 } = req.query;

    const trades = await AiTrade.find({ sentiment })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: trades,
      count: trades.length,
    });
  } catch (error) {
    console.error("❌ Error getting AI trades by sentiment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch AI trades by sentiment",
      error: error.message,
    });
  }
};

// Get AI trades by risk level
const getAiTradesByRiskLevel = async (req, res) => {
  try {
    const { riskLevel } = req.params;
    const { limit = 20 } = req.query;

    const trades = await AiTrade.find({ riskLevel })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: trades,
      count: trades.length,
    });
  } catch (error) {
    console.error("❌ Error getting AI trades by risk level:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch AI trades by risk level",
      error: error.message,
    });
  }
};

// Get AI trades by symbol
const getAiTradesBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 20 } = req.query;

    const trades = await AiTrade.find({
      "setup.symbol": { $regex: symbol, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: trades,
      count: trades.length,
    });
  } catch (error) {
    console.error("❌ Error getting AI trades by symbol:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch AI trades by symbol",
      error: error.message,
    });
  }
};

// Add note to AI trade
const addNoteToAiTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, type = "info" } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Note message is required",
      });
    }

    const trade = await AiTrade.findOne({ aiTradeId: id });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "AI trade not found",
      });
    }

    await trade.addNote(message, type);

    res.json({
      success: true,
      message: "Note added successfully",
      data: trade,
    });
  } catch (error) {
    console.error("❌ Error adding note to AI trade:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add note",
      error: error.message,
    });
  }
};

// Update AI trade status manually
const updateAiTradeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, exitReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const trade = await AiTrade.findOne({ aiTradeId: id });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "AI trade not found",
      });
    }

    await trade.updateStatus(status, exitReason);

    res.json({
      success: true,
      message: "AI trade status updated successfully",
      data: trade,
    });
  } catch (error) {
    console.error("❌ Error updating AI trade status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update AI trade status",
      error: error.message,
    });
  }
};

// Get AI trade performance report
const getAiTradePerformanceReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "daily" } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    let groupStage = {};
    if (groupBy === "daily") {
      groupStage = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
    } else if (groupBy === "weekly") {
      groupStage = {
        $dateToString: { format: "%Y-W%U", date: "$createdAt" },
      };
    } else if (groupBy === "monthly") {
      groupStage = {
        $dateToString: { format: "%Y-%m", date: "$createdAt" },
      };
    }

    const performanceReport = await AiTrade.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupStage,
          totalTrades: { $sum: 1 },
          activeTrades: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          completedTrades: {
            $sum: {
              $cond: [
                { $in: ["$status", ["target_hit", "stoploss_hit", "expired"]] },
                1,
                0,
              ],
            },
          },
          totalPnL: { $sum: { $ifNull: ["$pnl", 0] } },
          avgConfidence: { $avg: "$confidence" },
          winRate: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "suggested"] },
                    { $ne: ["$status", "active"] },
                  ],
                },
                { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] },
                null,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: performanceReport,
      groupBy,
    });
  } catch (error) {
    console.error("❌ Error getting AI trade performance report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch performance report",
      error: error.message,
    });
  }
};

// Force process AI trade suggestions (admin endpoint)
const forceProcessSuggestions = async (req, res) => {
  try {
    await aiTradeProcessor.processNewSuggestions();

    res.json({
      success: true,
      message: "AI trade suggestions processed successfully",
    });
  } catch (error) {
    console.error("❌ Error forcing AI trade processing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process AI trade suggestions",
      error: error.message,
    });
  }
};

module.exports = {
  getAllAiTrades,
  getAiTradeById,
  getAiTradeStats,
  getAiTradesBySentiment,
  getAiTradesByRiskLevel,
  getAiTradesBySymbol,
  addNoteToAiTrade,
  updateAiTradeStatus,
  getAiTradePerformanceReport,
  forceProcessSuggestions,
};
