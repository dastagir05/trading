const { Schema, model } = mongoose;

const logSchema = new Schema({
  level: { type: String, required: true },
  message: { type: String, required: true },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now, index: true, expires: "30d" }, // auto-delete after 30 days
});

// Static method: allows you to call Log.add(...) directly
logSchema.statics.add = async function (level, message, meta = {}) {
  try {
    const log = await this.create({ level, message, meta });
    return log;
  } catch (err) {
    console.error("Failed to save log to DB", err);
    return null;
  }
};

export const Log = model("Log", logSchema);

// import { Log } from "./models/Log.js";
// import logger from "./logger.js";

// // Log in console + save to DB
// async function logError(message, meta = {}) {
//   logger.error(message, meta);     // console/log file
//   await Log.add("error", message, meta); // save to DB
// }

// // Example usage
// await logError("Upstox token fetch failed", { adminEmail: admin.email });
