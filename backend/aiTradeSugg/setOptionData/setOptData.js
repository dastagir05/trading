const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Load environment variables from the parent directory (backend/)
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });

const UPSTOX_API_URL = "https://api.upstox.com/v2/option";
const ACCESS_TOKEN =
  process.env.ACCESS_TOKEN ||
  "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiIzWkNYUkciLCJqdGkiOiI2ODljNjM0ZDE2NjVkZTJhNmQ4MGIzNTYiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc1NTA3OTUwMSwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzU1MTIyNDAwfQ.tnmGMM0wfgPMnX5YM0sLTU_d7_BrsDBuJKcX3yQ_7e4";

const getNearestExpiryDate = async (instrumentKey) => {
  const res = await axios.get(`${UPSTOX_API_URL}/contract`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      Accept: "application/json",
    },
    params: { instrument_key: instrumentKey },
  });

  const expirations = [...new Set(res.data.data.map((c) => c.expiry))];
  expirations.sort((a, b) => new Date(a) - new Date(b));
  return expirations[0];
};

const getIndexPrice = async (instrumentKey) => {
  const res = await axios.get(`https://api.upstox.com/v3/market-quote/ltp`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
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
};

const fetchOptionChain = async (instrumentKey, expiryDate) => {
  const res = await axios.get(`${UPSTOX_API_URL}/chain`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      Accept: "application/json",
    },
    params: { instrument_key: instrumentKey, expiry_date: expiryDate },
  });

  let data = res.data.data.map((item) => ({
    strike_price: item.strike_price,
    call: item.call_options?.market_data?.ltp
      ? {
          instrument_key: item.call_options.instrument_key,
          ltp: item.call_options.market_data.ltp,
          oi: item.call_options.market_data.oi,
          iv: item.call_options.option_greeks?.iv,
          delta: item.call_options.option_greeks?.delta,
          pop: item.call_options.option_greeks?.pop,
        }
      : null,
    put: item.put_options?.market_data?.ltp
      ? {
          instrument_key: item.put_options.instrument_key,
          ltp: item.put_options.market_data.ltp,
          oi: item.put_options.market_data.oi,
          iv: item.put_options.option_greeks?.iv,
          delta: item.put_options.option_greeks?.delta,
          pop: item.put_options.option_greeks?.pop,
        }
      : null,
  }));

  // Step 1: filter for ideal premium range ₹80–₹120
  // Step 1: Start with ₹30–₹120 (your preferred active range)
  let filtered = data
    .map((d) => ({
      strike_price: d.strike_price,
      call: d.call?.ltp >= 10 && d.call?.ltp <= 180 ? d.call : null,
      put: d.put?.ltp >= 10 && d.put?.ltp <= 180 ? d.put : null,
    }))
    .filter((d) => d.call || d.put);

  // Step 2: Expand to ₹30–₹200 only if no results
  if (filtered.length === 0) {
    filtered = data
      .map((d) => ({
        strike_price: d.strike_price,
      }))
      .filter((d) => d.call || d.put);
  }

  return filtered;
};

const fetchAndSaveOC = async () => {
  try {
    // Nifty
    const niftyIndexKey = "NSE_INDEX|Nifty 50";
    const niftyPrice = await getIndexPrice(niftyIndexKey);
    const niftyExpiry = await getNearestExpiryDate(niftyIndexKey);
    console.log("np,ne", niftyPrice, niftyExpiry);
    const niftyOC = await fetchOptionChain(niftyIndexKey, niftyExpiry);

    // Bank Nifty
    const bankNiftyIndexKey = "NSE_INDEX|Nifty Bank";
    const bankNiftyPrice = await getIndexPrice(bankNiftyIndexKey);
    const bankNiftyExpiry = await getNearestExpiryDate(bankNiftyIndexKey);
    const bankNiftyOC = await fetchOptionChain(
      bankNiftyIndexKey,
      bankNiftyExpiry
    );

    // Save to file - use absolute path relative to backend directory
    const filePath = path.join(__dirname, "marketData.json");
    fs.writeFileSync(
      filePath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          nifty: {
            currentPrice: niftyPrice,
            expiry: niftyExpiry,
            optionChain: niftyOC,
          },
          bankNifty: {
            currentPrice: bankNiftyPrice,
            expiry: bankNiftyExpiry,
            optionChain: bankNiftyOC,
          },
        },
        null,
        2
      )
    );

    console.log("✅ Saved market data to marketData.json");
  } catch (err) {
    console.error("❌ Error fetching data:", err.message);
  }
};

// Export the function for use in other modules
module.exports = { fetchAndSaveOC };

// Only run if called directly
if (require.main === module) {
  fetchAndSaveOC();
}

// const getLatestExpiryDate = async (instrumentKey) => {
//     try {
//         console.log(`Fetching all option contracts to find the latest expiry for ${instrumentKey}...`);

//         const allOptionContracts = await axios.get(`${UPSTOX_API_URL}/contract`, {
//             headers: {
//                 Authorization: `Bearer ${ACCESS_TOKEN}`,
//                 Accept: "application/json",
//             },
//             params: {
//                 instrument_key: instrumentKey,
//             },
//         });

//         const expirations = new Set();
//         if (allOptionContracts.data && allOptionContracts.data.data) {
//             allOptionContracts.data.data.forEach(contract => {
//                 expirations.add(contract.expiry);
//             });
//         }

//         const sortedExpiries = Array.from(expirations).sort();
//         const latestExpiry = sortedExpiries[sortedExpiries.length - 1];

//         if (!latestExpiry) {
//             throw new Error("Could not determine the latest expiry date.");
//         }

//         console.log(`Latest expiry date found: ${latestExpiry}`);
//         return latestExpiry;

//     } catch (err) {
//         console.error("Error fetching all option contracts:", err.message);
//         throw err;
//     }
// };

// const fetchAndSaveOptionChain = async (instrumentKey, filename) => {
//     if (!ACCESS_TOKEN) {
//         console.error("ACCESS_TOKEN is not set. Please set the environment variable.");
//         return;
//     }

//     try {
//         // Step 1: Get the latest expiry date dynamically.
//         const latestExpiryDate = await getLatestExpiryDate(instrumentKey);

//         // Step 2: Fetch the option chain using the latest expiry date.
//         console.log(`Fetching option chain for Bank Nifty with expiry date: ${latestExpiryDate}`);
//         const optChainResponse = await axios.get(`${UPSTOX_API_URL}/chain`, {
//             headers: {
//                 Authorization: `Bearer ${ACCESS_TOKEN}`,
//                 Accept: "application/json",
//             },
//             params: {
//                 instrument_key: instrumentKey,
//                 expiry_date: latestExpiryDate,
//             },
//         });

//         // Step 3: Save the data to a JSON file.
//         const fileName = filename;
//         const dataToSave = optChainResponse.data;
//         const jsonContent = JSON.stringify(dataToSave, null, 2);
//         fs.writeFileSync(fileName, jsonContent, 'utf8');

//         console.log(`Successfully saved option chain data to ${fileName}`);
//     } catch (err) {
//         console.error("Error fetching or saving data:", err.message);
//     }
// };

// Execute the main function.
