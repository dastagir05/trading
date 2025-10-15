const axios = require("axios");
const { getUpstoxToken } = require("../utils/getToken");

// ===== REQUEST QUEUE & RATE LIMITER =====
class RequestQueue {
  constructor(maxPerSecond = 2, cacheTimeMs = 2000) {
    this.queue = [];
    this.processing = false;
    this.maxPerSecond = maxPerSecond;
    this.requestTimestamps = [];
    this.cache = new Map(); // instrument_key → { price, timestamp }
    this.cacheTimeMs = cacheTimeMs;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      // Clean old timestamps
      const now = Date.now();
      this.requestTimestamps = this.requestTimestamps.filter(
        (time) => now - time < 1000
      );

      // Wait if rate limit reached
      if (this.requestTimestamps.length >= this.maxPerSecond) {
        const oldestRequest = this.requestTimestamps[0];
        const waitTime = 1000 - (now - oldestRequest);
        if (waitTime > 0) {
          await this.sleep(waitTime);
          continue;
        }
      }

      // Process next request
      const { fn, resolve, reject } = this.queue.shift();
      this.requestTimestamps.push(Date.now());

      try {
        const result = await fn();
        resolve(result);
      } catch (err) {
        reject(err);
      }

      // Small delay between requests
      await this.sleep(100);
    }

    this.processing = false;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get cached price if fresh enough
  getCached(keys) {
    const now = Date.now();
    const keyArray = Array.isArray(keys) ? keys : [keys];

    // Check if ALL keys have fresh cache
    const cached = {};
    for (const key of keyArray) {
      const entry = this.cache.get(key);
      if (!entry || now - entry.timestamp > this.cacheTimeMs) {
        return null; // Cache miss or stale
      }
      cached[key] = entry;
    }

    return cached;
  }

  // Store in cache
  setCache(key, price) {
    this.cache.set(key, {
      price,
      timestamp: Date.now(),
    });
  }

  // Clear old cache entries (run periodically)
  cleanCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheTimeMs * 2) {
        this.cache.delete(key);
      }
    }
  }
}

// Global queue instance
const requestQueue = new RequestQueue(2, 2000); // 2 req/sec, 2s cache

// Clean cache every 10 seconds
setInterval(() => requestQueue.cleanCache(), 1000);

// ===== BATCH LTP FETCHER WITH CACHING =====
const getArrayLTP = async (instrumentKey) => {
  try {
    // Normalize input
    let keys = Array.isArray(instrumentKey)
      ? instrumentKey
      : typeof instrumentKey === "string"
      ? instrumentKey.includes(",")
        ? instrumentKey.split(",").map((k) => k.trim())
        : [instrumentKey]
      : [];

    if (keys.length === 0) {
      console.warn("⚠️ No instrument keys provided");
      return null;
    }

    // Check cache first
    const cached = requestQueue.getCached(keys);
    if (cached) {
      console.log(`📦 Using cached LTP for ${keys.length} instruments`);

      if (keys.length === 1) {
        const key = keys[0];
        return {
          instrument_key: key,
          last_price: cached[key].price,
          cp: 0,
        };
      }

      return keys.map((key) => ({
        instrument_key: key,
        last_price: cached[key].price,
        cp: 0,
      }));
    }

    // Add to queue
    const result = await requestQueue.add(async () => {
      const accessToken = await getUpstoxToken();
      if (!accessToken) {
        throw new Error("No access token available");
      }

      console.log(
        `🔍 Fetching LTP for ${keys.length} instruments:`,
        keys.slice(0, 2)
      );

      const res = await axios.get(
        "https://api.upstox.com/v3/market-quote/ltp",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          params: {
            instrument_key: keys.join(","),
          },
          timeout: 5000, // 5s timeout
        }
      );

      const quoteMap = res.data.data;

      // Cache all results
      for (const [_, quote] of Object.entries(quoteMap)) {
        requestQueue.setCache(quote.instrument_token, quote.last_price ?? 0);
      }

      // Return formatted data
      if (keys.length === 1) {
        const first = Object.values(quoteMap)[0];
        return {
          instrument_key: first.instrument_token,
          last_price: first.last_price ?? 0,
          cp: first.cp ?? 0,
        };
      }

      return Object.values(quoteMap).map((q) => ({
        instrument_key: q.instrument_token,
        last_price: q.last_price ?? 0,
        cp: q.cp ?? 0,
      }));
    });

    return result;
  } catch (err) {
    if (err.response?.status === 429) {
      console.error("⚠️ Rate limited (429) - waiting 5s before retry...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Try cached data as fallback
      const cached = requestQueue.getCached(
        Array.isArray(instrumentKey) ? instrumentKey : [instrumentKey]
      );
      if (cached) {
        console.log("📦 Using stale cache due to rate limit");
        const keys = Array.isArray(instrumentKey)
          ? instrumentKey
          : [instrumentKey];
        return keys.length === 1
          ? {
              instrument_key: keys[0],
              last_price: cached[keys[0]].price,
              cp: 0,
            }
          : keys.map((k) => ({
              instrument_key: k,
              last_price: cached[k].price,
              cp: 0,
            }));
      }
    }

    console.error("❌ LTP fetch error:", err.message);
    return null;
  }
};

// Legacy single instrument function
const getLTP = async (instrumentKey) => {
  const result = await getArrayLTP(instrumentKey);
  return result?.last_price ?? null;
};

module.exports = { getLTP, getArrayLTP };
