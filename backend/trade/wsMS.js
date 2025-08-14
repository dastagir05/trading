const dotenv = require("dotenv");
dotenv.config();
const WebSocket = require("ws").WebSocket;
const protobuf = require("protobufjs");
const axios = require("axios");

let protobufRoot = null;
const accessToken = process.env.ACCESS_TOKEN;

const subscriptions = new Map();

const initProtobuf = async () => {
  if (!protobufRoot) {
    protobufRoot = await protobuf.load(__dirname + "/upstox.proto");
    console.log("✅ Protobuf initialized");
  }
};

const decodeProtobuf = (buffer) => {
  if (!protobufRoot) return null;

  const FeedResponse = protobufRoot.lookupType(
    "com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse"
  );
  return FeedResponse.decode(buffer);
};

const getMarketFeedUrl = async () => {
  try {
    const url = "https://api.upstox.com/v3/feed/market-data-feed/authorize";
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
    const response = await axios.get(url, { headers });
    return response.data.data.authorizedRedirectUri;
  } catch (error) {
    console.error("❌ Failed to get MarketFeedUrl", error);
  }
};

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

    // for (const s of sockets) {
    //   s.emit("marketStatus", {
    //     isOpen,
    //     statusCode: isOpen,
    //   });
    //   console.log("mk", isOpen);
    // }
    if (status === 5) {
      console.log("Market closed — disconnecting");
      socket.emit("marketStatus", true);
      // socket.emit("markStatus", true);
      ws.close();
      return;
    }

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
