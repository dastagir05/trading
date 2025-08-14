const { Schema, model } = require("mongoose");

const TradesSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    instrumentKey: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    validityTime: {
      type: Date,
      required: true,
      default: function () {
        const now = new Date();

        // Set 3:20 PM for today
        const validity = new Date();
        validity.setHours(15, 20, 0, 0); // 15:20:00.000

        // If current time is past 3:20 PM, set to tomorrow 3:20 PM
        if (now > validity) {
          validity.setDate(validity.getDate() + 1);
        }

        return validity;
      },
    },
    side: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },
    marginUsed: {
      type: Number,
      required: true,
    },
    capCategory: {
      type: String,
      enum: ["large", "mid", "small", "index"],
    },

    entryTime: Date,
    stoploss: Number,
    target: Number,
    lotSize: Number,

    //after trade complete
    exitPrice: Number,
    exitTime: Date,
    charges: {
      brokerage: Number,
      stt: Number,
      gst: Number,
      sebi: Number,
      total: Number, // final used
    },
    pnl: Number,
    netpnl: Number, // [(exitPrice-enteredPrice)*quantity]-estcharge
    percentPnL: Number, //  (pnl / (entryPrice * quantity)) * 100
    status: {
      type: String,
      enum: [
        "pending",
        "inprocess",
        "expired",
        "user exited manually",
        "stoploss hit",
        "target achieve",
      ],
      default: "pending",
    },
    
    // AI Trade tracking
    isAiTrade: {
      type: Boolean,
      default: false,
    },
    aiTradeId: {
      type: String,
      ref: "AiTrade",
    },
    aiConfidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiSentiment: {
      type: String,
      enum: ["bullish", "bearish", "neutral"],
    },
  },
  { timestamps: true }
);
TradesSchema.pre("save", function (next) {
  if (!this.capCategory && this.entryPrice != null) {
    if (this.entryPrice >= 700) {
      this.capCategory = "large";
    } else if (this.entryPrice >= 200) {
      this.capCategory = "mid";
    } else {
      this.capCategory = "small";
    }
  }
  if (
    this.exitPrice != null &&
    this.entryPrice != null &&
    this.quantity &&
    this.status !== "pending" &&
    this.status != "inprocess"
  ) {
    const grossPnL = (this.exitPrice - this.entryPrice) * this.quantity;
    const charges = this.charges?.total || 0;
    this.pnl = parseFloat((grossPnL - charges).toFixed(2));

    if (this.entryPrice > 0) {
      this.percentPnL = parseFloat(
        ((this.pnl / (this.entryPrice * this.quantity)) * 100).toFixed(2)
      );
    }
  }
  next();
});
TradesSchema.index({ userId: 1, status: 1 });
TradesSchema.index({ userId: 1, createdAt: -1 });
TradesSchema.index({ instrumentKey: 1, validityTime: 1 });

const Trades = model("Trades", TradesSchema);

module.exports = Trades;
