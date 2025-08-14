import React, { useState, useEffect } from "react";
import { RefreshCw, ChevronRight, ExternalLink, Newspaper } from "lucide-react";
import { stocksInNews, marketNews } from "../../data/dashboard";
import { useRouter } from "next/navigation";
import Watchlist from "./Watchlist";
import { getIndexLtpData, FinalIndexData } from "./MarketIndex";

import {
  getGainersData,
  getLosersData,
} from "@/data/indiApi";

type GainersData = {
  TopGainers: Array<any>;
  BSEHigh52Week: Array<any>;
  NSEHigh52Week: Array<any>;
};
type LosersData = {
  TopLosers: Array<any>;
  BSELow52Week: Array<any>;
  NSELow52Week: Array<any>;
};
function MyDashboard() {
  const [gainersData, setGainersData] = useState<GainersData>();
  const [losersData, setLosersData] = useState<LosersData>();
  const [gainerStatus, setGainerStatus] =
    useState<keyof GainersData>("TopGainers");
  // const [NSEActiveData, setNSEActiveData] = useState<Array<any>>();
  const [indicesData, setIndicesData] = useState<FinalIndexData[]>([]);
  const [visibleIndexStart, setVisibleIndexStart] = useState(0);
  const router = useRouter();

  const visibleIndices = indicesData.slice(
    visibleIndexStart,
    visibleIndexStart + 6
  );

  const handleNextSet = () => {
    setVisibleIndexStart((prev) =>
      prev + 6 >= indicesData.length ? 0 : prev + 6
    );
  };

  useEffect(() => {
    getGainersData().then((data) => setGainersData(data));
    getLosersData().then((data) => setLosersData(data));
    // getNSEActiveData().then(({ NSEMostActive }) =>
    //   setNSEActiveData(NSEMostActive)
    // );
    getIndexLtpData().then((data) => setIndicesData(data));
  }, []);

  const gotoChart = (instrumentKey: string) => {
    router.push(`/chart?instrumentKey=${instrumentKey}`);
  };

  const gainerOptions: { label: string; key: keyof GainersData }[] = [
    { label: "Top Gainers", key: "TopGainers" },
    { label: "52 Week High (BSE)", key: "BSEHigh52Week" },
    { label: "52 Week High (NSE)", key: "NSEHigh52Week" },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Market Indices */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Market Indices
            </h2>
            <div
              className="text-black flex items-center cursor-pointer"
              onClick={handleNextSet}
            >
              seemore
              <ChevronRight className="w-5 h-4 text-black cursor-pointer hover:text-gray-600" />
            </div>
          </div>

          <div
            className="flex overflow-x-auto gap-4 scroll-smooth"
            onWheel={(e) => {
              const container = e.currentTarget;
              container.scrollLeft += e.deltaY;
            }}
          >
            {visibleIndices.map((index, i) => (
              <div
                key={i}
                onClick={() => gotoChart(index.instrument_key)}
                className="min-w-[250px] bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-600"> {index.icon}</div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      index.percent_change >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {index.percent_change >= 0 ? "+" : ""}
                    {index.percent_change.toFixed(2)}%
                  </div>
                </div>
                <div className=" text-lg font-semibold text-gray-900  mb-1 ">
                  {index.name}
                </div>
                <div className="text-sm font-medium text-gray-900 ">
                  ₹ {index.ltp}
                </div>

                <div
                  className={`text-sm font-medium ${
                    index.ltp - index.cp >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {index.ltp - index.cp >= 0 ? "+" : ""}
                  {(index.ltp - index.cp).toFixed(2)}
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
                  {gainerOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setGainerStatus(option.key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        gainerStatus === option.key
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gainersData?.[gainerStatus]?.map((stock, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div>{stock.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {stock.company_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {stock.company}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {stock.price}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-medium">
                          {stock.net_change}
                        </div>
                        <div className="text-green-600 text-sm">
                          ({stock.percent_change})
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
                    Top Losers
                  </h3>
                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                    See more
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {losersData?.TopLosers.map((stock, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div>{stock.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {stock.company_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {stock.company}
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
                          {stock.net_change}
                        </div>
                        <div
                          className={`text-sm ${
                            stock.positive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          ({stock.percent_change})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* NSE Active */}
            

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
            <Watchlist watchlistName="defaultWatchlist" />
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

export default MyDashboard;
