const mongoose = require("mongoose");
const Admin = require("../models/admin.model");
const AdminLog = require("../models/adminLog.model");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const initAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      email: "pinjaridastageer@gmail.com",
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists:", existingAdmin.email);
      console.log("Admin ID:", existingAdmin.adminId);
      console.log("Role:", existingAdmin.role);
      console.log("Total Logins:", existingAdmin.totalLogins);
      return;
    }

    // Create new admin
    const admin = new Admin({
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
      ],
      notes: "Primary super admin account - System owner",
      isActive: true,
      twoFactorEnabled: false,
    });

    await admin.save();

    // Verify adminId was generated
    if (!admin.adminId) {
      console.error("❌ Admin ID was not generated properly");
      return;
    }

    console.log("✅ Admin created successfully!");
    console.log("Admin ID:", admin.adminId);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Permissions:", admin.permissions);

    // Log admin creation
    await AdminLog.logAction(
      admin._id,
      "admin_created",
      "Super admin account initialized",
      {
        adminEmail: admin.email,
        adminName: admin.name,
        ipAddress: "system",
        userAgent: "system_init",
        details: {
          role: admin.role,
          permissions: admin.permissions,
          isSystemInit: true,
        },
        status: "success",
        riskLevel: "low",
      }
    );

    console.log("✅ Admin creation logged");
  } catch (error) {
    console.error("❌ Error initializing admin:", error);
  } finally {
    await mongoose.connection.close();
    console.log("📡 Database connection closed");
  }
};

// Run the initialization
initAdmin();
