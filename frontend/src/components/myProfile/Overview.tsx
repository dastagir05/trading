import React from "react";
import {
  TrendingUp,
  Activity,
  Wallet,
  BarChart3,
  IndianRupee,
  Eye,
  EyeOff,
} from "lucide-react";

import { useState } from "react";
import { UserData } from "@/types/profileuser";

interface OverviewProps {
  userData: UserData;
}

const Overview = ({ userData }: OverviewProps) => {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Portfolio Summary */}
      <div className="lg:col-span-2 space-y-6">
        {/* Trading Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">RealisePL</h3>
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">
                ₹
                {userData.trading.realisePL !== undefined
                  ? userData.trading.realisePL.toLocaleString()
                  : "0"}
              </div>
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="font-medium">
                  +₹
                  {userData.trading.totalGains !== undefined
                    ? userData.trading.totalGains.toLocaleString()
                    : "0"}
                </span>
                <span className="ml-1">
                  ({userData.trading.gainsPercentage}%)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Funds
              </h3>
              <IndianRupee className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">
                ₹{userData.trading.availableFunds?.toLocaleString()}
              </div>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                Reset Fund
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Total Trades
              </h3>
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">
                {userData.trading.totalTrades}
              </div>
              <div className="text-green-600 font-medium">
                {userData.trading.successRate}% Success Rate
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Avg P&L</h3>
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">
                ₹{userData.trading.avgPnL?.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">This month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Account Information */}
        <div className="bg-white rounded-lg text-black shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">PAN Number</span>
              <div className="flex items-center">
                <span className="font-medium">
                  {showSensitiveInfo
                    ? userData.profile.panNumber
                    : "****DE1234F"}
                </span>
                <button
                  onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  {showSensitiveInfo ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Bank Account</span>
              <span className="font-medium">
                {userData.profile.bankAccount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Experience</span>
              <span className="font-medium">
                {userData.profile.tradingExperience}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Risk Profile</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                {userData.trading.riskProfile}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
