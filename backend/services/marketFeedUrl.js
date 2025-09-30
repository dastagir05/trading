// const dotenv = require("dotenv");
// dotenv.config();
const protobuf = require("protobufjs");
const axios = require("axios");
const { getUpstoxToken } = require("../utils/getToken");

let protobufRoot = null;

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
  const accessToken = await getUpstoxToken();
  if (!accessToken) {
    console.error("No access token available for MarketFeedUrl fetch");
    return null;
  }
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

module.exports = {
  initProtobuf,
  decodeProtobuf,
  getMarketFeedUrl,
};
