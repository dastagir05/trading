const User = require("../models/user.model");
const Trade = require("../models/trade.model");
const AiTrade = require("../models/aiTrade.model");
const Settings = require("../models/settings.model");
const Admin = require("../models/admin.model");
const AdminLog = require("../models/adminLog.model");
const os = require('os');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Get admin dashboard stats
const getAdminStats = async (req, res) => {
  const startTime = Date.now();
  const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  try {
    // Get admin info from request (assuming it's passed from middleware)
    const adminId = req.adminId || req.user?.adminId;
    const adminEmail = req.adminEmail || req.user?.email || 'unknown';
    const adminName = req.adminName || req.user?.name || 'unknown';

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });
    const premiumUsers = await User.countDocuments({ role: "admin" }); // Assuming admin = premium for now

    // Get admin statistics
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    // Get system health metrics
    const systemHealth = await getSystemHealth();
    
    // Get database statistics
    const dbStats = await getDatabaseStats();
    
    // Get recent admin activity
    const recentAdminActivity = await AdminLog.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('action description adminName createdAt status riskLevel')
      .lean();

    const stats = {
      totalUsers,
      activeUsers,
      premiumUsers,
      totalAdmins,
      activeAdmins,
      systemHealth: systemHealth.status,
      serverLoad: systemHealth.cpuUsage,
      databaseConnections: dbStats.connections,
      apiRequests: dbStats.requests,
      errorRate: dbStats.errorRate,
      uptime: systemHealth.uptime,
      lastBackup: dbStats.lastBackup,
      recentAdminActivity
    };

    const responseTime = Date.now() - startTime;

    // Log admin stats access
    if (adminId) {
      await AdminLog.logAction(adminId, 'other', 'Admin dashboard stats accessed', {
        adminEmail,
        adminName,
        ipAddress,
        userAgent,
        details: { statsKeys: Object.keys(stats) },
        status: 'success',
        responseTime,
        riskLevel: 'low'
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    
    const responseTime = Date.now() - startTime;
    
    // Log error
    if (req.adminId) {
      await AdminLog.logAction(req.adminId, 'other', 'Admin dashboard stats access failed', {
        adminEmail: req.adminEmail || 'unknown',
        adminName: req.adminName || 'unknown',
        ipAddress,
        userAgent,
        status: 'error',
        errorMessage: error.message,
        responseTime,
        riskLevel: 'medium'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics',
      error: error.message
    });
  }
};

// Get user management data
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all', role = 'all' } = req.query;
    
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status !== 'all') {
      if (status === 'active') {
        query.lastLogin = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }; // Last 7 days
      } else if (status === 'inactive') {
        query.lastLogin = { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
      }
    }
    
    // Role filter
    if (role !== 'all') {
      query.role = role;
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('name email phone role lastLogin totalMoney totalTrades winRate createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    // Transform users data
    const transformedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '+91 98765 43210', // Use actual phone or fallback
      role: user.role,
      status: user.lastLogin && user.lastLogin > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'active' : 'inactive',
      joinDate: user.createdAt.toISOString().split('T')[0],
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : 'Never',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
      totalMoney: user.totalMoney,
      totalTrades: user.totalTrades,
      winRate: user.winRate
    }));
    
    res.json({
      success: true,
      data: {
        users: transformedUsers,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalUsers: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get system monitoring data
const getSystemMetrics = async (req, res) => {
  try {
    const metrics = [
      {
        name: 'CPU Usage',
        value: Math.round(os.loadavg()[0] * 100 / os.cpus().length),
        unit: '%',
        status: getCpuStatus(),
        trend: 'up',
        icon: 'Cpu'
      },
      {
        name: 'Memory Usage',
        value: Math.round((1 - os.freemem() / os.totalmem()) * 100),
        unit: '%',
        status: getMemoryStatus(),
        trend: 'up',
        icon: 'HardDrive'
      },
      {
        name: 'Disk Usage',
        value: getDiskUsage().usagePercent,
        unit: '%',
        status: getDiskUsage().usagePercent > 80 ? 'critical' : getDiskUsage().usagePercent > 60 ? 'warning' : 'normal',
        trend: 'stable',
        icon: 'Database'
      },
      {
        name: 'Network Load',
        value: Math.round(Math.random() * 20 + 5), // Mock network data
        unit: 'Mbps',
        status: 'normal',
        trend: 'down',
        icon: 'Wifi'
      },
      {
        name: 'Active Connections',
        value: await getActiveConnections(),
        unit: '',
        status: 'normal',
        trend: 'up',
        icon: 'Globe'
      },
      {
        name: 'Response Time',
        value: Math.round(Math.random() * 50 + 20), // Mock response time
        unit: 'ms',
        status: 'normal',
        trend: 'stable',
        icon: 'Zap'
      }
    ];
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system metrics',
      error: error.message
    });
  }
};

// Get system logs
const getSystemLogs = async (req, res) => {
  try {
    // Get recent trades and user activities as system logs
    const recentTrades = await Trade.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');
    
    const recentUsers = await User.find()
      .sort({ lastLogin: -1 })
      .limit(5);
    
    const logs = [];
    
    // Add trade logs
    recentTrades.forEach(trade => {
      logs.push({
        id: trade._id.toString(),
        timestamp: trade.createdAt.toISOString(),
        level: 'info',
        message: `Trade executed: ${trade.symbol} ${trade.side} ${trade.quantity} shares`,
        service: 'Trade Service'
      });
    });
    
    // Add user activity logs
    recentUsers.forEach(user => {
      if (user.lastLogin) {
        logs.push({
          id: user._id.toString(),
          timestamp: user.lastLogin.toISOString(),
          level: 'info',
          message: `User login: ${user.email}`,
          service: 'User Service'
        });
      }
    });
    
    // Sort by timestamp
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      data: logs.slice(0, 20) // Return top 20 logs
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system logs',
      error: error.message
    });
  }
};

