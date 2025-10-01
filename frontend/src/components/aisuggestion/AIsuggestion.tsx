"use client";
import React, { useState, useEffect } from "react";
import { Brain, AlertTriangle, RefreshCw, Play, Pause } from "lucide-react";
import AITradeCard from "./AiTradeCard";

export interface TradeSuggestion {
  id: string;
  title: string;
  sentiment: "bullish" | "bearish" | "neutral";
  setup: {
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
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  timestamp: string;
}

const TradingCards: React.FC = () => {
  const [suggestions, setSuggestions] = useState<TradeSuggestion[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null
  );
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refreshSuggestions = async () => {
    setIsLoading(true);
    setTimeout(() => {
      // setSuggestions([...mockSuggestions]);
      setIsLoading(false);
    }, 2000);
  };

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshSuggestions();
    }, 300000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                AI Trading Suggestions
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  Powered by Gemini
                </span>
              </h3>
              <p className="text-gray-600 text-sm">
                Smart trading recommendations based on market analysis
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {autoRefresh ? (
                <Play className="w-4 h-4 mr-1" />
              ) : (
                <Pause className="w-4 h-4 mr-1" />
              )}
              {autoRefresh ? "Live" : "Paused"}
            </button>
            <button
              onClick={refreshSuggestions}
              disabled={isLoading}
              className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div>
        <AITradeCard />
      </div>
      {/* Disclaimer */}
      <div className="p-6 space-y-6">
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> These are AI-generated suggestions
              based on technical analysis and market data. Please conduct your
              own research and consider your risk tolerance before making any
              trading decisions. Past performance does not guarantee future
              results.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingCards;
