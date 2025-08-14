const express = require("express");
const { loginUser,getProfileDetail } = require("../controllers/user.controller");

const router = express.Router();

router.post("/login", loginUser);
router.get("/getprofile", getProfileDetail);

module.exports = router;