// Get analytics data
const getAnalyticsData = async (req, res) => {
  const startTime = Date.now();
  const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  try {
    const { timeRange = '7d' } = req.query;
    
    console.log('Fetching analytics data for timeRange:', timeRange);
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    console.log('Date range:', { startDate, endDate: now });
    
    // Get user growth data
    console.log('Fetching user growth data...');
    const userGrowth = await getUserGrowthData(startDate, now);
    console.log('User growth data:', userGrowth);
    
    // Get revenue data (based on trades)
    console.log('Fetching revenue data...');
    const revenueData = await getRevenueData(startDate, now);
    console.log('Revenue data:', revenueData);
    
    // Get activity data
    console.log('Fetching activity data...');
    const activityData = await getActivityData(startDate, now);
    console.log('Activity data:', activityData);
    
    // Get top features usage
    console.log('Fetching top features...');
    const topFeatures = await getTopFeaturesUsage();
    console.log('Top features:', topFeatures);
    
    // Get recent activity
    console.log('Fetching recent activity...');
    const recentActivity = await getRecentAnalyticsActivity();
    console.log('Recent activity:', recentActivity);
    
    const analyticsData = {
      userGrowth,
      revenueData,
      activityData,
      topFeatures,
      recentActivity
    };
    
    const responseTime = Date.now() - startTime;
    console.log('Analytics data fetched successfully in', responseTime, 'ms');
    
    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    const responseTime = Date.now() - startTime;
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
};

// Get system settings
const getSystemSettings = async (req, res) => {
  try {
    // Get settings from database or create default if none exist
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings
      settings = new Settings();
      await settings.save();
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings',
      error: error.message
    });
  }
};

// Update system settings
const updateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    // Find existing settings or create new ones
    let existingSettings = await Settings.findOne();
    
    if (!existingSettings) {
      existingSettings = new Settings();
    }
    
    // Update settings with new values
    Object.keys(settings).forEach(category => {
      if (settings[category] && typeof settings[category] === 'object') {
        Object.keys(settings[category]).forEach(key => {
          if (existingSettings[category]) {
            existingSettings[category][key] = settings[category][key];
          }
        });
      }
    });
    
    await existingSettings.save();
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: existingSettings
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system settings',
      error: error.message
    });
  }
};

// Helper functions
const getSystemHealth = async () => {
  const cpuUsage = Math.round(os.loadavg()[0] * 100 / os.cpus().length);
  const memoryUsage = Math.round((1 - os.freemem() / os.totalmem()) * 100);
  
  let status = 'excellent';
  if (cpuUsage > 80 || memoryUsage > 80) {
    status = 'critical';
  } else if (cpuUsage > 60 || memoryUsage > 60) {
    status = 'warning';
  } else if (cpuUsage > 40 || memoryUsage > 40) {
    status = 'good';
  }
  
  return {
    status,
    cpuUsage,
    memoryUsage,
    uptime: Math.round(os.uptime() / 3600) // Hours
  };
};

const getDiskUsage = () => {
  try {
    // Get disk usage for the current directory
    const stats = fs.statSync('.');
    const totalSpace = 100 * 1024 * 1024 * 1024; // Mock 100GB total space
    const usedSpace = Math.random() * 50 * 1024 * 1024 * 1024; // Random usage between 0-50GB
    const usagePercent = Math.round((usedSpace / totalSpace) * 100);
    
    return {
      total: totalSpace,
      used: usedSpace,
      free: totalSpace - usedSpace,
      usagePercent
    };
  } catch (error) {
    console.error('Error getting disk usage:', error);
    return {
      total: 0,
      used: 0,
      free: 0,
      usagePercent: 0
    };
  }
};

