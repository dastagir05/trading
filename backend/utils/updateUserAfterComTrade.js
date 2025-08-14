function updateUserAfterTrade({ user, trade }) {
  const netPnl = trade.netpnl;
  const grossPnl = trade.pnl;
  const totalCharges = trade.charges?.total || 0;
  const percentPnL = trade.percentPnL;
  const totalCompleted = user.totalCompletedTrades;

  user.totalMoney += trade.marginUsed + netPnl;
  user.realisedPL += netPnl;
  user.totalEstCharge += totalCharges;
  user.openPositions = Math.max(0, user.openPositions - 1); // safe fallback
  user.totalCompletedTrades += 1;

  user.avgPnL = parseFloat((user.realisedPL / user.totalCompletedTrades).toFixed(2));
  user.pnl = user.realisedPL + user.unrealisedPL;

  // Track best/worst trade
  if (!user.bestTrade || trade.percentPnL > trade.bestTrade?.percentPnL) {
    user.bestTrade = trade._id;
  }

  if (!user.worstTrade || trade.percentPnL < trade.worstTrade?.percentPnL) {
    user.worstTrade = trade._id;
  }

  if (netPnl > 0) {
    user.totalProfit += parseFloat(netPnl.toFixed(2));
  } else {
    user.totalLoss += parseFloat((-netPnl).toFixed(2)); // store as positive number
  }

  const isWin = grossPnl > 0 ? 1 : 0;
  const updatedWinRate = ((user.winRate * totalCompleted) + isWin) / (totalCompleted + 1);
  user.winRate = parseFloat((updatedWinRate * 100).toFixed(2)); // stored as percentage
}

module.exports = updateUserAfterTrade;
