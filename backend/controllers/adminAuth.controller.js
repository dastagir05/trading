const Admin = require("../models/admin.model");
const AdminLog = require("../models/adminLog.model");

// Admin login endpoint
const adminLogin = async (req, res) => {
  try {
    const { name, email, image, provider, providerId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Validate required fields
    if (!email || !provider || !providerId) {
      await AdminLog.logAction(null, 'login', 'Admin login attempt with missing fields', {
        adminEmail: email || 'unknown',
        adminName: name || 'unknown',
        ipAddress,
        userAgent,
        status: 'failed',
        errorMessage: 'Missing required fields',
        riskLevel: 'medium'
      });
      
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Check if email is authorized for admin access
    if (email !== "pinjaridastageer@gmail.com") {
      await AdminLog.logAction(null, 'login', 'Unauthorized admin login attempt', {
        adminEmail: email,
        adminName: name || 'unknown',
        ipAddress,
        userAgent,
        status: 'failed',
        errorMessage: 'Email not authorized for admin access',
        riskLevel: 'high',
        isSuspicious: true
      });
      
      return res.status(403).json({
        success: false,
        message: "Access denied. This email is not authorized for admin access."
      });
    }

    // Find or create admin
    let admin = await Admin.findOne({ email });
    
    if (!admin) {
      // Create new admin record
      admin = new Admin({
        name,
        email,
        image,
        provider,
        providerId,
        role: 'super_admin',
        permissions: ['read', 'write', 'delete', 'manage_users', 'view_logs', 'manage_admins', 'system_settings'],
        notes: 'Primary admin account created automatically'
      });
      
      console.log('Creating new admin...', { email, name });
      await admin.save();
      console.log('Admin saved successfully', { adminId: admin.adminId, _id: admin._id });
      
      // Log admin creation - only after admin is saved and has _id
      if (admin._id && admin.adminId) {
        try {
          await AdminLog.logAction(admin._id, 'admin_created', 'New admin account created', {
            adminEmail: email,
            adminName: name,
            ipAddress,
            userAgent,
            details: {
              role: admin.role,
              permissions: admin.permissions,
              adminId: admin.adminId
            },
            riskLevel: 'medium'
          });
          console.log('Admin creation logged successfully');
        } catch (logError) {
          console.error('Error logging admin creation:', logError);
        }
      } else {
        console.warn('Cannot log admin creation - missing _id or adminId:', { _id: admin._id, adminId: admin.adminId });
      }
    }

    // Check if admin account is locked
    if (admin.isLocked) {
      if (admin._id) {
        await AdminLog.logAction(admin._id, 'login', 'Login attempt on locked admin account', {
          adminEmail: email,
          adminName: admin.name,
          ipAddress,
          userAgent,
          status: 'failed',
          errorMessage: 'Account is locked due to multiple failed login attempts',
          riskLevel: 'high',
          isSuspicious: true
        });
      }
      
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked due to multiple failed login attempts. Please try again later."
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      if (admin._id) {
        await AdminLog.logAction(admin._id, 'login', 'Login attempt on inactive admin account', {
          adminEmail: email,
          adminName: admin.name,
          ipAddress,
          userAgent,
          status: 'failed',
          errorMessage: 'Admin account is inactive',
          riskLevel: 'high',
          isSuspicious: true
        });
      }
      
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive. Please contact system administrator."
      });
    }

    // Reset login attempts on successful login
    if (admin.loginAttempts > 0) {
      await admin.resetLoginAttempts();
    }

    // Update last login info
    const location = {
      city: 'Unknown',
      country: 'Unknown',
      region: 'Unknown'
    };

    const deviceInfo = {
      userAgent,
      platform: 'Web',
      browser: 'Unknown'
    };

    await admin.updateLastLogin(ipAddress, location, deviceInfo);

    // Log successful login
    if (admin._id) {
      await AdminLog.logAction(admin._id, 'login', 'Successful admin login', {
        adminEmail: email,
        adminName: admin.name,
        ipAddress,
        userAgent,
        location,
        deviceInfo,
        status: 'success',
        riskLevel: 'low'
      });
    }

    // Return admin data
    res.json({
      success: true,
      message: "Admin login successful",
      admin: {
        _id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
        totalLogins: admin.totalLogins,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    
    // Log error - skip if no adminId available
    try {
      await AdminLog.logAction(null, 'login', 'Admin login error', {
        adminEmail: req.body?.email || 'unknown',
        adminName: req.body?.name || 'unknown',
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        status: 'error',
        errorMessage: error.message,
        riskLevel: 'high'
      });
    } catch (logError) {
      console.error('Error logging admin login error:', logError);
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error during admin login"
    });
  }
};

// Admin logout endpoint
const adminLogout = async (req, res) => {
  try {
    const { adminId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (adminId) {
      const admin = await Admin.findById(adminId);
      if (admin && admin._id) {
        // Log logout
        await AdminLog.logAction(admin._id, 'logout', 'Admin logout', {
          adminEmail: admin.email,
          adminName: admin.name,
          ipAddress,
          userAgent,
          status: 'success',
          riskLevel: 'low'
        });
      }
    }

    res.json({
      success: true,
      message: "Admin logout successful"
    });

  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error during admin logout"
    });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const { adminId } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

    console.log("AdminAuth contrller getAdminProfile fetch",adminId);
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Log profile access
    if (adminId) {
      await AdminLog.logAction(adminId, 'other', 'Admin profile accessed', {
        adminEmail: admin.email,
        adminName: admin.name,
        ipAddress,
        status: 'success',
        riskLevel: 'low'
      });
    }

    res.json({
      success: true,
      admin: {
        _id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
        totalLogins: admin.totalLogins,
        actionsPerformed: admin.actionsPerformed,
        usersManaged: admin.usersManaged,
        systemChanges: admin.systemChanges,
        isActive: admin.isActive,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get admin activity logs
const getAdminLogs = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { page = 1, limit = 50, action, status, riskLevel, startDate, endDate } = req.query;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Build filter
    const filter = { adminId };
    if (action) filter.action = action;
    if (status) filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get logs with pagination
    const logs = await AdminLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await AdminLog.countDocuments(filter);

    // Log this access
    if (adminId) {
      await AdminLog.logAction(adminId, 'other', 'Admin logs accessed', {
        adminEmail: admin.email,
        adminName: admin.name,
        ipAddress,
        details: { page, limit, filters: filter },
        status: 'success',
        riskLevel: 'low'
      });
    }

    res.json({
      success: true,
      logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get admin activity summary
const getAdminActivitySummary = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { days = 30 } = req.query;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    const summary = await AdminLog.getActivitySummary(adminId, parseInt(days));

    // Log this access
    if (adminId) {
      await AdminLog.logAction(adminId, 'other', 'Admin activity summary accessed', {
        adminEmail: admin.email,
        adminName: admin.name,
        ipAddress,
        details: { days },
        status: 'success',
        riskLevel: 'low'
      });
    }

    res.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Get admin activity summary error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  getAdminProfile,
  getAdminLogs,
  getAdminActivitySummary
};
