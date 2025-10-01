const Admin = require("../models/admin.model");

let cachedToken = null;
let cachedExpiry = null;
let refreshPromise = null;

function setCachedToken(token, expiry) {
  cachedToken = token;
  cachedExpiry = expiry;
}

async function refreshTokenFromDB() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
      if (!admin) throw new Error("Admin not found in DB");
      if (!admin.upstoxToken) throw new Error("Token missing in DB");

      cachedToken = admin.upstoxToken;
      cachedExpiry = admin.tokenExpiry;

      let now = new Date();
      console.log(
        "Token refreshed from DB:",
        cachedToken.substring(0, 6) + "...",
        cachedExpiry,
        now
      );

      refreshPromise = null; // reset after completion
      return cachedToken;
    })();
  }
  return refreshPromise;
}

let i = 1;
async function getUpstoxToken() {
  const now = new Date();

  if (!cachedToken || cachedExpiry <= now) {
    console.log("Token is or not found in cached, refreshing from DB...", i++);
    return await refreshTokenFromDB(); // ✅ always resolves to valid token
  }

  return cachedToken;
}

module.exports = { getUpstoxToken, setCachedToken };
