const { Schema, model } = require("mongoose");

const reportSchema = new Schema({
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

const Report = model("Report", reportSchema);

// export default Report;
