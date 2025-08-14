const Trades = require("../../models/trade.model");
const User = require("../../models/user.model");
const updateTradeAfterTrade = require("../../utils/updateTradeAfterComTrade");
const updateUserAfterTrade = require("../../utils/updateUserAfterComTrade");

const expiredTrades = async () => {
  try {
    const now = new Date();

    const tradesToExpire = await Trades.find({
      validityTime: { $lt: now },
      status: { $in: ["pending", "inprocess"] },
    });

    if (tradesToExpire.length === 0) {
      console.log("✅ No trades to expire.");
      return;
    }

    console.log(`⚠️ Found ${tradesToExpire.length} trades to expire...`);

    for (const trade of tradesToExpire) {
      const user = await User.findById(trade.userId);
      if (!user) {
        console.warn(`⚠️ Skipped trade ${trade._id} — user not found`);
        continue;
      }

      if (trade.status === "pending") {
        trade.status = "expired";
        trade.exitTime = now;
        await trade.save();
        console.log(`🕒 Pending trade expired: ${trade.symbol}`);
        continue;
      }

      // Trade is inprocess, so compute exit based on LTP
      await updateTradeAfterTrade({ trade, status: "expired" });
      await updateUserAfterTrade({ user, trade });

      await trade.save();
      await user.save();

      console.log(`⛔ Inprocess trade expired: ${trade.symbol}`);
    }

    console.log("✅ Expired trade handling completed.");
  } catch (error) {
    console.error("❌ Error expiring trades:", error.message);
  }
};

module.exports = expiredTrades;
