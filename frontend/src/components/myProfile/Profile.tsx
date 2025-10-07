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
  Menu,
  X,
} from "lucide-react";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { User } from "@/types/user";
// Mock user data - this will come from your database
import { useSession } from "next-auth/react";
import ProfileHeader from "./ProfileHeader";
import Overview from "./Overview";
import { UserData } from "@/types/profileuser";

const Profile = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<User>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const userData: UserData = useMemo(
    () => ({
      profile: {
        name: user?.name || "",
        email: user?.email || "",
        phone: "+91 98765 43210",
        address: "Mumbai, Maharashtra, India",
        joinDate: user?.createdAt
          ? formatDate(user.createdAt)
          : { date: "", time: "" },
        kycStatus: "Verified",
        profilePicture: user?.image || "",
        provider: user?.provider || "",
        lastLogin: user?.lastLogin
          ? typeof user.lastLogin === "string"
            ? user.lastLogin
            : new Date(user.lastLogin).toLocaleString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
          : "",
        panNumber: "ABCDE1234F",
        bankAccount: "HDFC Bank - ****5678",
        tradingExperience: "2 Years",
      },
      trading: {
        totalMoney: user?.totalMoney || 0,
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
        totalTrades: user?.totalTrades || 0,
        totalCompleteTrade: user?.totalCompletedTrades || 0,
        successfulTrades: 124,
        successRate: user?.winRate || 0,
        avgHoldingPeriod: "45 days",
        riskProfile: "Moderate",
        favoriteStocks: user?.favouriteSymbols || [],
        monthlyTradingVolume: 125000,
      },
    }),
    [user]
  );

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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <ProfileHeader userData={userData} />

        {/* Mobile Menu Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full bg-white rounded-lg text-black shadow-sm p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              {tabs.find((tab) => tab.id === activeTab)?.icon}
              <span className="font-medium">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </span>
            </div>
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="mt-2 bg-white rounded-lg shadow-lg overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-green-50 text-green-600 border-l-4 border-green-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 lg:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <Overview userData={userData} />
          </div>
        )}

        {activeTab === "trading" && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detailed Trading Statistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm sm:text-base text-gray-600">
                    Average Holding Period
                  </span>
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {userData.trading.avgHoldingPeriod}
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm sm:text-base text-gray-600">
                    Tax Saved (80C)
                  </span>
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm sm:text-base text-gray-600">
                    Successful Trades
                  </span>
                  <Target className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {userData.trading.successfulTrades}/
                  {userData.trading.totalTrades}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Account Settings
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-start sm:items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <div className="font-medium text-sm sm:text-base">
                      Email Notifications
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Receive trade alerts and market updates
                    </div>
                  </div>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto">
                  Enabled
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-start sm:items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <div className="font-medium text-sm sm:text-base">
                      SMS Alerts
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Get SMS for important transactions
                    </div>
                  </div>
                </div>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base w-full sm:w-auto">
                  Disabled
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Security Settings
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-start sm:items-center space-x-3">
                  <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <div className="font-medium text-sm sm:text-base">
                      Two-Factor Authentication
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Add an extra layer of security
                    </div>
                  </div>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto">
                  Enable 2FA
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-start sm:items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <div className="font-medium text-sm sm:text-base">
                      Login Sessions
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Manage your active sessions
                    </div>
                  </div>
                </div>
                <button className="text-green-600 hover:text-green-700 font-medium text-sm sm:text-base w-full sm:w-auto text-left sm:text-right">
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
