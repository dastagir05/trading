"use client"
import React, { useState, useEffect } from 'react';
import axios from "axios"
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Settings,
  Bell,
  Zap
} from 'lucide-react';

interface Setup {
  currentPrice: number;
  expiry:string;
  strike:string;
}

interface TradePlan {
  entry:string;
  stopLoss:string;
  target:string;
  timeFrame: string;
}

interface ActiveTrade {
  _id: string;
  aiTradeId: string;
  title: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  setup: Setup;
  tradePlan: TradePlan;
  pnl: number;
  percentPnL: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  activatedAt: Date;
  timeFrame: string;
  status: 'active';
  quantity: number;
  symbol: string;
  entryPrice: number;
}

const AiTradeMonitor: React.FC = () => {
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    fetchActiveTrades();
    
    if (isMonitoring) {
      const interval = setInterval(() => {
        fetchActiveTrades();
        setLastUpdate(new Date());
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [isMonitoring, refreshInterval]);
  const fetchActiveTrades = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai-trades?status=active`);
        console.log("actv", res.data.data)
        setActiveTrades(res.data.data);
    } catch (error) {
      console.error('Failed to fetch active trades:', error);
      setActiveTrades([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const manualRefresh = () => {
    fetchActiveTrades();
    setLastUpdate(new Date());
  };

  const getPriceChangeColor = (currentPrice: number, entryPrice: number) => {
    if (currentPrice > entryPrice) return 'text-green-600';
    if (currentPrice < entryPrice) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPriceChangeIcon = (currentPrice: number, entryPrice: number) => {
    if (currentPrice > entryPrice) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (currentPrice < entryPrice) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <TrendingUp className="w-4 h-4 text-gray-400" />;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'neutral': return <TrendingUp className="w-4 h-4 text-gray-500" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  const calculateProgress = (current: number, entry: number, target: number) => {
    const totalRange = Math.abs(target - entry);
    const currentRange = Math.abs(current - entry);
    return Math.min((currentRange / totalRange) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Live Trade Monitor</h3>
            <p className="text-sm text-gray-600">Real-time monitoring of active AI trades</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMonitoring}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isMonitoring 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isMonitoring ? 'Pause' : 'Resume'}</span>
          </button>
          
          <button
            onClick={manualRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Auto-refresh: {refreshInterval / 1000}s
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Active Trades:</span>
          <span className="text-lg font-bold text-blue-600">{activeTrades.length}</span>
        </div>
      </div>

      {/* Active Trades Grid */}
      {Array.isArray(activeTrades) && activeTrades.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Trades</h3>
          <p className="text-gray-500">There are currently no active AI trades to monitor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeTrades.map((trade) => (
            <div key={trade._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Trade Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(trade.sentiment)}
                  <div>
                    <h4 className="font-medium text-gray-900">{trade.title}</h4>
                    <p className="text-sm text-gray-500">{trade.symbol}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(trade.riskLevel)}`}>
                    {trade.riskLevel}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price Information */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Entry Price</p>
                  <p className="font-medium text-gray-900">{trade.tradePlan.entry}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Price</p>
                  <div className="flex items-center space-x-1">
                    {getPriceChangeIcon(trade.setup.currentPrice, trade.entryPrice)}
                    <p className={`font-medium ${getPriceChangeColor(trade.setup.currentPrice, trade.entryPrice)}`}>
                      ₹{trade.setup.currentPrice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2 mb-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Target: ₹{trade.tradePlan.target}</span>
                    <span>{calculateProgress(trade.setup.currentPrice, trade.entryPrice, parseInt(trade.tradePlan.target)).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${calculateProgress(trade.setup.currentPrice, trade.entryPrice, parseInt(trade.tradePlan.target))}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Stop Loss: ₹{trade.tradePlan.stopLoss}</span>
                    <span>{calculateProgress(trade.setup.currentPrice, trade.entryPrice, parseInt(trade.tradePlan.stopLoss)).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${calculateProgress(trade.setup.currentPrice, trade.entryPrice, parseInt(trade.tradePlan.stopLoss))}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">P&L</p>
                  <p className={`font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{trade.pnl}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">% P&L</p>
                  <p className={`font-medium ${trade.percentPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trade.percentPnL?.toFixed(2) ?? "-"}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Confidence</p>
                  <p className="font-medium text-gray-900">{trade.confidence}%</p>
                </div>
              </div>

              {/* Trade Details */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Qty: {trade.quantity ?? "1"}</span>
                <span>Time Frame: {trade.tradePlan.timeFrame}</span>
                <span>Started: {new Date(trade.activatedAt).toLocaleDateString() ?? "-"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Bell className="w-4 h-4" />
              <span>Set Alerts</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Target className="w-4 h-4" />
              <span>Modify Targets</span>
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Monitor will automatically refresh every {refreshInterval / 1000} seconds
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiTradeMonitor;
