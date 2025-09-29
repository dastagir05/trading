import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../SocketContext";
import { ActiveTrade } from "../aiReport/AiTradeMonitor";
import PurchaseButton from "../chart/PurchaseButton";
import { useRouter } from "next/navigation";

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
  // send whole moncksuggdata in para so we can map
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [mockSuggestions, setMockSuggestions] = useState<TradeSugg[]>();
  const [suggestedTrades, setSuggestedTrades] = useState<ActiveTrade[]>([]);

  const { trades } = useSocket();
  const router = useRouter();

  useEffect(() => {
    const suggested = trades.filter((t) => t.status === "suggested");
    setSuggestedTrades(suggested);
  }, [trades]); // runs only when trades change

  // Map trades by aiTradeId for easy lookup
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

  return (
    <div className="p-6 space-y-6">
      {/* Recommended Strategies */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockSuggestions &&
              mockSuggestions.map((strategy) => (
                <div
                  key={strategy.aiTradeId}
                  className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                    selectedStrategy === strategy.aiTradeId
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedStrategy(strategy.aiTradeId)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">
                      {strategy.title}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStrategyTypeColor(
                        strategy.sentiment
                      )}`}
                    >
                      {strategy.sentiment.charAt(0).toUpperCase() +
                        strategy.sentiment.slice(1)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{strategy.logic}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Price:</span>
                      <span className="font-medium text-gray-900">
                        ₹{strategy.setup.currentPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Strategy:</span>
                      <span className="font-medium text-blue-600">
                        {strategy.setup.strategy}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Strike/Entry:</span>
                      <span className="font-medium text-gray-900">
                        {strategy.setup.strike}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expiry:</span>
                      <span className="font-medium text-gray-900">
                        {strategy.setup.expiry}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Entry:</span>
                      <span className="font-medium text-blue-400">
                        {strategy.tradePlan.entry}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-medium text-green-600">
                        {strategy.tradePlan.target}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stop Loss:</span>
                      <span className="font-medium text-red-600">
                        {strategy.tradePlan.stopLoss}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Time Frame:</span>
                      <span className="font-medium text-gray-900">
                        {strategy.tradePlan.timeFrame}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-medium text-blue-600">
                        {strategy.confidence}%
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Risk Level:</span>
                      <span
                        className={`font-medium ${getRiskLevelColor(
                          strategy.riskLevel
                        )}`}
                      >
                        {strategy.riskLevel.charAt(0).toUpperCase() +
                          strategy.riskLevel.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1 flex ">
                      <div className="inline-block text-sm">
                        CurrentPrice:{" "}
                        {suggestedTrades.find(
                          (t) => t.aiTradeId === strategy.aiTradeId
                        )?.currentPrice ?? strategy.setup.currentPrice}
                      </div>

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
                      <button
                        onClick={() =>
                          gotoChart({
                            instrumentKey: strategy.setup.instrument_key,
                            name: strategy.setup.strike,
                            expiry: strategy.setup.expiry,
                            lotSize: strategy.quantity?.toString() || "",
                          })
                        }
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md transform hover:scale-105"
                      >
                        Go to Chart
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
