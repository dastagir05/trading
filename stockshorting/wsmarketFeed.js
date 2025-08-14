const WebSocket = require("ws").WebSocket;
const protobuf = require("protobufjs");
const axios = require("axios");
const path = require("path");

let protobufRoot = null;
const RETRY_DELAY = 5000;
const API_VERSION = "2.0"; // Critical - was missing in your implementation
const accessToken = process.env.ACCESS_TOKEN;

const initProtobuf = async () => {
  protobufRoot = await protobuf.load(path.join(__dirname, "upstox.proto"));
  console.log("Protobuf initialization complete");
};

const decodeMessage = (buffer) => {
  if (!protobufRoot) {
    console.warn("Protobuf not initialized!");
    return null;
  }
  const FeedResponse = protobufRoot.lookupType(
    "com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse"
  );
  return FeedResponse.decode(buffer);
};

const getMarketFeedUrl = async () => {
  const url = "https://api.upstox.com/v3/feed/market-data-feed/authorize";
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "Api-Version": API_VERSION, // This header is crucial
  };

  const response = await axios.get(url, { headers });
  if (!response.data.data?.authorizedRedirectUri) {
    throw new Error("Invalid response from authorization endpoint");
  }
  return response.data.data.authorizedRedirectUri;
};

module.exports = async function marketFeed(instrumentKey, dataHandler) {
  await initProtobuf();

  let ws;
  let retryCount = 0;
  const maxRetries = 3;

  async function connect() {
    try {
      const wsUrl = await getMarketFeedUrl();

      // Critical changes here:
      ws = new WebSocket(wsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Api-Version": API_VERSION, // Must match version in auth request
          Accept: "application/json",
        },
        followRedirects: true,
      });

      ws.on("open", () => {
        console.log(`Connected to market feed for ${instrumentKey}`);
        retryCount = 0;

        const subscription = {
          guid: `sub-${Date.now()}`,
          method: "sub",
          data: {
            mode: "full",
            instrumentKeys: [instrumentKey], // Single instrument subscription
          },
        };
        ws.send(JSON.stringify(subscription));
      });

      ws.on("message", (data) => {
        try {
          const decoded = decodeMessage(data);

          const status = decoded?.marketInfo?.segmentStatus?.NSE_EQ;

          if (status === 5) {
            console.log("Market is closed. Skipping reconnect.");
            ws.close(); // Close current attempt
            return;
          }

          const marketData = processMarketData(decoded);
          if (marketData) dataHandler(marketData);
        } catch (error) {
          console.error("Message processing error:", error);
        }
      });

      ws.on("close", () => {
        console.log(`Disconnected from market feed for ${instrumentKey}`);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(connect, RETRY_DELAY * retryCount);
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", {
          message: error.message,
          code: error.code,
        });
        ws.close();
      });
    } catch (error) {
      console.error("Connection error:", error);
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(connect, RETRY_DELAY * retryCount);
      }
    }
  }

  function processMarketData(decoded) {
    const key = Object.keys(decoded.feeds)[0];
    const feed = decoded.feeds[key]?.fullFeed?.marketFF?.marketLevel;

    if (feed?.bidAskQuote?.length > 0) {
      const quote = feed.bidAskQuote[0];
      return {
        instrumentKey,
        timestamp: new Date().toISOString(),
        bid: quote.bidP || 0,
        ask: quote.askP || 0,
        bidQty: quote.bidQ || 0,
        askQty: quote.askQ || 0,
      };
    }
    return null;
  }

  await connect();
  return ws;
};
