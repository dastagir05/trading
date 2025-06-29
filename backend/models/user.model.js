const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    image: {
      type: String,
    },
    id: {
      type: String,
      required: true,
      unique: true,
    },
    provider: {
      type: String, // e.g., "google", "github"
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = model("user", userSchema);

module.exports = User;
