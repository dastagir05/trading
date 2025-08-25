const express = require("express");
const {
  createTrade,
  closeTradeManual,
  getTrades,
  modifyTargetStoploss,
  executeAiTrade,
  getUserAiTradePerformance,
  getPersonalizedAiTradeSuggestions,
} = require("../controllers/trade.controller");

const router = express.Router();

router.post("/createTrade", createTrade);
router.get("/gettrades", getTrades);
router.post("/closeTrade", closeTradeManual);
router.post("/modifyTargetStoploss", modifyTargetStoploss);

// AI Trade Integration Routes
router.post("/execute-ai-trade", executeAiTrade);
router.get("/ai-performance/:userId", getUserAiTradePerformance);
router.get("/ai-suggestions/:userId", getPersonalizedAiTradeSuggestions);

module.exports = router;
