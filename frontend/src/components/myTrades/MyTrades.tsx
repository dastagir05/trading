"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle,
  Download,
  RefreshCw,
  IndianRupee,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User } from "../../types/user";
import TradeTable from "./TradeTable";

const MyTradesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User>();

  const { data: session, status } = useSession();

  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status]);

  useEffect(() => {
    if (!session?.user?._id) return;

    const fetchUser = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/getprofile?userId=${session.user._id}`
      );
      console.log("set user", res);
      setUser(res.data);
    };

    fetchUser();
  }, []);

  const stats = useMemo(() => {
    if (!user) return [];

    return [
      {
        label: "Total Money",
        value: user.totalMoney,
        icon: <IndianRupee className="w-5 h-5" />,
        bg: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-100",
        showAlways: true,
      },
      {
        label: "In Process",
        value: user.openPositions,
        icon: <CheckCircle className="w-5 h-5" />,
        bg: "from-green-500 to-green-600",
        iconBg: "bg-green-100",
        showAlways: true,
      },
      {
        label: "Realised P&L",
        value: user.realisedPL,
        icon:
          user.realisedPL >= 0 ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          ),
        bg:
          user.realisedPL >= 0
            ? "from-blue-500 to-blue-600"
            : "from-red-500 to-red-600",
        iconBg: user.realisedPL >= 0 ? "bg-blue-100" : "bg-red-100",
        showAlways: true,
      },
      {
        label: "Unrealised P&L",
        value: user.unrealisedPL,
        icon:
          user.unrealisedPL >= 0 ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          ),
        bg:
          user.unrealisedPL >= 0
            ? "from-pink-500 to-pink-600"
            : "from-orange-500 to-orange-600",
        iconBg: user.unrealisedPL >= 0 ? "bg-pink-100" : "bg-orange-100",
        showAlways: true,
      },
    ];
  }, [user]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header - Compact */}
      <div className="lg:hidden  sticky top-0 z-10 bg-white shadow-md">
        <div className="px-4 py-4">
          <div className="pl-7 flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Trades</h1>
              <p className="text-xs text-gray-500">Track your portfolio</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4  ${loading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                className="p-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                aria-label="Export"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block px-6 pt-6">
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Trades
              </h1>
              <p className="text-gray-600">
                Track and manage all your trading activities
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex text-black items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Stats - Card Style */}
          <div className="lg:hidden space-y-3 mb-4 pt-4">
            {stats
              .filter((stat) => stat.showAlways || stat.value !== 0)
              .map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {stat.label}
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {typeof stat.value === "number"
                            ? `₹${stat.value.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : stat.value}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Desktop Stats Grid */}
          <div className="hidden lg:grid  grid-cols-4 gap-6 mb-8">
            {stats
              .filter((stat) => stat.showAlways || stat.value !== 0)
              .map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl text-black shadow-sm p-6 border flex justify-between items-center border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof stat.value === "number"
                        ? `₹${stat.value.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : stat.value}
                    </p>
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}
                    >
                      <div
                        className={`bg-gradient-to-br ${stat.bg} bg-clip-text `}
                      >
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Trade Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Table Header - Mobile */}
            <div className="lg:hidden px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Trade History
              </h2>
              <span className="text-xs text-gray-500">Swipe for more →</span>
            </div>

            {/* Table Header - Desktop */}
            <div className="hidden lg:block px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Trade History
              </h2>
            </div>

            {/* Table Content - Desktop */}
            <div className=" lg:block overflow-x-auto">
              <div className="p-3 lg:p-6">
                <TradeTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTradesPage;
