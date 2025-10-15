const { Schema, model } = require("mongoose");

const StrategyTradeSchema = new Schema(
  {
    strategyId: {
      // Changed from aiTradeId for clarity
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    sentiment: {
      type: String,
      required: true,
    },
    logic: String,
    instrument_keys: String,

    // Individual trades within the strategy
    trades: [
      {
        tradeId: {
          // Unique identifier for each trade
          type: String,
          required: true,
        },
        tradeType: {
          type: String,
          enum: ["BUY", "SELL", "UNKNOWN"],
          default: "UNKNOWN",
        },

        setup: {
          currentPrice: Number,
          instrument_key: String,
          strategy: String,
          strike: String,
          expiry: String,
        },

        tradePlan: {
          entry: String,
          target: String,
          stopLoss: String,
          timeFrame: String,
        },

        // Trade execution status
        status: {
          type: String,
          enum: [
            "pending",
            "active",
            "target_hit",
            "stoploss_hit",
            "expired",
            "cancelled",
            "strategy_exit",
            "complete",
          ],
          default: "pending",
        },

        // Entry details
        entryPrice: Number,
        entryTime: Date,
        quantity: Number,

        // Exit details
        exitPrice: Number,
        exitTime: Date,
        exitReason: String,

        // Trade-specific performance
        pnl: Number,
        netPnL: Number,
        percentPnL: Number,

        charges: {
          brokerage: { type: Number, default: 0 },
          stt: { type: Number, default: 0 },
          gst: { type: Number, default: 0 },
          sebi: { type: Number, default: 0 },
          total: { type: Number, default: 0 },
        },

        // Trade timestamps
        createdAt: { type: Date, default: Date.now },
        activatedAt: Date,
        completedAt: Date,

        // Trade validity
        isValid: { type: Boolean, default: true },
        expiryDate: Date,
      },
    ],

    // Strategy-level metrics
    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
    },

    // Overall strategy execution details
    status: {
      type: String,
      enum: [
        "suggested",
        "strategy_exit",
        "partial_active", // Some trades active, some not
        "fully_active", // All trades active
        "completed", // All trades completed
        "cancelled",
        "expired",
      ],
      default: "suggested",
    },

    // Strategy-level aggregated metrics
    totalMarginUsed: Number,
    totalPnL: Number,
    totalNetPnL: Number,
    totalPercentPnL: Number,

    totalCharges: {
      brokerage: { type: Number, default: 0 },
      stt: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      sebi: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    expiryDate: Date,

    // Strategy timestamps
    suggestedAt: {
      type: String,
    },
    activatedAt: Date, // When first trade becomes active
    completedAt: Date, // When all trades are completed

    // Strategy validity
    isValid: {
      type: Boolean,
      default: true,
    },

    // Strategy notes (keep strategy-level notes)
    notes: [
      {
        timestamp: { type: String, default: new Date().toISOString() },
        message: String,
        type: {
          type: String,
          enum: ["info", "warning", "error", "success", "expired_on_time"],
        },
      },
    ],

    // Tags for categorization
    tags: [String],

    // Strategy metadata
    totalTrades: { type: Number, default: 0 },
    activeTrades: { type: Number, default: 0 },
    completedTrades: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "strategyTrades",
  }
);

// Indexes for better query performance
StrategyTradeSchema.index({ status: 1, createdAt: -1 });
StrategyTradeSchema.index({ "trades.symbol": 1, status: 1 });
StrategyTradeSchema.index({ sentiment: 1, status: 1 });
StrategyTradeSchema.index({ confidence: -1, status: 1 });
StrategyTradeSchema.index({ riskLevel: 1, status: 1 });
StrategyTradeSchema.index({ suggestedAt: -1 });
StrategyTradeSchema.index({ "trades.status": 1 });

// Pre-save middleware to calculate strategy-level metrics
// StrategyTradeSchema.pre("save", function (next) {
//   // Calculate strategy totals from individual trades
//   this.totalTrades = this.trades.length;
//   this.activeTrades = this.trades.filter(
//     (trade) => trade.status === "active"
//   ).length;
//   this.completedTrades = this.trades.filter((trade) =>
//     ["target_hit", "stoploss_hit", "expired", "cancelled"].includes(
//       trade.status
//     )
//   ).length;

//   // Calculate individual trade PnL
//   this.trades.forEach((trade) => {
//     if (
//       trade.exitPrice &&
//       trade.entryPrice &&
//       trade.quantity &&
//       trade.status !== "pending"
//     ) {
//       const grossPnL = (trade.exitPrice - trade.entryPrice) * trade.quantity;
//       const charges = trade.charges?.total || 0;
//       trade.pnl = parseFloat((grossPnL - charges).toFixed(2));
//       trade.netPnL = trade.pnl;

//       if (trade.entryPrice > 0) {
//         trade.percentPnL = parseFloat(
//           ((trade.pnl / (trade.entryPrice * trade.quantity)) * 100).toFixed(2)
//         );
//       }

//       // Set trade expiry date
//       if (trade.tradePlan?.timeFrame && !trade.expiryDate) {
//         const now = new Date();
//         if (trade.tradePlan.timeFrame === "Intraday") {
//           trade.expiryDate = new Date();
//           trade.expiryDate.setHours(15, 30, 0, 0);
//         } else if (trade.tradePlan.timeFrame.includes("days")) {
//           const days = parseInt(
//             trade.tradePlan.timeFrame.match(/\d+/)?.[0] || "1"
//           );
//           trade.expiryDate = new Date(
//             now.getTime() + days * 24 * 60 * 60 * 1000
//           );
//         }
//       }
//     }
//   });

//   // Calculate strategy-level totals
//   this.totalPnL = this.trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
//   this.totalNetPnL = this.totalPnL;

//   this.totalCharges.total = this.trades.reduce(
//     (sum, trade) => sum + (trade.charges?.total || 0),
//     0
//   );

//   // Update strategy status based on trade statuses
//   if (this.completedTrades === this.totalTrades && this.totalTrades > 0) {
//     this.status = "completed";
//     if (!this.completedAt) this.completedAt = new Date();
//   } else if (this.activeTrades > 0) {
//     this.status =
//       this.activeTrades === this.totalTrades
//         ? "fully_active"
//         : "partial_active";
//     if (!this.activatedAt) this.activatedAt = new Date();
//   }

//   next();
// });

// Method to add notes
StrategyTradeSchema.methods.addNote = function (message, type = "info") {
  this.notes.push({
    timestamp: new Date(),
    message,
    type,
  });
  return this.save();
};

// Method to update strategy status
StrategyTradeSchema.methods.updateStatus = function (newStatus, reason = null) {
  this.status = newStatus;

  if (["completed", "cancelled", "expired"].includes(newStatus)) {
    this.completedAt = new Date();
  }

  if (reason) {
    this.addNote(reason, "info");
  }

  return this.save();
};

// Method to add a trade to the strategy
StrategyTradeSchema.methods.addTrade = function (tradeData) {
  const tradeId = `${this.strategyId}_trade_${this.trades.length + 1}`;
  this.trades.push({
    ...tradeData,
    tradeId,
    createdAt: new Date(),
  });
  return this.save();
};

// Method to update a specific trade
StrategyTradeSchema.methods.updateTrade = function (tradeId, updateData) {
  const trade = this.trades.find((t) => t.tradeId === tradeId);
  if (trade) {
    Object.assign(trade, updateData);

    if (updateData.status === "active" && !trade.activatedAt) {
      trade.activatedAt = new Date();
    } else if (
      ["target_hit", "stoploss_hit", "expired", "cancelled"].includes(
        updateData.status
      )
    ) {
      trade.completedAt = new Date();
    }
  }
  return this.save();
};

// Method to get active trades
StrategyTradeSchema.methods.getActiveTrades = function () {
  return this.trades.filter((trade) => trade.status === "active");
};

// Method to get completed trades
StrategyTradeSchema.methods.getCompletedTrades = function () {
  return this.trades.filter((trade) =>
    ["target_hit", "stoploss_hit", "expired", "cancelled"].includes(
      trade.status
    )
  );
};

const StrategyTrade = model("StrategyTrade", StrategyTradeSchema);

module.exports = StrategyTrade;
