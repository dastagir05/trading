import React, { useState, useEffect } from "react";
import { RefreshCw, ChevronRight, ExternalLink, Newspaper } from "lucide-react";

import {
  marketIndices,
  topGainers,
  topLosers,
  stocksInNews,
  watchlistStocks,
  marketNews,
} from "../../data/dashboard";

function Dash() {
  const [activeCategory, setActiveCategory] = useState("Large");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      {/* Main Content */}
      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Market Indices */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Market Indices
            </h2>
            <RefreshCw className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {marketIndices.map((index, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-600">{index.icon}</div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      index.positive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {index.changePercent}
                  </div>
                </div>
                <div className="font-medium text-gray-900 text-sm mb-1">
                  {index.name}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {index.value}
                </div>
                <div
                  className={`text-sm font-medium ${
                    index.positive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {index.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Market Data */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Gainers */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Gainers
                  </h3>
                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                    See more
                  </button>
                </div>
                <div className="flex space-x-4 mt-4">
                  {["Large", "Mid", "Small"].map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeCategory === category
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topGainers.map((stock, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div>{stock.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {stock.symbol}
                          </div>
                          <div className="text-sm text-gray-600">
                            {stock.name}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {stock.price}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-medium">
                          {stock.change}
                        </div>
                        <div className="text-green-600 text-sm">
                          ({stock.changePercent})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Losers */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Most traded in MTF
                  </h3>
                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                    See more
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topLosers.map((stock, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div>{stock.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {stock.symbol}
                          </div>
                          <div className="text-sm text-gray-600">
                            {stock.name}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {stock.price}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium ${
                            stock.positive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stock.change}
                        </div>
                        <div
                          className={`text-sm ${
                            stock.positive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          ({stock.changePercent})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stocks in News */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Stocks in News
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                      News
                    </button>
                    <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                      See more
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stocksInNews.map((stock, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div>{stock.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {stock.symbol}
                          </div>
                          <div className="text-sm text-gray-600">
                            {stock.name}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {stock.price}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium ${
                            stock.positive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stock.change}
                        </div>
                        <div
                          className={`text-sm ${
                            stock.positive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          ({stock.changePercent})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Personal Data */}
          <div className="space-y-8">
            {/* Watchlist */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Watchlist
                  </h3>
                  <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {watchlistStocks.map((stock, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div>{stock.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {stock.symbol}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ₹{stock.ltp}
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            stock.change > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stock.change > 0 ? "+" : ""}
                          {stock.changePercent}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-green-600 hover:text-green-700 font-medium text-sm py-2">
                  View all watchlist
                </button>
              </div>
            </div>

            {/* Market News */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Newspaper className="w-5 h-5 mr-2" />
                    Market News
                  </h3>
                  <ExternalLink className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {marketNews.map((news, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            news.category === "Policy"
                              ? "bg-blue-100 text-blue-700"
                              : news.category === "Markets"
                              ? "bg-green-100 text-green-700"
                              : news.category === "Investment"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {news.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {news.time}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {news.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {news.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {news.source}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-green-600 hover:text-green-700 font-medium text-sm py-2">
                  View all news
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dash;
