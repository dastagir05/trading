import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../SocketContext";
import { ActiveTrade } from "../aiReport/AiTradeMonitor";
import PurchaseButton from "../chart/PurchaseButton";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Target,
  Shield,
  BarChart3,
} from "lucide-react";

export interface TradeSugg {
  aiTradeId: string;
  title: string;
  sentiment: "bullish" | "bearish" | "neutral";
  setup: {
    instrument_key: string;
    currentPrice: number;
    strategy: string;
    strike: string;
    expiry: string;
  };
  tradePlan: {
    entry: string;
    target: string;
    stopLoss: string;
    timeFrame: string;
  };
  logic: string;
  quantity?: number;
  suggestedAt?: Date | string;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  timestamp: string;
}

type ChartParams = {
  instrumentKey: string;
  name: string;
  expiry: string;
  lotSize: string;
};

const AITradeCard = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [mockSuggestions, setMockSuggestions] = useState<TradeSugg[]>();
  const [suggestedTrades, setSuggestedTrades] = useState<ActiveTrade[]>([]);

  const { trades } = useSocket();
  const router = useRouter();

  useEffect(() => {
    const suggested = trades.filter((t) => t.status === "suggested");
    setSuggestedTrades(suggested);
  }, [trades]);

  const tradePriceMap = new Map(
    suggestedTrades.map((t) => [t.aiTradeId, t.currentPrice])
  );

  const gotoChart = (params: ChartParams) => {
    const query = new URLSearchParams(params).toString();
    router.push(`/chart?${query}`);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai-trades`
        );
        setMockSuggestions(res.data.data);
        console.log("aiss", res.data.data.length);
        if (res.data.data.length === 0) {
          const active = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai-trades?status=active`
          );
          setMockSuggestions(active.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch AI suggestions:", error);
      }
    };
    fetchSuggestions();
  }, []);

  const getStrategyTypeColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "bg-green-100 text-green-700";
      case "bearish":
        return "bg-red-100 text-red-700";
      case "neutral":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "bearish":
        return <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <Activity className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (!mockSuggestions || mockSuggestions.length === 0) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-12 text-center">
          <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No AI Suggestions Available
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Check back later for AI-generated trade suggestions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Strategies Grid */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {mockSuggestions.map((strategy) => (
              <div
                key={strategy.aiTradeId}
                className={`border rounded-lg p-4 sm:p-5 lg:p-6 cursor-pointer transition-all hover:shadow-md ${
                  selectedStrategy === strategy.aiTradeId
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedStrategy(strategy.aiTradeId)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 flex-1 line-clamp-2">
                    {strategy.title}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap flex items-center gap-1 ${getStrategyTypeColor(
                      strategy.sentiment
                    )}`}
                  >
                    {getSentimentIcon(strategy.sentiment)}
                    <span className="hidden sm:inline">
                      {strategy.sentiment.charAt(0).toUpperCase() +
                        strategy.sentiment.slice(1)}
                    </span>
                  </span>
                </div>

                {/* Logic */}
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                  {strategy.logic}
                </p>

                {/* Details Grid */}
                <div className="space-y-2 sm:space-y-3">
                  {/* Current Price - Highlighted */}
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-600 font-medium">
                        Current Price:
                      </span>
                      <span className="font-bold text-base sm:text-lg text-gray-900">
                        ₹{strategy.setup.currentPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Strategy */}
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Strategy:</span>
                    <span className="font-medium text-blue-600 text-right">
                      {strategy.setup.strategy}
                    </span>
                  </div>

                  {/* Strike/Entry */}
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Strike:</span>
                    <span className="font-medium text-gray-900 text-right truncate ml-2">
                      {strategy.setup.strike}
                    </span>
                  </div>

                  {/* Expiry */}
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expiry:
                    </span>
                    <span className="font-medium text-gray-900">
                      {new Date(strategy.setup.expiry).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  {/* Trade Plan Section */}
                  <div className="pt-2 sm:pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-600">Entry:</span>
                      <span className="font-semibold text-blue-500">
                        {strategy.tradePlan.entry}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Target className="w-3 h-3 text-green-600" />
                        Target:
                      </span>
                      <span className="font-semibold text-green-600">
                        {strategy.tradePlan.target}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-red-600" />
                        Stop Loss:
                      </span>
                      <span className="font-semibold text-red-600">
                        {strategy.tradePlan.stopLoss}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-600">Time Frame:</span>
                      <span className="font-medium text-gray-900">
                        {strategy.tradePlan.timeFrame}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Section */}
                  <div className="pt-2 sm:pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-600">
                          Confidence:
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2 w-16 sm:w-20">
                          <div
                            className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all"
                            style={{ width: `${strategy.confidence}%` }}
                          />
                        </div>
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-blue-600">
                        {strategy.confidence}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-600">Risk Level:</span>
                      <span
                        className={`font-semibold ${getRiskLevelColor(
                          strategy.riskLevel
                        )}`}
                      >
                        {strategy.riskLevel.charAt(0).toUpperCase() +
                          strategy.riskLevel.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* Live Price */}
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-blue-700 font-medium">
                        Live Price:
                      </span>
                      <span className="font-bold text-blue-900">
                        ₹
                        {(
                          suggestedTrades.find(
                            (t) => t.aiTradeId === strategy.aiTradeId
                          )?.currentPrice ?? strategy.setup.currentPrice
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                      <PurchaseButton
                        Symbol={strategy.setup.strike}
                        InstrumentKey={strategy.setup.instrument_key}
                        Expiry={
                          strategy.setup.expiry
                            ? new Date(
                                strategy.setup.expiry.toString().split("T")[0]
                              )
                            : undefined
                        }
                        lotSize={strategy.quantity || undefined}
                        FromSuggestion={true}
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        gotoChart({
                          instrumentKey: strategy.setup.instrument_key,
                          name: strategy.setup.strike,
                          expiry: strategy.setup.expiry,
                          lotSize: strategy.quantity?.toString() || "",
                        });
                      }}
                      className="w-40 h-10 lg:flex-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>View Chart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITradeCard;
