const { Schema, model } = require("mongoose");

const adminSchema = new Schema(
  {
    // 🔐 ADMIN AUTHENTICATION
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      required: true,
      enum: ["google", "github", "local"],
    },
    providerId: {
      type: String,
      required: true,
      unique: true,
    },

    // 👤 ADMIN PROFILE
    adminId: {
      type: String,
      unique: true,
      sparse: true, // This allows multiple null values but ensures uniqueness for non-null values
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "moderator"],
      default: "admin",
    },
    permissions: {
      type: [String],
      default: ["read", "write", "delete", "manage_users", "view_logs"],
    },

    // 📊 ADMIN STATISTICS
    totalLogins: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
    },
    lastLoginIP: {
      type: String,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },

    // 🔒 SECURITY
    isActive: {
      type: Boolean,
      default: true,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },

    // 📝 ADMIN ACTIVITIES
    actionsPerformed: {
      type: Number,
      default: 0,
    },
    usersManaged: {
      type: Number,
      default: 0,
    },
    systemChanges: {
      type: Number,
      default: 0,
    },

    // 📍 LOCATION & DEVICE INFO
    lastLoginLocation: {
      city: String,
      country: String,
      region: String,
    },
    deviceInfo: {
      userAgent: String,
      platform: String,
      browser: String,
    },

    // 🏷️ METADATA
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    collection: "admins",
  }
);

// Indexes for better performance
// adminSchema.index({ email: 1 });
// adminSchema.index({ adminId: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ lastLogin: -1 });

// Virtual for account lock status
adminSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to generate adminId
adminSchema.pre("save", function (next) {
  if (!this.adminId) {
    this.adminId = `ADM_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
  }
  next();
});

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
adminSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Method to update last login
adminSchema.methods.updateLastLogin = function (ip, location, deviceInfo) {
  this.lastLogin = new Date();
  this.lastLoginIP = ip;
  this.lastActivity = new Date();
  this.totalLogins += 1;

  if (location) {
    this.lastLoginLocation = location;
  }

  if (deviceInfo) {
    this.deviceInfo = deviceInfo;
  }

  return this.save();
};

// Method to check permissions
adminSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission) || this.role === "super_admin";
};

// Transform JSON output
adminSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  },
});

const Admin = model("Admin", adminSchema);

module.exports = Admin;
