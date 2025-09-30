const mongoose = require("mongoose");
const Admin = require("../models/admin.model");
const AdminLog = require("../models/adminLog.model");
const User = require("../models/user.model");
// require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const setupAdminSystem = async () => {
  try {
    await connectDB();

    console.log("🚀 Setting up Admin System...\n");

    // 1. Create super admin account
    console.log("1. Creating Super Admin Account...");
    const existingAdmin = await Admin.findOne({
      email: "pinjaridastageer@gmail.com",
    });

    if (existingAdmin) {
      console.log("✅ Super admin already exists");
      console.log(`   Admin ID: ${existingAdmin.adminId}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Total Logins: ${existingAdmin.totalLogins}`);
    } else {
      const superAdmin = new Admin({
        name: "Pinjari Dastageer",
        email: "pinjaridastageer@gmail.com",
        image: "https://via.placeholder.com/150",
        provider: "google",
        providerId: "google_" + Date.now(),
        role: "super_admin",
        permissions: [
          "read",
          "write",
          "delete",
          "manage_users",
          "view_logs",
          "manage_admins",
          "system_settings",
          "backup_restore",
          "api_management",
          "security_management",
        ],
        notes: "Primary super admin account - System owner and creator",
        isActive: true,
        twoFactorEnabled: false,
      });

      await superAdmin.save();

      // Verify adminId was generated
      if (!superAdmin.adminId) {
        console.error("❌ Admin ID was not generated properly");
        return;
      }

      console.log("✅ Super admin created successfully!");
      console.log(`   Admin ID: ${superAdmin.adminId}`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Role: ${superAdmin.role}`);
    }

    // 2. Create sample admin logs
    console.log("\n2. Creating Sample Admin Logs...");
    const admin = await Admin.findOne({ email: "pinjaridastageer@gmail.com" });

    const sampleLogs = [
      {
        adminId: admin._id,
        adminEmail: admin.email,
        adminName: admin.name,
        action: "admin_created",
        description: "Super admin account initialized",
        ipAddress: "system",
        userAgent: "system_init",
        status: "success",
        riskLevel: "low",
        details: { isSystemInit: true },
      },
      {
        adminId: admin._id,
        adminEmail: admin.email,
        adminName: admin.name,
        action: "system_settings_changed",
        description: "Admin system initialized and configured",
        ipAddress: "system",
        userAgent: "system_init",
        status: "success",
        riskLevel: "low",
        details: {
          changes: [
            "admin_models_created",
            "logging_enabled",
            "permissions_set",
          ],
        },
      },
      {
        adminId: admin._id,
        adminEmail: admin.email,
        adminName: admin.name,
        action: "other",
        description: "Admin dashboard accessed for first time",
        ipAddress: "127.0.0.1",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        status: "success",
        riskLevel: "low",
        details: {
          page: "admin_dashboard",
          features: ["stats", "user_management", "system_monitor"],
        },
      },
    ];

    for (const logData of sampleLogs) {
      const log = new AdminLog(logData);
      await log.save();
    }
    console.log("✅ Sample admin logs created");

    // 3. Update user model to include admin role
    console.log("\n3. Checking User Model...");
    const userWithAdminRole = await User.findOne({ role: "admin" });
    if (userWithAdminRole) {
      console.log("✅ User model already has admin role support");
    } else {
      console.log(
        "ℹ️  User model supports admin role (no users with admin role yet)"
      );
    }

    // 4. Create admin activity summary
    console.log("\n4. Generating Admin Activity Summary...");
    const activitySummary = await AdminLog.getActivitySummary(admin._id, 30);
    console.log("✅ Admin Activity Summary:");
    console.log(`   Total Actions: ${activitySummary.totalActions}`);
    console.log(`   Successful Actions: ${activitySummary.successfulActions}`);
    console.log(`   Failed Actions: ${activitySummary.failedActions}`);
    console.log(`   High Risk Actions: ${activitySummary.highRiskActions}`);
    console.log(`   Suspicious Actions: ${activitySummary.suspiciousActions}`);

    // 5. Display system information
    console.log("\n5. System Information:");
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Admin Collection: admins`);
    console.log(`   Admin Logs Collection: admin_logs`);
    console.log(`   Total Admins: ${await Admin.countDocuments()}`);
    console.log(`   Total Admin Logs: ${await AdminLog.countDocuments()}`);
    console.log(`   Total Users: ${await User.countDocuments()}`);

    // 6. API Endpoints Information
    console.log("\n6. Available Admin API Endpoints:");
    console.log("   POST /api/admin-auth/login - Admin login");
    console.log("   POST /api/admin-auth/logout - Admin logout");
    console.log("   GET  /api/admin-auth/profile/:adminId - Get admin profile");
    console.log("   GET  /api/admin-auth/logs/:adminId - Get admin logs");
    console.log(
      "   GET  /api/admin-auth/activity/:adminId - Get activity summary"
    );
    console.log("   GET  /api/admin/stats - Get admin dashboard stats");
    console.log("   GET  /api/admin/users - Get user management data");

    console.log("\n🎉 Admin System Setup Complete!");
    console.log("\n📝 Next Steps:");
    console.log("   1. Test admin login with pinjaridastageer@gmail.com");
    console.log("   2. Access admin dashboard at /admin");
    console.log("   3. Monitor admin logs for security");
    console.log("   4. Configure additional admin users if needed");
  } catch (error) {
    console.error("❌ Error setting up admin system:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n📡 Database connection closed");
  }
};

// Run the setup
setupAdminSystem();
