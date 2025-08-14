const express = require("express");
const router = express.Router();
const {
  createWatchlist,
  deleteWatchlist,
  addInstrument,
  removeInstrument,
  getUserWatchlists,
} = require("../controllers/watchlist.controller");

router.get("/getWatchlists", getUserWatchlists);
router.post("/create", createWatchlist);
router.delete("/delete", deleteWatchlist);
router.patch("/addInstrument", addInstrument);
router.patch("/delInstrument", removeInstrument);

module.exports = router;
