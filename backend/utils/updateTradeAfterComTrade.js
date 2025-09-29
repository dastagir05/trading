const { getLTP } = require("../services/getLtp");

async function updateTradeAfterTrade({ trade, status, exitPrice }) {
  const now = new Date();
  // const last_price = await getLTP(trade.instrumentKey);

  const last_price = exitPrice ? exitPrice : await getLTP(trade.instrumentKey);
  if (!last_price) throw new Error("LTP fetch failed");
  const brokerage = 40;
  const stt = last_price * trade.quantity * 0.001;
  const sebi = trade.entryPrice * last_price * trade.quantity * 0.000001;
  const gst = brokerage * 0.18;
  const totalCharges = parseFloat((brokerage + stt + sebi + gst).toFixed(2));

  const grossPnl =
    trade.side === "buy"
      ? (last_price - trade.entryPrice) * trade.quantity
      : (trade.entryPrice - last_price) * trade.quantity;

  const netPnl = grossPnl - totalCharges;
  const percentPnL = parseFloat(
    ((grossPnl / (trade.entryPrice * trade.quantity)) * 100).toFixed(2)
  );
  console.log("my exit", grossPnl, netPnl, trade.entryPrice);
  trade.status = status;
  trade.exitTime = now;
  trade.exitPrice = last_price;
  trade.charges = {
    brokerage: +brokerage.toFixed(2),
    stt: +stt.toFixed(2),
    sebi: +sebi.toFixed(2),
    gst: +gst.toFixed(2),
    total: totalCharges,
  };
  trade.pnl = parseFloat(grossPnl.toFixed(2));
  trade.netpnl = parseFloat(netPnl.toFixed(2));
  trade.percentPnL = percentPnL;
  const timestampIST = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
  trade.notes.push({
    timestamp: now.getTime(),
    message: `Trade completed - Exit at ₹${last_price}, PnL: ₹${netPnl} (${percentPnL}% on ${timestampIST})`,
    type: netPnl >= 0 ? "success" : "error",
  });
}
module.exports = updateTradeAfterTrade;
