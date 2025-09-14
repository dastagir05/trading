const { Schema, model } = require("mongoose");

const adminLogSchema = new Schema(
  {
    // 👤 ADMIN INFO
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    
    // 📝 ACTION DETAILS
    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout", 
        "user_created",
        "user_updated",
        "user_deleted",
        "user_banned",
        "user_unbanned",
        "system_settings_changed",
        "data_exported",
        "data_imported",
        "backup_created",
        "backup_restored",
        "api_key_generated",
        "api_key_revoked",
        "permissions_changed",
        "admin_created",
        "admin_updated",
        "admin_deleted",
        "system_restart",
        "maintenance_mode",
        "security_alert",
        "other"
      ],
    },
    
    // 📄 DETAILED INFO
    description: {
      type: String,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    
    // 🎯 TARGET INFO (if action affects another entity)
    targetType: {
      type: String,
      enum: ["user", "admin", "system", "trade", "ai_trade", "settings", "other"],
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    targetName: {
      type: String,
    },
    
    // 🌐 REQUEST INFO
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    location: {
      city: String,
      country: String,
      region: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    
    // 📊 STATUS & RESULT
    status: {
      type: String,
      enum: ["success", "failed", "warning", "error"],
      default: "success",
    },
    errorMessage: {
      type: String,
    },
    responseTime: {
      type: Number, // in milliseconds
    },
    
    // 🔒 SECURITY
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    isSuspicious: {
      type: Boolean,
      default: false,
    },
    
    // 📱 DEVICE INFO
    deviceInfo: {
      platform: String,
      browser: String,
      os: String,
      deviceType: String,
    },
    
    // 🏷️ METADATA
    sessionId: {
      type: String,
    },
    requestId: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { 
    timestamps: true,
    collection: "admin_logs"
  }
);

// Indexes for better performance
adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });
adminLogSchema.index({ status: 1, createdAt: -1 });
adminLogSchema.index({ riskLevel: 1, createdAt: -1 });
adminLogSchema.index({ isSuspicious: 1, createdAt: -1 });
adminLogSchema.index({ ipAddress: 1, createdAt: -1 });
adminLogSchema.index({ createdAt: -1 });

// Static method to log admin action
adminLogSchema.statics.logAction = async function(adminId, action, description, options = {}) {
  try {
    // Skip logging if adminId is null or undefined
    if (!adminId) {
      console.warn('Skipping admin log - adminId is required but not provided');
      return null;
    }

    const logEntry = new this({
      adminId,
      adminEmail: options.adminEmail || '',
      adminName: options.adminName || '',
      action,
      description,
      details: options.details || {},
      targetType: options.targetType,
      targetId: options.targetId,
      targetName: options.targetName,
      ipAddress: options.ipAddress || 'unknown',
      userAgent: options.userAgent,
      location: options.location,
      status: options.status || 'success',
      errorMessage: options.errorMessage,
      responseTime: options.responseTime,
      riskLevel: options.riskLevel || 'low',
      isSuspicious: options.isSuspicious || false,
      deviceInfo: options.deviceInfo,
      sessionId: options.sessionId,
      requestId: options.requestId,
      tags: options.tags || [],
    });
    
    return await logEntry.save();
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw error to prevent breaking the main flow
    return null;
  }
};

// Static method to get admin activity summary
adminLogSchema.statics.getActivitySummary = async function(adminId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const summary = await this.aggregate([
    {
      $match: {
        adminId: adminId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        successfulActions: {
          $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
        },
        failedActions: {
          $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
        },
        highRiskActions: {
          $sum: { $cond: [{ $in: ["$riskLevel", ["high", "critical"]] }, 1, 0] }
        },
        suspiciousActions: {
          $sum: { $cond: ["$isSuspicious", 1, 0] }
        },
        actionsByType: {
          $push: "$action"
        }
      }
    }
  ]);
  
  return summary[0] || {
    totalActions: 0,
    successfulActions: 0,
    failedActions: 0,
    highRiskActions: 0,
    suspiciousActions: 0,
    actionsByType: []
  };
};

// Transform JSON output
adminLogSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const AdminLog = model("AdminLog", adminLogSchema);

module.exports = AdminLog;
