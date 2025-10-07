const cron = require("node-cron");
const axios = require("axios");
const { getUpstoxToken } = require("../utils/getToken");

let isHoliday = null;
let holidayCheckedForDate = null;

const checkHoliday = async () => {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  }); // YYYY-MM-DD

  // Avoid re-checking for the same date
  if (holidayCheckedForDate === today) return isHoliday;

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

    return isHoliday;
  } catch (err) {
    console.error("Holiday check error:", err.message);
    return null;
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
