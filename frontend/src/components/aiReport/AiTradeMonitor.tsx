"use client";
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { io } from "socket.io-client";
import { useSocket } from "../SocketContext";

interface Setup {
  currentPrice?: number;
  expiry?: string;
  strike?: string;
  instrument_key?: string;
  strategy?: string;
}

interface TradePlan {
  entry?: string;
  stopLoss?: string;
  target?: string;
  timeFrame?: string;
}

export interface ActiveTrade {
  _id: string;
  aiTradeId: string;
  title: string;
  sentiment?: "BULLISH" | "BEARISH" | "NEUTRAL";
  setup?: Setup;
  tradePlan?: TradePlan;
  pnl?: number;
  currentPrice: number;
  percentPnL?: number;
  confidence?: number;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  activatedAt?: string;
  timeFrame?: string;
  status: "active" | "suggested";
  quantity?: number;
  symbol?: string;
  entryPrice?: number;
  unrealisedPnL?: number;
  logic?: string;
  tags?: string[];
}

const AiTradeMonitor: React.FC = () => {
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { trades } = useSocket();

  // useEffect(() => {
  //   const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);

  //   socket.emit("subscribeAiTrades");

  //   socket.on("aiTradesUpdate", (trades: ActiveTrade[]) => {
  //     setActiveTrades(trades);
  //     console.log(trades)
  //     setIsLoading(false);
  //     setLastUpdate(new Date());
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);
  useEffect(() => {
    const suggested = trades.filter((t) => t.status === "active");
    setActiveTrades(suggested);
    setIsLoading(false);
    setLastUpdate(new Date());
    console.log(trades);
  }, [trades]);
  const toggleMonitoring = () => setIsMonitoring(!isMonitoring);

  const getRiskColor = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "high":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case "bullish":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "bearish":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-400" />;
    }
  };

  const calculateProgress = (
    current: number,
    entry: number,
    target: number
  ) => {
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

  // 🔹 Dashboard summary
  const totalPnl = activeTrades.reduce(
    (acc, t) => acc + (t.unrealisedPnL ?? 0),
    0
  );
  const avgConfidence = activeTrades.length
    ? (
        activeTrades.reduce((acc, t) => acc + (t.confidence ?? 0), 0) /
        activeTrades.length
      ).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              AI Trade Monitor
            </h3>
            <p className="text-sm text-gray-600">
              Live market AI-driven trades
            </p>
          </div>
        </div>
        <button
          onClick={toggleMonitoring}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isMonitoring
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isMonitoring ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isMonitoring ? "Pause" : "Resume"}</span>
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg text-center">
        <div>
          <p className="text-sm text-gray-500">Total Trades</p>
          <p className="text-lg font-bold text-blue-600">
            {activeTrades.length}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Net P&L</p>
          <p
            className={`text-lg font-bold ${
              totalPnl >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ₹{totalPnl.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Avg Confidence</p>
          <p className="text-lg font-bold text-gray-800">{avgConfidence}%</p>
        </div>
      </div>

      {/* Active Trades */}
      {activeTrades.length === 0 ? (
        <p className="text-center text-gray-500">No active trades</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeTrades.map((trade) => (
            <div
              key={trade._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(trade.sentiment)}
                  <div>
                    <h4 className="font-medium">{trade.title}</h4>
                    <p className="text-sm text-gray-500">{trade.symbol}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(
                    trade.riskLevel
                  )}`}
                >
                  {trade.riskLevel}
                </span>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Entry</p>
                  <p className="font-medium">{trade.entryPrice ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current</p>
                  <p
                    className={`font-medium ${
                      (trade.unrealisedPnL ?? 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹{trade?.currentPrice?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current</p>
                  <p
                    className={`font-medium ${
                      (trade.unrealisedPnL ?? 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹{trade.unrealisedPnL?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Performance */}
              <div className="grid grid-cols-3 gap-4 mb-3 ">
                <div>
                  <p className="text-xs text-gray-500">Target</p>
                  <p className={`font-medium text-green-600 `}>
                    ₹{Number(trade.tradePlan?.target) ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">SL</p>
                  <p className={`font-medium text-red-600`}>
                    {trade.tradePlan?.stopLoss ?? "-"}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Confidence</p>
                  <p className="font-medium">{trade.confidence}%</p>
                </div>
              </div>

              {/* Expandable Details */}
              <button
                onClick={() =>
                  setExpanded(expanded === trade._id ? null : trade._id)
                }
                className="text-xs text-blue-600 hover:underline"
              >
                {expanded === trade._id ? "Hide Details" : "Show Details"}
              </button>

              {expanded === trade._id && (
                <div className="mt-3 text-sm text-gray-600 space-y-2">
                  <p>
                    <strong>Strategy:</strong> {trade.setup?.strategy}
                  </p>
                  <p>
                    <strong>Strike:</strong> {trade.setup?.strike}
                  </p>
                  <p>
                    <strong>Expiry:</strong> {trade.setup?.expiry}
                  </p>
                  <p>
                    <strong>Logic:</strong> {trade.logic}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trade.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiTradeMonitor;
