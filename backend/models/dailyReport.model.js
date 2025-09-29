import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now }, // When report was generated
  totalSuggestions: { type: Number, required: true },
  stats: [
    {
      status: String,
      count: Number,
      avgConfidence: Number,
      totalPnL: Number,
    },
  ],
  rawText: String, // optional: keep the formatted text too
});

const Report = mongoose.model("Report", reportSchema);

export default Report;
