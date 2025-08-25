const { Schema, model } = require("mongoose");

const settingsSchema = new Schema(
  {
    general: {
      siteName: {
        type: String,
        default: 'Nivesh Now'
      },
      siteDescription: {
        type: String,
        default: 'Smart Trading Platform'
      },
      maintenanceMode: {
        type: Boolean,
        default: false
      },
      debugMode: {
        type: Boolean,
        default: false
      }
    },
    security: {
      twoFactorAuth: {
        type: Boolean,
        default: true
      },
      sessionTimeout: {
        type: Number,
        default: 30
      },
      maxLoginAttempts: {
        type: Number,
        default: 5
      },
      passwordPolicy: {
        type: String,
        enum: ['weak', 'medium', 'strong', 'very-strong'],
        default: 'strong'
      }
    },
    email: {
      smtpHost: {
        type: String,
        default: 'smtp.gmail.com'
      },
      smtpPort: {
        type: Number,
        default: 587
      },
      smtpUser: {
        type: String,
        default: 'admin@niveshnow.com'
      },
      smtpPassword: {
        type: String,
        default: '********'
      },
      fromEmail: {
        type: String,
        default: 'noreply@niveshnow.com'
      },
      fromName: {
        type: String,
        default: 'Nivesh Now Admin'
      }
    },
    database: {
      backupFrequency: {
        type: String,
        enum: ['hourly', 'daily', 'weekly', 'monthly'],
        default: 'daily'
      },
      backupRetention: {
        type: Number,
        default: 30
      },
      autoOptimization: {
        type: Boolean,
        default: true
      }
    },
    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      pushNotifications: {
        type: Boolean,
        default: true
      },
      adminAlerts: {
        type: Boolean,
        default: true
      }
    }
  },
  { timestamps: true }
);

settingsSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Settings = model("settings", settingsSchema);

module.exports = Settings;
