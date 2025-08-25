const express = require("express");
const {
  getAdminStats,
  getUsers,
  getSystemMetrics,
  getSystemLogs,
  getAnalyticsData,
  getSystemSettings,
  updateSystemSettings
} = require("../controllers/admin.controller");

const router = express.Router();

// Admin Dashboard Stats
router.get("/stats", getAdminStats);

// User Management
router.get("/users", getUsers);

// System Monitoring
router.get("/system/metrics", getSystemMetrics);
router.get("/system/logs", getSystemLogs);

// Analytics
router.get("/analytics", getAnalyticsData);

// System Settings
router.get("/settings", getSystemSettings);
router.put("/settings", updateSystemSettings);

module.exports = router;
