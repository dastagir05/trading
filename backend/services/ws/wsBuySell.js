const WebSocket = require("ws").WebSocket;
const {
  initProtobuf,
  decodeProtobuf,
  getMarketFeedUrl,
} = require("../marketFeedUrl");
const { setMarketStatus } = require("./marketStatus");
const subscriptions = new Map();

const subscribe = async (instrumentKey, socket) => {
  await initProtobuf();

  // If this instrument is already subscribed
  if (subscriptions.has(instrumentKey)) {
    const entry = subscriptions.get(instrumentKey);
    entry.sockets.add(socket);
    return;
  }

  const wsUrl = await getMarketFeedUrl();
  const ws = new WebSocket(wsUrl);

  const sockets = new Set();
  sockets.add(socket);

  ws.on("open", () => {
    const data = {
      guid: "someguid",
      method: "sub",
      data: {
        mode: "full",
        instrumentKeys: [instrumentKey],
      },
    };
    ws.send(Buffer.from(JSON.stringify(data)));
  });

  ws.on("message", (data) => {
    const decodedMessage = decodeProtobuf(data);
    const status = decodedMessage?.marketInfo?.segmentStatus?.NSE_EQ;
    const key = Object.keys(decodedMessage.feeds || {})[0];
    const isOpen = status === 5;
    const bidAsk =
      decodedMessage.feeds?.[key]?.fullFeed?.marketFF?.marketLevel?.bidAskQuote;
    //check that without full obj option greeks can give firstDepth that bigP and askQ

    // if (status === 5) {
    //   console.log("Market closed — disconnecting");
    //   setMarketStatus(false);
    //   socket.emit("marketStatus", true);
    //   // socket.emit("markStatus", true);
    //   ws.close();
    //   return;
    // }

    if (bidAsk && bidAsk.length > 0) {
      const level = bidAsk[0];
      const bestBid = level?.bidP || 0;
      const bestAsk = level?.askP || 0;

      // Broadcast to all sockets subscribed to this instrument
      for (const s of sockets) {
        s.emit("getBuySellValue", {
          buyPrice: bestBid,
          sellPrice: bestAsk,
        });
      }
    }
  });

  ws.on("close", () => {
    subscriptions.delete(instrumentKey);
    console.log(`🧹 Feed closed for ${instrumentKey}`);
  });

  ws.on("error", (err) => {
    console.error(`WebSocket error for ${instrumentKey}:`, err.message);
  });

  subscriptions.set(instrumentKey, { ws, sockets });
};

const unsubscribe = (instrumentKey, socket) => {
  if (!subscriptions.has(instrumentKey)) return;

  const entry = subscriptions.get(instrumentKey);
  entry.sockets.delete(socket);

  // If no more sockets listening for this instrument, close the WebSocket
  if (entry.sockets.size === 0) {
    entry.ws.close();
    subscriptions.delete(instrumentKey);
    console.log(`❌ Unsubscribed from ${instrumentKey}`);
  }
};

module.exports = {
  subscribe,
  unsubscribe,
};
