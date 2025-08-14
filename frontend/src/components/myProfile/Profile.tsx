"use client";
import {
  User as UserIcon,
  Phone,
  Shield,
  Target,
  BarChart3,
  Clock,
  FileText,
  Settings,
  Bell,
  Lock,
} from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trade } from "@/types/trade";
import { User } from "@/types/user";
// Mock user data - this will come from your database
import { useSession } from "next-auth/react";
import ProfileHeader from "./ProfileHeader";
import Overview from "./Overview";

const Profile = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<User>();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-IN"),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const userData = {
    profile: {
      name: user?.name,
      email: user?.email,
      phone: "+91 98765 43210",
      address: "Mumbai, Maharashtra, India",
      joinDate: user?.createdAt
        ? formatDate(user.createdAt)
        : { date: "", time: "" },
      kycStatus: "Verified",
      profilePicture: user?.image, // Will be replaced with actual image URL from DB
      provider: user?.provider,
      lastLogin: user?.lastLogin,
      panNumber: "ABCDE1234F",
      bankAccount: "HDFC Bank - ****5678",
      tradingExperience: "2 Years",
    },
    trading: {
      totalMoney: user?.totalMoney,
      totalInvested: 485000,
      currentValue: 542750,
      realisePL: user?.realisedPL || 0,
      unralisePL: user?.unrealisedPL || 0,
      pnl: user?.pnl || 0,
      avgPnL: user?.avgPnL || 0,
      totalEstCharge: user?.totalEstCharge || 0,
      totalGains: user?.totalProfit || 0,
      gainsPercentage: 11.91,
      totalLoses: user?.totalLoss || 0,
      availableFunds: user?.totalMoney || 0,
      totalTrades: user?.totalTrades,
      totalCompleteTrade: user?.totalCompletedTrades,
      successfulTrades: 124,
      successRate: user?.winRate,
      avgHoldingPeriod: "45 days",
      riskProfile: "Moderate",
      favoriteStocks: user?.favouriteSymbols || [],
      monthlyTradingVolume: 125000,
    },
    statistics: {
      bestPerformingStock: user?.bestTrade,
      worstPerformingStock: user?.worstTrade,
      totalDividendEarned: 12500,
      taxSaved: 8500,
      portfolioDiversification: {
        largeCap: 60,
        midCap: 25,
        smallCap: 15,
      },
    },
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <UserIcon className="w-4 h-4" />,
    },
    {
      id: "trading",
      label: "Trading Stats",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
    { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
  ];
  useEffect(() => {
    if (!session?.user?._id) return;

    const fetchProfile = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/getprofile?userId=${session.user._id}`
      );
      const data = await res.data;
      setUser(data);
    };

    fetchProfile();
    console.log("usser", user);
  }, [session]);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <ProfileHeader userData={userData} />

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Overview userData={userData} />
          </div>
        )}

        {activeTab === "trading" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detailed Trading Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Average Holding Period</span>
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {userData.trading.avgHoldingPeriod}
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Tax Saved (80C)</span>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{userData.statistics.taxSaved.toLocaleString()}
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Successful Trades</span>
                  <Target className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {userData.trading.successfulTrades}/
                  {userData.trading.totalTrades}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Account Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-gray-600">
                      Receive trade alerts and market updates
                    </div>
                  </div>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Enabled
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">SMS Alerts</div>
                    <div className="text-sm text-gray-600">
                      Get SMS for important transactions
                    </div>
                  </div>
                </div>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                  Disabled
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Security Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600">
                      Add an extra layer of security
                    </div>
                  </div>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Enable 2FA
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">Login Sessions</div>
                    <div className="text-sm text-gray-600">
                      Manage your active sessions
                    </div>
                  </div>
                </div>
                <button className="text-green-600 hover:text-green-700 font-medium">
                  View Sessions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
