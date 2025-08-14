const Trades = require("../../models/trade.model");
const User = require("../../models/user.model");
const { getMarketStatus } = require("../../services/marketStatus");
const getLTP = require("../../services/getLtp");

const pendingEntries = async () => {
  if (!getMarketStatus()) {
    console.log("Market closed — skip entry/exit job");
    return;
  }
  const trades = await Trades.find({
    status: "pending",
    // enteredPrice: null,
  });
  console.log("pending trade start");

  for (const trade of trades) {
    const ltp = await getLTP(trade.instrumentKey);
    if (!ltp) {
      console.log(`No LTP found for ${trade.symbol}`);
      continue;
    }
    // const user = await User.find({ _id: trade.userId });
    const user = await User.findById(trade.userId);
    if (!user) {
      console.log("No user found for trade", trade._id);
      continue;
    }

    const shouldEnter =
      (trade.side === "buy" && ltp == trade.entryPrice) ||
      (trade.side === "sell" && ltp == trade.entryPrice);

    if (shouldEnter) {
      // trade.enteredPrice = ltp;
      trade.entryTime = new Date();
      trade.status = "inprocess";
      user.totalMoney -= trade.marginUsed;
      user.currSymbols = trade.symbol;
      user.totalTrades += 1;
      const prevQuantity = user.frequencySymbols.get(trade.symbol) || 0;
      user.frequencySymbols.set(trade.symbol, prevQuantity + trade.quantity);

      // Sort frequencySymbols by quantity and pick top 5
      const sorted = [...user.frequencySymbols.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([sym]) => sym);

      user.favouriteSymbols = sorted;
      console.log("Updated favourites:", user.favouriteSymbols);

      await trade.save();
      await user.save();

      console.log(`Entered ${trade.symbol} at ${ltp} (${trade.side})`);
    } else {
      console.log(`⏩ Skipped ${trade.symbol}: LTP ${ltp} did not meet entry`);
    }
  }
};
// processPendingEntries();
module.exports = pendingEntries;
