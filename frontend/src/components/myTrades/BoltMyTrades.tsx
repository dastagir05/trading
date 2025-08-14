"use client";
import React, { useState, useEffect, JSX, useMemo } from "react";
import {
  CheckCircle,
  Download,
  RefreshCw,
  IndianRupee,
  BarChart3,
} from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User } from "../../types/user";
import { Trade } from "@/types/trade";
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
        icon: <IndianRupee className="w-6 h-6 text-purple-600" />,
        bg: "bg-purple-100",
        showAlways: true,
      },
      {
        label: "In Process",
        value: user.openPositions,
        icon: <CheckCircle className="w-6 h-6 text-green-600" />,
        bg: "bg-green-100",
        showAlways: true,
      },
      {
        label: "Realised P&L",
        value: user.realisedPL,
        icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
        bg: "bg-blue-100",
        showAlways: true,
      },
      {
        label: "Unrealised P&L",
        value: user.unrealisedPL,
        icon: <BarChart3 className="w-6 h-6 text-pink-600" />,
        bg: "bg-pink-100",
        showAlways: true,
      },
      // More stats here...
    ];
  }, [user]);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }; //unrealish pl

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  My Trades
                </h1>
                <p className="text-gray-600">
                  Track and manage all your trading activities
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats
              .filter((stat) => stat.showAlways || stat.value !== 0)
              .map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof stat.value === "number"
                        ? `₹${stat.value.toFixed(2)}`
                        : stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}
                  >
                    {stat.icon}
                  </div>
                </div>
              ))}
          </div>

          {/* Trade Table */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <TradeTable />
          </div>
        </div>
      </div>
    </>
  );
};

export default MyTradesPage;
