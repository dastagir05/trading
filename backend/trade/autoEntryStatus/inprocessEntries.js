const Trades = require("../../models/trade.model");
const User = require("../../models/user.model");
const { getLTP } = require("../../services/getLtp");
const updateTradeAfterTrade = require("../../utils/updateTradeAfterComTrade");
const updateUserAfterTrade = require("../../utils/updateUserAfterComTrade");
const inprocessEntries = async () => {
  const trades = await Trades.find({ status: "inprocess" });
  console.log("👀 inprocess trade start");
  for (const trade of trades) {
    const ltp = await getLTP(trade.instrumentKey);
    console.log("ltp inc", ltp);

    if (!ltp) continue;

    let shouldExit = false;
    let exitReason = "";

    if (
      trade.target &&
      ((trade.side === "buy" && ltp >= trade.target) ||
        (trade.side === "sell" && ltp <= trade.target))
    ) {
      shouldExit = true;
      exitReason = "target achieve";
    }

    if (
      !shouldExit &&
      trade.stoploss &&
      ((trade.side === "buy" && ltp <= trade.stoploss) ||
        (trade.side === "sell" && ltp >= trade.stoploss))
    ) {
      shouldExit = true;
      exitReason = "stoploss hit";
    }

    if (!shouldExit) continue;

    const user = await User.findById(trade.userId);
    if (!user) {
      console.log("No user found for trade", trade._id);
      continue;
    }

    await updateTradeAfterTrade({ trade, status: exitReason, exitPrice: ltp });
    updateUserAfterTrade({ user, trade });

    if (!user.frequencySymbols) {
      user.frequencySymbols = {};
    }
    user.frequencySymbols[trade.symbol] =
      (user.frequencySymbols[trade.symbol] || 0) + trade.quantity;

    // ✅ Update favouriteSymbols based on top 5 traded symbols
    const sortedFreqSymbols = Object.entries(user.frequencySymbols)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symbol]) => symbol);

    user.favouriteSymbols = sortedFreqSymbols;

    await trade.save();
    await user.save();

    console.log(`⚠️ ${trade.symbol} ${exitReason} at ${ltp}`);
  }
};

module.exports = inprocessEntries;
