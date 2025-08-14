const User = require("../models/user.model");

exports.loginUser = async (req, res) => {
  const { name, email, image, provider, providerId } = req.body;

  // if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await User.findOneAndUpdate(
      { providerId },
      { name, image, provider, email },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log("User logged in:", user);

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


exports.getProfileDetail = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }
  const profileDetail = await User.findById(userId);
  res.status(200).json(profileDetail);
};
