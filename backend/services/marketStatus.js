const cron = require("node-cron");
const axios = require("axios");
const { getUpstoxToken } = require("../utils/getToken");

let isHoliday = null;
let holidayCheckedForDate = null;
let lastCheckTimestamp = null;
let retryCount = 0;

// ✅ Exponential backoff delays
const RETRY_DELAYS = [1000, 5000, 15000, 60000]; // 1s, 5s, 15s, 1min

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkHoliday = async () => {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  }); // YYYY-MM-DD

  // Avoid re-checking for the same date
  const now = Date.now();
  if (
    holidayCheckedForDate === today &&
    lastCheckTimestamp &&
    now - lastCheckTimestamp < 5 * 60 * 1000
  ) {
    console.log("⏭️ Skipping holiday check (cached)");
    return isHoliday;
  }

  try {
    const accessToken = await getUpstoxToken();
    if (!accessToken) return null;

    const url = `https://api.upstox.com/v2/market/timings/${today}`;
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.get(url, { headers });
    if (response.data.status !== "success") return null;

    const nseMarket = response.data.data.find(
      (item) => item.exchange === "NSE"
    );

    // NSE not available → market holiday
    isHoliday = !nseMarket;
    holidayCheckedForDate = today;
    lastCheckTimestamp = Date.now();
    retryCount = 0; // Reset on success

    return isHoliday;
  } catch (err) {
    if (err.response?.status === 429) {
      const delay = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)];
      retryCount++;

      console.warn(
        `⚠️ Rate limited (429). Retrying in ${
          delay / 1000
        }s... (Attempt ${retryCount})`
      );

      await sleep(delay);

      // Retry once after backoff
      if (retryCount <= 3) {
        return checkHoliday();
      }
    }
  }
};

const getMarketStatus = async () => {
  const ist = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const day = ist.getDay(); // 0 = Sun, 6 = Sat
  const mins = ist.getHours() * 60 + ist.getMinutes();

  // Basic NSE timings: Mon–Fri, 9:15 to 15:30
  if (day === 0 || day === 6 || mins < 555 || mins > 930) {
    return false;
  }

  // Only check holiday once per day
  if (
    isHoliday === null ||
    holidayCheckedForDate !==
      ist.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
  ) {
    await checkHoliday();
  }

  return !isHoliday;
};

// 🔹 Pre-check at 9:00 AM (IST) every Mon–Fri
cron.schedule("0 9 * * 1-5", async () => {
  console.log("Checking holiday status at 9:00 AM...");
  await checkHoliday();
});

module.exports = getMarketStatus;
