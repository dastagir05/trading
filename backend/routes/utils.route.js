const express = require("express");
const { getArrayLTP } = require("../services/getLtp");

const router = express.Router();

router.get("/getLtp/:instrumentKey", async (req, res) => {
  const { instrumentKey } = req.params;
  console.log("Received instrumentKey:", instrumentKey);

  if (!instrumentKey) {
    return res.status(400).json({ error: "instrumentKey is required" });
  }

  // Normalize keys into an array
  const keys = instrumentKey.includes(",")
    ? instrumentKey.split(",")
    : [instrumentKey];

  try {
    const ltp = await getArrayLTP(keys); // pass array
    res.json({ ltp });
  } catch (err) {
    console.error("Error fetching LTP:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
