"use client";
import React, { useState, useEffect } from "react";
import { Brain, TrendingUp, Clock, BarChart3, Activity } from "lucide-react";
import AiTradeList from "./AiTradeList";
import AiTradeStats from "./AiTradeStats";
import AiTradeMonitor from "./AiTradeMonitor";
import AiTradeReports from "./AiTradeReports";

interface AiTradeStats {
  totalTrades: number;
  suggestedTrades: number;
  activeTrades: number;
  completedTrades: number;
  targetHitNumber: number;
  stopLossHitNumber: number;
  activeExpiredNumber: number;
  expired: number;
  cancelled: number;
  totalPnL: number;
  winRate: number;
  avgConfidence: number;
}

const AiTradeDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AiTradeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/ai-trades/stats");
      const data = await response.json();
      console.log("stass", data.data);
      setStats(data.data);
    } catch (error) {
      console.error("Failed to fetch AI trade stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "trades", label: "All Trades", icon: Activity },
    { id: "monitor", label: "Live Monitor", icon: Clock },
    { id: "reports", label: "Reports", icon: TrendingUp },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className=" lg:bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                AI Trade System
              </h2>
              <p className="text-gray-600">
                Complete monitoring and management of AI-generated trades
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              System Active
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              Cron Jobs Running
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            {
              if (tab.id === "reports" && window.innerWidth < 524) {
                return null; // Hide the Reports tab on small screens
              }
            }
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <AiTradeStats stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AiTradeMonitor />
              <div className="hidden lg:block">
                <AiTradeReports />
              </div>
            </div>
          </div>
        )}

        {activeTab === "trades" && <AiTradeList />}
        {activeTab === "monitor" && <AiTradeMonitor />}
        <div className="hidden lg:block">
          {activeTab === "reports" && <AiTradeReports />}
        </div>
      </div>
    </div>
  );
};

export default AiTradeDashboard;
