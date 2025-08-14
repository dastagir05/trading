import React from "react";
import {
  User as UserIcon,
  TrendingUp,
  Activity,
  Wallet,
  BarChart3,
  IndianRupee,
  Eye,
  EyeOff,
} from "lucide-react";

import { useState } from "react";

interface OverviewProps {
  userData: any;
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
                ₹{userData.trading.realisePL.toLocaleString()}
              </div>
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="font-medium">
                  +₹{userData.trading.totalGains.toLocaleString()}
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
                ₹{userData.trading.availableFunds.toLocaleString()}
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
                ₹{userData.trading.avgPnL.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">This month</div>
            </div>
          </div>
        </div>

        {/* Portfolio Diversification */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Portfolio Diversification
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Large Cap</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${userData.statistics.portfolioDiversification.largeCap}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {userData.statistics.portfolioDiversification.largeCap}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mid Cap</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${userData.statistics.portfolioDiversification.midCap}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {userData.statistics.portfolioDiversification.midCap}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Small Cap</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{
                      width: `${userData.statistics.portfolioDiversification.smallCap}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {userData.statistics.portfolioDiversification.smallCap}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
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

        {/* Performance Highlights */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Highlights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Best Performer</div>
                <div className="font-medium">
                  {userData.statistics.bestPerformingStock?.symbol}
                </div>
              </div>
              <div className="text-green-600 font-bold">
                +{userData.statistics.bestPerformingStock?.pnl}
              </div>
              <div className="text-green-600 font-bold">
                +{userData.statistics.bestPerformingStock?.percentPnL}%
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Worst Performer</div>
                <div className="font-medium">
                  {userData.statistics.worstPerformingStock?.symbol}
                </div>
              </div>
              <div className="text-red-600 font-bold">
                {userData.statistics.worstPerformingStock?.pnl}
              </div>
              <div className="text-red-600 font-bold">
                {userData.statistics.worstPerformingStock?.percentPnL}%
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Dividend Earned</div>
                <div className="font-medium">This Year</div>
              </div>
              <div className="text-blue-600 font-bold">
                ₹{userData.statistics.totalDividendEarned.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Stocks */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Favorite Stocks
          </h3>
          <div className="space-y-2">
            {userData.trading.favoriteStocks.map(
              (stock: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <span className="font-medium">{stock}</span>
                  <button className="text-green-600 hover:text-green-700 text-sm">
                    View
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
