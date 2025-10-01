"use client";
import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Settings,
  Activity,
  BarChart3,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Cog,
  Eye,
  Lock,
  Globe,
  Server,
  LogOut,
  User,
  Monitor,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import AdminUserManagement from "./AdminUserManagement";
import AdminSystemMonitor from "./AdminSystemMonitor";
import AdminAnalytics from "./AdminAnalytics";
import AdminSettings from "./AdminSettings";
import AdminProfile from "./AdminProfile";
import AdminActivity from "./AdminActivity";
import adminApiService, { type AdminStats } from "@/services/adminApi";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const result = await adminApiService.getAdminStats();
      if (result.success) {
        setStats(result.data);
      } else {
        console.error("Failed to fetch admin stats:", result);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "users", label: "User Management", icon: Users },
    { id: "monitor", label: "System Monitor", icon: Monitor },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent":
        return "text-green-600 bg-green-100";
      case "good":
        return "text-blue-600 bg-blue-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };
  const handleLogin = () => {
    const URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/`;
    window.location.href = URL;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h2>
              <p className="text-gray-600">
                Complete system administration and monitoring
              </p>
            </div>
            <div>
              <button
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleLogin}
              >
                Login with Upstox
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={`px-3 py-1 ${getHealthColor(
                stats?.systemHealth || "good"
              )} text-sm font-medium rounded-full`}
            >
              {stats?.systemHealth === "excellent" && (
                <CheckCircle className="w-4 h-4 inline mr-1" />
              )}
              {stats?.systemHealth === "good" && (
                <CheckCircle className="w-4 h-4 inline mr-1" />
              )}
              {stats?.systemHealth === "warning" && (
                <AlertTriangle className="w-4 h-4 inline mr-1" />
              )}
              {stats?.systemHealth === "critical" && (
                <AlertTriangle className="w-4 h-4 inline mr-1" />
              )}
              System {stats?.systemHealth}
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              <Server className="w-4 h-4 inline mr-1" />
              {stats?.uptime}% Uptime
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user?.name || "Admin"}
              </span>
              <button
                onClick={async () => {
                  try {
                    // Logout from backend first
                    if (session?.user?.adminId) {
                      await adminApiService.adminLogout(session.user.adminId);
                    }
                    // Then logout from NextAuth
                    await signOut({ callbackUrl: "/" });
                  } catch (error) {
                    console.error("Logout error:", error);
                    // Still logout from NextAuth even if backend fails
                    await signOut({ callbackUrl: "/" });
                  }
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats?.totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {stats?.activeUsers}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Premium Users
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats?.premiumUsers}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">
                  Server Load
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats?.serverLoad}%
                </p>
              </div>
              <Database className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  System Health
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Database Connections
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats?.databaseConnections}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      API Requests (24h)
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats?.apiRequests}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {(stats?.errorRate || 0) * 100}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      System backup completed
                    </span>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      New user registration
                    </span>
                    <span className="text-xs text-gray-400">
                      15 minutes ago
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      API rate limit warning
                    </span>
                    <span className="text-xs text-gray-400">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && <AdminProfile />}
        {activeTab === "activity" && <AdminActivity />}
        {activeTab === "users" && <AdminUserManagement />}
        {activeTab === "monitor" && <AdminSystemMonitor />}
        {activeTab === "analytics" && <AdminAnalytics />}
        {activeTab === "settings" && <AdminSettings />}
      </div>
    </div>
  );
};

export default AdminDashboard;
