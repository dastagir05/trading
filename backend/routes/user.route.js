const express = require("express");
const { loginUser } = require("../controllers/user.controller");

const router = express.Router();

router.post("/login", loginUser);

module.exports = router;
