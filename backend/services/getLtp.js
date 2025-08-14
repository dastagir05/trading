const axios = require("axios");
const { getMarketStatus } = require("./marketStatus");
const accessToken = process.env.ACCESS_TOKEN;

//test when market open
const getLTP = async (instrumentKey) => {
  // if (!getMarketStatus()) {
  //   console.log("Market closed — skip entry/exit job");
  //   return;
  // }
  try {
    const res = await axios.get("https://api.upstox.com/v3/market-quote/ltp", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      params: { instrument_key: instrumentKey },
    });

    const data = res.data.data;
    for (const [symbolKey, details] of Object.entries(data)) {
      if (details.instrument_token === instrumentKey) {
        return details.last_price;
      }
    }
    return null;
  } catch (err) {
    console.error("LTP fallback error:", err.message);
    return null;
  }
};

module.exports = getLTP;
