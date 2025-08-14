const dotenv = require("dotenv");
dotenv.config();
const protobuf = require("protobufjs");
const axios = require("axios");

let protobufRoot = null;
const accessToken = process.env.ACCESS_TOKEN;

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

module.exports = {
  initProtobuf,
  decodeProtobuf,
  getMarketFeedUrl,
};
