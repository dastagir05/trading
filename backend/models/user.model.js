const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    // 🔐 AUTHENTICATION / PROFILE
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    image: {
      type: String,
    },
    provider: {
      type: String, // e.g., "google", "github"
    },
    providerId: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    lastLogin: {
      type: Date,
    },

    // 💰 TRADING STATISTICS
    totalMoney: {
      type: Number,
      default: 1000000,
    },
    realisedPL: {
      type: Number,
      default: 0,
    },
    unrealisedPL: {
      type: Number,
      default: 0,
    },
    pnl: {
      type: Number,
      default: 0, // Can be realisedPL + unrealisedPL
    },
    avgPnL: {
      type: Number,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    totalLoss: {
      type: Number,
      default: 0,
    },
    totalEstCharge: {
      type: Number,
      default: 0,
    },
    totalTrades: {
      type: Number,
      default: 0,
    },
    totalCompletedTrades:{
      type:Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
    },
    openPositions: {
      type: Number,
      default: 0,
    },
    lastTradeAt: {
      type: Date,
    },
    bestTrade: {
      type: Schema.Types.ObjectId,
      ref: "Trades",
    },
    worstTrade: {
      type: Schema.Types.ObjectId,
      ref: "Trades",
    },

    // ⚙️ USER PREFERENCES
    currSymbols: String,
    frequencySymbols: {
      type: Map,
      of: Number, // represents quantity
      default: {},
    },
    favouriteSymbols: {
      type: [String],
      default: [],
    }, // top stock of freqSym
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

// const User = model("user", userSchema);
const User = model("User", userSchema);

module.exports = User;

// 🔒 RISK MANAGEMENT (Optional)
// useRiskLimits: {
//   type: Boolean,
//   default: false,
// },
// maxTradeRisk: {
//   type: Number,
//   default: 0.02, // 2% of totalMoney
// },
// dailyLossLimit: {
//   type: Number,
//   default: 0.05, // 5% of totalMoney
// },

// if user remain only 3000 then use this
// const calculatedRisk = user.maxTradeRisk * user.totalMoney;
// const MIN_RISK_ALLOWED = 200; // Rs 200 minimum allowed risk

// const finalRiskLimit = Math.max(calculatedRisk, MIN_RISK_ALLOWED);
