const { Schema, model } = require("mongoose");

const AiTradeSchema = new Schema(
  {
    aiTradeId: {
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
    setup: {
      currentPrice: Number,
      strategy: String,
      strike: String,
      expiry: String,
      symbol: String,
      instrumentKey: String,
    },
    tradePlan: {
      entry: String,
      target: String,
      stopLoss: String,
      timeFrame: String,
    },
    logic: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
    },
    
    // Trade execution details
    status: {
      type: String,
      enum: [
        "suggested",
        "active",
        "target_hit",
        "stoploss_hit",
        "expired",
        "cancelled"
      ],
      default: "suggested",
    },
    
    // Entry details
    entryPrice: Number,
    entryTime: Date,
    quantity: Number,
    marginUsed: Number,
    
    // Exit details
    exitPrice: Number,
    exitTime: Date,
    exitReason: String,
    
    // Performance metrics
    pnl: Number,
    netPnL: Number,
    percentPnL: Number,
    charges: {
      brokerage: Number,
      stt: Number,
      gst: Number,
      sebi: Number,
      total: Number,
    },
    
   
    // Timestamps
    suggestedAt: {
      type: Date,
      default: Date.now,
    },
    activatedAt: Date,
    completedAt: Date,
    
    // Validity
    isValid: {
      type: Boolean,
      default: true,
    },
    expiryDate: Date,
    
    // Tags for categorization
    tags: [String],
    
    // Notes and updates
    notes: [{
      timestamp: Date,
      message: String,
      type: {
        type: String,
        enum: ["info", "warning", "error", "success"],
      },
    }],
  },
  { 
    timestamps: true,
    collection: "aiTrades"
  }
);

// Indexes for better query performance
AiTradeSchema.index({ status: 1, createdAt: -1 });
AiTradeSchema.index({ symbol: 1, status: 1 });
AiTradeSchema.index({ sentiment: 1, status: 1 });
AiTradeSchema.index({ confidence: -1, status: 1 });
AiTradeSchema.index({ riskLevel: 1, status: 1 });
AiTradeSchema.index({ suggestedAt: -1 });

// Pre-save middleware to calculate PnL
AiTradeSchema.pre("save", function (next) {
  if (this.exitPrice && this.entryPrice && this.quantity && this.status !== "suggested") {
    const grossPnL = (this.exitPrice - this.entryPrice) * this.quantity;
    const charges = this.charges?.total || 0;
    this.pnl = parseFloat((grossPnL - charges).toFixed(2));
    
    if (this.entryPrice > 0) {
      this.percentPnL = parseFloat(
        ((this.pnl / (this.entryPrice * this.quantity)) * 100).toFixed(2)
      );
    }
  }
  
  // Set expiry date based on timeFrame
  if (this.tradePlan?.timeFrame && !this.expiryDate) {
    const now = new Date();
    if (this.tradePlan.timeFrame === "Intraday") {
      // Set to today's market close (3:30 PM)
      this.expiryDate = new Date();
      this.expiryDate.setHours(15, 30, 0, 0);
    } else if (this.tradePlan.timeFrame.includes("days")) {
      const days = parseInt(this.tradePlan.timeFrame.match(/\d+/)[0]);
      this.expiryDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    }
  }
  
  next();
});

// Method to add notes
AiTradeSchema.methods.addNote = function(message, type = "info") {
  this.notes.push({
    timestamp: new Date(),
    message,
    type,
  });
  return this.save();
};

// Method to update status
AiTradeSchema.methods.updateStatus = function(newStatus, exitReason = null) {
  this.status = newStatus;
  
  if (newStatus === "active" && !this.activatedAt) {
    this.activatedAt = new Date();
  } else if (["target_hit", "stoploss_hit", "expired", "cancelled"].includes(newStatus)) {
    this.completedAt = new Date();
    if (exitReason) {
      this.exitReason = exitReason;
    }
  }
  
  return this.save();
};

const AiTrade = model("AiTrade", AiTradeSchema);

module.exports = AiTrade;
