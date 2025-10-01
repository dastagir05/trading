"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  PieChart,
  LineChart,
  Target,
  Shield,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface PerformanceReport {
  totalTrades: number;
  profitableTrades: number;
  lossMakingTrades: number;
  totalPnL: number;
  avgPnL: number;
  successRate: number;
  avgConfidence: number;
  bestTrade?: {
    symbol?: string;
    pnl?: number;
    percentPnL?: number;
    date?: Date;
  };
  worstTrade?: {
    symbol?: string;
    pnl?: number;
    percentPnL?: number;
    date?: Date;
  };
  monthlyPerformance?: {
    month: string;
    trades: number;
    pnl: number;
    successRate: number;
  }[];
  sentimentPerformance?: {
    sentiment: string;
    trades: number;
    successRate: number;
    avgPnL: number;
  }[];
  riskLevelPerformance?: {
    riskLevel: string;
    trades: number;
    successRate: number;
    avgPnL: number;
  }[];
}

const AiTradeReports: React.FC = () => {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("pnl");

  useEffect(() => {
    fetchPerformanceReport();
  }, [dateRange]);

  const fetchPerformanceReport = async () => {
    try {
      const response = await fetch(
        `/api/ai-trades/report/performance?range=${dateRange}`
      );
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch performance report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    console.log("Exporting report...");
  };

  const getMetricColor = (
    value: number | undefined,
    isPositive: boolean = true
  ) => {
    if (value === undefined) return "text-gray-600";
    if (isPositive) {
      return value >= 0 ? "text-green-600" : "text-red-600";
    }
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  const getMetricIcon = (
    value: number | undefined,
    isPositive: boolean = true
  ) => {
    if (value === undefined)
      return <BarChart3 className="w-4 h-4 text-gray-400" />;
    if (isPositive) {
      return value >= 0 ? (
        <TrendingUp className="w-4 h-4 text-green-500" />
      ) : (
        <TrendingDown className="w-4 h-4 text-red-500" />
      );
    }
    return value >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const formatDate = (date?: Date) => {
    return date ? new Date(date).toLocaleDateString() : "-";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Report Data
        </h3>
        <p className="text-gray-500">Unable to load performance report data.</p>
      </div>
    );
  }

  return (
    <div className="hidden lg:bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Reports
            </h3>
            <p className="text-sm text-gray-600">
              Detailed analytics and insights for AI trades
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last 1 Year</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={exportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total P&L</p>
              <p
                className={`text-2xl font-bold ${getMetricColor(
                  report.totalPnL
                )}`}
              >
                ₹{report.totalPnL?.toLocaleString() ?? "-"}
              </p>
            </div>
            {getMetricIcon(report.totalPnL)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {report.totalTrades ?? 0} total trades
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {report.successRate?.toFixed(2) ?? "-"}%
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {report.profitableTrades ?? 0} profitable trades
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg P&L</p>
              <p
                className={`text-2xl font-bold ${getMetricColor(
                  report.avgPnL
                )}`}
              >
                ₹{report.avgPnL?.toLocaleString() ?? "-"}
              </p>
            </div>
            {getMetricIcon(report.avgPnL)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Per trade average</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-purple-600">
                {report.avgConfidence?.toFixed(2) ?? "-"}%
              </p>
            </div>
            <Target className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">AI confidence level</p>
        </div>
      </div>

      {/* Best and Worst Trades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-900">Best Trade</h4>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-green-700">
              <strong>Symbol:</strong> {report.bestTrade?.symbol ?? "-"}
            </p>
            <p className="text-lg font-bold text-green-900">
              ₹{report.bestTrade?.pnl?.toLocaleString() ?? "-"} (
              {report.bestTrade?.percentPnL?.toFixed(2) ?? "-"}%)
            </p>
            <p className="text-xs text-green-600">
              {formatDate(report.bestTrade?.date)}
            </p>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-red-900">Worst Trade</h4>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-red-700">
              <strong>Symbol:</strong> {report.worstTrade?.symbol ?? "-"}
            </p>
            <p className="text-lg font-bold text-red-900">
              ₹{report.worstTrade?.pnl?.toLocaleString() ?? "-"} (
              {report.worstTrade?.percentPnL?.toFixed(2) ?? "-"}%)
            </p>
            <p className="text-xs text-red-600">
              {formatDate(report.worstTrade?.date)}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Performance Chart */}
      {report.monthlyPerformance && report.monthlyPerformance.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-4">
            Monthly Performance
          </h4>
          <div className="space-y-3">
            {report.monthlyPerformance.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {month.month}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {month.trades} trades
                  </span>
                  <span
                    className={`text-sm font-medium ${getMetricColor(
                      month.pnl
                    )}`}
                  >
                    ₹{month.pnl.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {month.successRate}% success
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sentiment and Risk Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {report.sentimentPerformance &&
          report.sentimentPerformance.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">
                Sentiment Performance
              </h4>
              <div className="space-y-3">
                {report.sentimentPerformance.map((sentiment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          sentiment.sentiment === "bullish"
                            ? "bg-green-500"
                            : sentiment.sentiment === "bearish"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      ></span>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {sentiment.sentiment}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {sentiment.trades} trades
                      </span>
                      <span className="text-sm text-gray-600">
                        {sentiment.successRate}%
                      </span>
                      <span
                        className={`text-sm font-medium ${getMetricColor(
                          sentiment.avgPnL
                        )}`}
                      >
                        ₹{sentiment.avgPnL.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {report.riskLevelPerformance &&
          report.riskLevelPerformance.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">
                Risk Level Performance
              </h4>
              <div className="space-y-3">
                {report.riskLevelPerformance.map((risk, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          risk.riskLevel === "low"
                            ? "bg-green-500"
                            : risk.riskLevel === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {risk.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {risk.trades} trades
                      </span>
                      <span className="text-sm text-gray-600">
                        {risk.successRate}%
                      </span>
                      <span
                        className={`text-sm font-medium ${getMetricColor(
                          risk.avgPnL
                        )}`}
                      >
                        ₹{risk.avgPnL.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Trade Status Distribution */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">
          Trade Status Distribution
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {(report.totalTrades ?? 0) -
                (report.profitableTrades ?? 0) -
                (report.lossMakingTrades ?? 0)}
            </p>
            <p className="text-xs text-gray-500">Active</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {report.profitableTrades ?? 0}
            </p>
            <p className="text-xs text-gray-500">Profitable</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {report.lossMakingTrades ?? 0}
            </p>
            <p className="text-xs text-gray-500">Loss Making</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">-</p>
            <p className="text-xs text-gray-500">Expired</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">-</p>
            <p className="text-xs text-gray-500">Target Hit</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">-</p>
            <p className="text-xs text-gray-500">Stop Loss</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <LineChart className="w-4 h-4" />
              <span>Detailed Charts</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <PieChart className="w-4 h-4" />
              <span>Custom Analysis</span>
            </button>
          </div>

          <div className="text-sm text-gray-500">
            Report generated for {dateRange} period
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiTradeReports;
