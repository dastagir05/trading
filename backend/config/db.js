const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log("✅ Connected to MongoDB");
      })
      .catch((error) => {
        console.error("❌ Error connecting to MongoDB:", error);
      });

    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
