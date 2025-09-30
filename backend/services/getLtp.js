const axios = require("axios");
const { getUpstoxToken } = require("../utils/getToken");

//test when market open
const getLTP = async (instrumentKey) => {
  const accessToken = await getUpstoxToken();
  if (!accessToken) {
    console.error("No access token available for LTP fetch");
    return null;
  }
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

const getArrayLTP = async (instrumentKey) => {
  const accessToken = await getUpstoxToken();
  if (!accessToken) {
    console.error("No access token available for arrLTP fetch");
    return null;
  }
  try {
    // Normalize: always make it an array
    let keys = instrumentKey;

    if (Array.isArray(instrumentKey)) {
      keys = instrumentKey;
    } else if (typeof instrumentKey === "string") {
      keys = instrumentKey.includes(",")
        ? instrumentKey.split(",")
        : [instrumentKey]; // single key case
    } else {
      throw new Error("Invalid instrumentKey type");
    }

    // console.log("Normalized keys:", keys);
    console.log("access Token in getLTP", accessToken.substring(0, 5), keys);

    const res = await axios.get("https://api.upstox.com/v3/market-quote/ltp", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      params: {
        instrument_key: keys.join(","), // API expects comma-separated string
      },
    });

    const quoteMap = res.data.data;

    // If only one key → return just one object
    if (keys.length === 1) {
      const first = Object.values(quoteMap)[0];
      return {
        instrument_key: first.instrument_token,
        last_price: first.last_price ?? 0,
        cp: first.cp ?? 0,
      };
    }

    // Otherwise → return array of results
    return Object.values(quoteMap).map((q) => ({
      instrument_key: q.instrument_token,
      last_price: q.last_price ?? 0,
      cp: q.cp ?? 0,
    }));
  } catch (err) {
    console.error("LTP fallback error:", err.message);
    return null;
  }
};

module.exports = { getLTP, getArrayLTP };
