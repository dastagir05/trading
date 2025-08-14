const Watchlist = require("../models/watchlist.model");
const {
  defaultWatchlistInstrumentKeys,
} = require("../constant/defaultWatchlist");

// Fetch all watchlists for a user
exports.getUserWatchlists = async (req, res) => {
  try {
    const userId = req.query.userId;
    console.log("userID in watch", userId);
    const watchlists = await Watchlist.find({ userId });
    res.status(200).json(watchlists);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch watchlists." });
  }
};

exports.createWatchlist = async (req, res) => {
  const { userId, watchlistName } = req.body;
  console.log("user id in create watchlist", req.user._id);
  try {
    const newWatchlist = await Watchlist.create({
      userId,
      watchlistName,
    });
    res.status(201).json(newWatchlist);
  } catch (error) {
    console.log("Err in creation Watchlist", error);
    res.status(500).json({ error: "Error while creating watchlist" });
  }
};

exports.deleteWatchlist = async (req, res) => {
  const { userId, watchlistName } = req.query;
  try {
    const watchlist = await Watchlist.findOne({ userId, watchlistName });

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found." });
    }

    await Watchlist.deleteOne({ _id: watchlist._id });

    res.status(200).json({ message: "Watchlist deleted successfully." });
  } catch (error) {
    console.log("Err in deletion Watchlist", error);
    res.status(500).json({ error: "Error while deletion watchlist" });
  }
};

exports.addInstrument = async (req, res) => {
  const { userId, watchlistName, instrumentKeys = [] } = req.body;
  // console.log("uss", req.user._id);
  console.log("addd nstru", userId, watchlistName, instrumentKeys);
  if (!Array.isArray(instrumentKeys) || instrumentKeys.length === 0) {
    return res.status(400).json({ error: "No instruments provided." });
  }

  try {
    if (watchlistName === "defaultWatchlist") {
      const existing = await Watchlist.findOne({
        userId,
        watchlistName: "defaultWatchlist",
      });

      if (!existing) {
        await Watchlist.create({
          userId,
          watchlistName: "defaultWatchlist",
          instrumentKeys: defaultWatchlistInstrumentKeys,
        });
      }
    }
    const watchlist = await Watchlist.findOne({ userId, watchlistName });

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found." });
    }

    // Remove duplicates from incoming keys
    const uniqueIncomingKeys = [...new Set(instrumentKeys)];

    // Filter out existing keys
    const newKeys = uniqueIncomingKeys.filter(
      (key) => !watchlist.instrumentKeys.includes(key)
    );

    // Check if adding these exceeds 20
    if (watchlist.instrumentKeys.length + newKeys.length > 20) {
      return res
        .status(400)
        .json({ error: "Cannot exceed 20 instruments in a watchlist." });
    }

    // Add new keys
    watchlist.instrumentKeys.push(...newKeys);
    await watchlist.save();

    res.status(200).json(watchlist);
  } catch (error) {
    console.log("err in add instu");
    res.status(500).json({ error: "Error in adding Instrument" });
  }
};

exports.removeInstrument = async (req, res) => {
  try {
    const { userId, watchlistName, instrumentKey } = req.body;
    if (watchlistName === "defaultWatchlist") {
      const existing = await Watchlist.findOne({
        userId,
        watchlistName: "defaultWatchlist",
      });

      if (!existing) {
        await Watchlist.create({
          userId,
          watchlistName: "defaultWatchlist",
          instrumentKeys: defaultWatchlistInstrumentKeys,
        });
      }
    }

    const watchlist = await Watchlist.findOne({ userId, watchlistName });
    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found." });
    }

    watchlist.instrumentKeys = watchlist.instrumentKeys.filter(
      (key) => key !== instrumentKey
    );

    await watchlist.save();
    res.status(200).json({ message: "Instrument removed.", watchlist });
  } catch (error) {
    console.log("err in remove Instu");
    res.status(500).json({ error: err.message });
  }
};
