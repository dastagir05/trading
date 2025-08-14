let isMarketOpen = null;
let lastUpdated = null;

const setMarketStatus = (status) => {
  isMarketOpen = status;
  lastUpdated = new Date();
};

const getMarketStatus = () => {
  // Fallback if no WebSocket update in last 1 minute
  const now = new Date();
  if (!lastUpdated || now - lastUpdated > 60000) {
    return isMarketOpenTimeFallback(); // use local time check
  }
  return isMarketOpen;
};

const isMarketOpenTimeFallback = () => {
  const now = new Date();
  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const day = ist.getDay();
  const hour = ist.getHours();
  const min = ist.getMinutes();
  const mins = hour * 60 + min;
  return !(day === 0 || day === 6) && mins >= 555 && mins <= 930;
};

module.exports = {
  setMarketStatus,
  getMarketStatus,
};