const getDatabaseStats = async () => {
  try {
    const db = mongoose.connection;
    const admin = db.db.admin();
    const serverStatus = await admin.serverStatus();
    
    return {
      connections: serverStatus.connections.current,
      requests: serverStatus.opcounters.query + serverStatus.opcounters.insert + serverStatus.opcounters.update + serverStatus.opcounters.delete,
      errorRate: 0.02, // Mock error rate
      lastBackup: new Date().toISOString()
    };
  } catch (error) {
    return {
      connections: 45,
      requests: 1234,
      errorRate: 0.02,
      lastBackup: new Date().toISOString()
    };
  }
};

const getRecentActivity = async () => {
  const recentTrades = await Trade.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'name email');
  
  return recentTrades.map(trade => ({
    id: trade._id.toString(),
    action: `Trade executed: ${trade.symbol}`,
    user: trade.userId.email,
    timestamp: trade.createdAt.toISOString(),
    impact: `₹${trade.realisedPL || 0}`
  }));
};

const getCpuStatus = () => {
  const usage = Math.round(os.loadavg()[0] * 100 / os.cpus().length);
  if (usage > 80) return 'critical';
  if (usage > 60) return 'warning';
  return 'normal';
};

const getMemoryStatus = () => {
  const usage = Math.round((1 - os.freemem() / os.totalmem()) * 100);
  if (usage > 80) return 'critical';
  if (usage > 60) return 'warning';
  return 'normal';
};

const getActiveConnections = async () => {
  try {
    const db = mongoose.connection;
    const admin = db.db.admin();
    const serverStatus = await admin.serverStatus();
    return serverStatus.connections.current;
  } catch (error) {
    return Math.floor(Math.random() * 200) + 100; // Mock connections
  }
};

const getUserGrowthData = async (startDate, endDate) => {
  const users = await User.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).sort({ createdAt: 1 });
  
  // Group by day and count
  const dailyCounts = {};
  users.forEach(user => {
    const date = user.createdAt.toISOString().split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });
  
  return Object.values(dailyCounts);
};

const getRevenueData = async (startDate, endDate) => {
  const trades = await Trade.find({
    createdAt: { $gte: startDate, $lte: endDate },
    realisedPL: { $exists: true }
  });
  
  // Group by day and sum realised P&L
  const dailyRevenue = {};
  trades.forEach(trade => {
    const date = trade.createdAt.toISOString().split('T')[0];
    dailyRevenue[date] = (dailyRevenue[date] || 0) + (trade.realisedPL || 0);
  });
  
  return Object.values(dailyRevenue);
};

const getActivityData = async (startDate, endDate) => {
  const trades = await Trade.find({
    createdAt: { $gte: startDate, $lte: endDate }
  });
  
  // Group by day and count trades
  const dailyActivity = {};
  trades.forEach(trade => {
    const date = trade.createdAt.toISOString().split('T')[0];
    dailyActivity[date] = (dailyActivity[date] || 0) + 1;
  });
  
  return Object.values(dailyActivity);
};

const getTopFeaturesUsage = async () => {
  // Mock feature usage data
  return [
    { name: 'AI Trading Suggestions', usage: 89, growth: 12.5 },
    { name: 'Real-time Charts', usage: 76, growth: 8.2 },
    { name: 'Portfolio Analytics', usage: 65, growth: 15.7 },
    { name: 'Risk Management', usage: 58, growth: 6.8 },
    { name: 'Market News', usage: 45, growth: 3.2 }
  ];
};

const getRecentAnalyticsActivity = async () => {
  const recentTrades = await Trade.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'name email');
  
  const recentUsers = await User.find()
    .sort({ lastLogin: -1 })
    .limit(5);
  
  const activities = [];
  
  recentTrades.forEach(trade => {
    activities.push({
      id: trade._id.toString(),
      action: 'Trade Executed',
      user: trade.userId.email,
      timestamp: trade.createdAt.toISOString(),
      impact: `₹${trade.realisedPL || 0}`
    });
  });
  
  recentUsers.forEach(user => {
    if (user.lastLogin) {
      activities.push({
        id: user._id.toString(),
        action: 'User Login',
        user: user.email,
        timestamp: user.lastLogin.toISOString(),
        impact: 'Active'
      });
    }
  });
  
  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

module.exports = {
  getAdminStats,
  getUsers,
  getSystemMetrics,
  getSystemLogs,
  getAnalyticsData,
  getSystemSettings,
  updateSystemSettings
};
