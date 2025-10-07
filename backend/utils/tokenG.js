// const dotenv = require("dotenv");
// dotenv.config();
const Admin = require("../models/admin.model");
const { setCachedToken } = require("./getToken");
exports.getCode = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    const upstoxAuthURL = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}`;
    res.redirect(upstoxAuthURL);
    return;
  }

  // if (!code) return res.status(400).send("Authorization code not found");

  const params = new URLSearchParams();
  console.log("Authorization Code:", code);
  params.append("code", code);
  params.append("client_id", process.env.CLIENT_ID);
  params.append("client_secret", process.env.CLIENT_SECRET);
  params.append("redirect_uri", process.env.REDIRECT_URI);
  params.append("grant_type", "authorization_code");

  try {
    const tokenRes = await fetch(
      "https://api.upstox.com/v2/login/authorization/token",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    const data = await tokenRes.json();
    // console.log("Access Token:", data.access_token, data);
    const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (!admin) {
      throw new Error("⚠️ Admin not found.");
    }
    if (!data.access_token) {
      throw new Error("⚠️ Access token not received.");
    }

    admin.upstoxToken = data.access_token;
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(3, 0, 0, 0); // set to start of next day
    admin.tokenExpiry = tomorrow;

    setCachedToken(data.access_token, tomorrow);
    await admin.save();
    console.log(
      "Token saved for admin:",
      admin.email,
      data.access_token.substring(0, 6) + "...",
      tomorrow
    );

    res.redirect(`${process.env.FRONTEND_URL}/mytrades`);
  } catch (err) {
    console.error("Token Fetch Error:", err);
    res.status(500).send("Failed to get token");
  }
};
