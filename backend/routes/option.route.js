const express = require("express")
const { getOpt, getExpiryDate } = require("../controllers/option.controller")

const router = express.Router()

router.get("/", getOpt);
router.get("/contract", getExpiryDate)

module.exports = router