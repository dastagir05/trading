"use client"
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react';

export interface AiTradeStatsProps {
  stats: {
    totalTrades: number;
    suggestedTrades: number;
    activeTrades: number;
    completedTrades: number,
    targetHitNumber: number;
    stopLossHitNumber: number;
    activeExpiredNumber:number;
    expired: number;
    cancelled: number;
    totalPnL: number;
    winRate: number;
    avgConfidence: number;
  } | null;
}

const AiTradeStats: React.FC<AiTradeStatsProps> = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total AI Trades',
      value: stats.totalTrades,
      icon: Activity,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Trades',
      value: stats.activeTrades,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Target Hit',
      value: stats.targetHitNumber,
      icon: Target,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Stop Loss Hit',
      value: stats.stopLossHitNumber,
      icon: Shield,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    // {
    //   title: 'Completed Trades',
    //   value: stats.completedTrades,
    //   icon: Shield,
    //   color: 'bg-green-500',
    //   textColor: 'text-orange-400'
    // },
    {
      title: 'Actively Expired Trades',
      value: stats.activeExpiredNumber,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-yellow-500'
    },
    {
      title: 'Success Rate',
      value: `${((stats.winRate)*100).toFixed(2) }%`,
      icon: BarChart3,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total P&L',
      value: `₹${stats.totalPnL.toFixed(2)}`,
      icon: DollarSign,
      color: stats.totalPnL >= 0 ? 'bg-green-500' : 'bg-red-500',
      textColor: stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
    }
  ];

  const statusBreakdown = [
    { label: 'Suggested', count: stats.suggestedTrades, color: 'bg-gray-100 text-gray-700' },
    { label: 'Active', count: stats.activeTrades, color: 'bg-blue-100 text-blue-700' },
    { label: 'Target Hit', count: stats.targetHitNumber, color: 'bg-green-100 text-green-700' },
    { label: 'Stop Loss Hit', count: stats.stopLossHitNumber, color: 'bg-red-100 text-red-700' },
    { label: 'Actively Expired', count: stats.activeExpiredNumber, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Expired', count: stats.expired, color: 'bg-gray-100 text-gray-700' }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statusBreakdown.map((status, index) => (
            <div key={index} className="text-center">
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${status.color}`}>
                {status.count}
              </div>
              <p className="text-xs text-gray-600 mt-1">{status.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Confidence</span>
              <span className="font-semibold text-gray-900">{stats.avgConfidence}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${stats.avgConfidence}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-semibold text-gray-900">{stats.winRate*100}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${stats.winRate*100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">P&L Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total P&L</span>
              <span className={`font-semibold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{stats.totalPnL}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profitable Trades</span>
              <span className="font-semibold text-green-600">{stats.targetHitNumber}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Loss Making Trades</span>
              <span className="font-semibold text-red-600">{stats.stopLossHitNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiTradeStats;

