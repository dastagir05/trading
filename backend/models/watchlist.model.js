const { Schema, model } = require("mongoose");

const watchlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    watchlistName: {
      type: String,
      required: true,
      trim: true,
    },
    instrumentKeys: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 20;
        },
        message: "A watchlist can contain a maximum of 20 instruments.",
      },
      default: [],
    },
  },
  { timestamps: true }
);

// Prevent duplicate watchlist names per user
watchlistSchema.index({ userId: 1, watchlistName: 1 }, { unique: true });

//prevent duplicate instrument in single doc
watchlistSchema.pre("save", function (next) {
  this.instrumentKeys = [...new Set(this.instrumentKeys)];
  next();
});

module.exports = model("Watchlist", watchlistSchema);
