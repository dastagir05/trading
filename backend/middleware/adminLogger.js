const AdminLog = require('../models/adminLog.model');

// Middleware to log admin activities
const adminLogger = (action, description, options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Get admin info from request
    const adminId = req.adminId || req.user?.adminId || req.body?.adminId;
    const adminEmail = req.adminEmail || req.user?.email || req.body?.email || 'unknown';
    const adminName = req.adminName || req.user?.name || req.body?.name || 'unknown';

    // Override original res.json to capture response
    const originalJson = res.json;
    res.json = function(data) {
      const responseTime = Date.now() - startTime;
      
      // Log the action asynchronously (don't wait for it)
      if (adminId) {
        AdminLog.logAction(adminId, action, description, {
          adminEmail,
          adminName,
          ipAddress,
          userAgent,
          details: {
            ...options.details,
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            query: req.query,
            responseStatus: res.statusCode,
            responseTime
          },
          targetType: options.targetType,
          targetId: options.targetId,
          targetName: options.targetName,
          status: res.statusCode >= 400 ? 'failed' : 'success',
          responseTime,
          riskLevel: options.riskLevel || 'low',
          isSuspicious: options.isSuspicious || false,
          sessionId: req.sessionID,
          requestId: req.headers['x-request-id'],
          tags: options.tags || []
        }).catch(err => {
          console.error('Error logging admin action:', err);
        });
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Middleware to extract admin info from JWT or session
const extractAdminInfo = (req, res, next) => {
  // This would typically extract admin info from JWT token
  // For now, we'll assume it's passed in headers or body
  req.adminId = req.headers['x-admin-id'] || req.body?.adminId;
  req.adminEmail = req.headers['x-admin-email'] || req.body?.email;
  req.adminName = req.headers['x-admin-name'] || req.body?.name;
  
  next();
};

// Middleware to validate admin permissions
const validateAdminPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const adminId = req.adminId || req.user?.adminId;
      
      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Admin authentication required'
        });
      }

      // In a real implementation, you would check the admin's permissions
      // For now, we'll assume all authenticated admins have permissions
      next();
    } catch (error) {
      console.error('Permission validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission validation failed'
      });
    }
  };
};

module.exports = {
  adminLogger,
  extractAdminInfo,
  validateAdminPermission
};
