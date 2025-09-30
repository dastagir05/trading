const Admin = require("../models/admin.model");

let cachedToken = null;
let cachedExpiry = null;
let isRefreshing = false;

function setCachedToken(token, expiry) {
  cachedToken = token;
  cachedExpiry = expiry;
}
async function refreshTokenFromDB() {
  if (isRefreshing) return; // prevent multiple parallel refreshes
  isRefreshing = true;

  const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (!admin) throw new Error("Admin not found in DB");
  if (!admin.upstoxToken) throw new Error("Token missing in DB");

  cachedToken = admin.upstoxToken;
  cachedExpiry = admin.tokenExpiry;

  isRefreshing = false;
  let now = new Date();
  console.log(
    "Token refreshed from DB:",
    cachedToken.substring(0, 6) + "...",
    cachedExpiry,
    now
  );
  return cachedToken;
}
let i = 1;
function getUpstoxToken() {
  const now = new Date();
  if (!cachedToken || cachedExpiry <= now) {
    //   throw new Error("Token expired. Please fetch a new one.");
    // } else {
    console.log("Token is or not found in cached, refreshing from DB...", i++);
    refreshTokenFromDB().catch(console.error);
  }

  return cachedToken;
}
module.exports = { getUpstoxToken, setCachedToken };
