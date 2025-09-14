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
const {
  adminLogin,
  adminLogout,
  getAdminProfile,
  getAdminLogs,
  getAdminActivitySummary
} = require('../controllers/adminAuth.controller');


const router = express.Router();

// Admin authentication routes
router.post('/login', adminLogin);
router.post('/logout', adminLogout);

// Admin profile and activity routes
router.get('/profile/:adminId', getAdminProfile);
router.get('/logs/:adminId', getAdminLogs);
router.get('/activity/:adminId', getAdminActivitySummary);

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
