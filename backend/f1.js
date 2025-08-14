
const axios = require('axios');
require("dotenv").config();

const accessToken = process.env.ACCESS_TOKEN;

const getOptContract = async (instrumentKey) => {
    console.log(accessToken)
    try {
      const res = await axios.get("https://api.upstox.com/v2/option/contract", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        params: { instrument_key: instrumentKey         },
      });
  
      const data = res.data;
      const expiries = [...new Set(res.data.data.map(c => c.expiry))]
    .sort((a, b) => new Date(a) - new Date(b))
    .slice(0, 7); // Only nearest `limit` expiries
    console.log(expiries)
    } catch (err) {
      console.error("LTP fallback error:", err.message);
      return null;
    }
  };


// getOptContract("NSE_INDEX|Nifty Bank")
const getOpt = async (instrumentKey) => {
    console.log(accessToken)
    try {
      const res = await axios.get("https://api.upstox.com/v2/option/chain", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        params: { instrument_key: instrumentKey,
          expiry_date:"2025-10-28",
         },
      });
  
      const data = res.data;
      console.log(data)
    } catch (err) {
      console.error("LTP fallback error:", err.message);
      return null;
    }
  };


getOptContract("NSE_INDEX|Nifty Bank")
//   getLTP()