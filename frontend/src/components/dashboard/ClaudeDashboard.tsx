import React, { useState, useEffect } from "react";
import { RefreshCw, ChevronRight, ExternalLink, Newspaper, TrendingUp, TrendingDown, Eye } from "lucide-react";
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
  const [indicesData, setIndicesData] = useState<FinalIndexData[]>([]);
  const [visibleIndexStart, setVisibleIndexStart] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const visibleIndices = indicesData.slice(
    visibleIndexStart,
    visibleIndexStart + 5
  );

  const handleNextSet = () => {
    setVisibleIndexStart((prev) =>
      prev + 5 >= indicesData.length ? 0 : prev + 5
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getGainersData().then((data) => setGainersData(data)),
        getLosersData().then((data) => setLosersData(data)),
        getIndexLtpData().then((data) => setIndicesData(data)),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getGainersData().then((data) => setGainersData(data));
    getLosersData().then((data) => setLosersData(data));
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
  const loserOptions: { label: string; key: keyof GainersData }[] = [
    { label: "Top Gainers", key: "TopGainers" },
    { label: "52 Week High (BSE)", key: "BSEHigh52Week" },
    { label: "52 Week High (NSE)", key: "NSEHigh52Week" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative ">
      {/* Header with refresh */}
      {/* <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Market Dashboard</h1>
              <p className="text-slate-600 text-sm">Real-time market data and insights</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <main className="max-w-9xl mx-auto  py-4 ">
        {/* Market Indices */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Market Indices</h2>
            </div>
            <button
              onClick={handleNextSet}
              className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 text-slate-700 font-medium"
            >
              <Eye className="w-4 h-4" />
              See More
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div
            className="flex overflow-x-auto gap-4 scroll-smooth pb-2"
            onWheel={(e) => {
              const container = e.currentTarget;
              container.scrollLeft += e.deltaY;
            }}
          >
            {visibleIndices.map((index, i) => (
              <div
                key={i}
                onClick={() => gotoChart(index.instrument_key)}
                className="min-w-[260px] bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-3 cursor-pointer border border-white/50 hover:border-emerald-200/50 hover:scale-[1.02] "
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl opacity-80 group-hover:scale-110 transition-transform duration-200">
                    {index.icon}
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      index.percent_change >= 0
                        ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200"
                        : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {index.percent_change >= 0 ? "+" : ""}
                    {index.percent_change.toFixed(2)}%
                  </div>
                </div>
                
                <div className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {index.name}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-slate-900">
                    ₹ {index.ltp.toLocaleString()}
                  </div>
                  
                  <div
                    className={`text-lg font-semibold flex items-center gap-1 ${
                      index.ltp - index.cp >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {index.ltp - index.cp >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {index.ltp - index.cp >= 0 ? "+" : ""}
                    {(index.ltp - index.cp).toFixed(2)}
                  </div>
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
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
              <div className="p-6 border-b border-slate-200/60">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Top Gainers</h3>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm px-4 py-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                    See more
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {gainerOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setGainerStatus(option.key)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        gainerStatus === option.key
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-md"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2  gap-3">
                  {gainersData?.[gainerStatus]?.map((stock, index) => (
                     <div
                     key={index}
                     className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50/50 to-purple-50/30 rounded-xl hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-200 cursor-pointer border border-slate-200/50 hover:border-purple-200 hover:shadow-md group"
                   >
                     <div className="flex items-center space-x-3">
                       <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                         {stock.icon || "📉"}
                       </div>
                       <div className="flex-1">
                         <div className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                         {stock.company_name || stock.symbol}
                         </div>
                         <div className="text-sm text-slate-600">
                         {stock.company || stock.exchange}
                         </div>
                         <div className="text-lg font-bold text-slate-900">
                         ₹{stock.price || stock.ltp}
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div
                         className={`font-semibold flex items-center gap-1 ${
                           stock.positive ? "text-emerald-600" : "text-red-600"
                         }`}
                       >
                         {stock.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                         {stock.net_change}
                       </div>
                       <div
                         className={`text-sm font-medium ${
                           stock.positive ? "text-emerald-600" : "text-red-600"
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

            {/* Top Losers */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
              <div className="p-6 border-b border-slate-200/60">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Top Losers</h3>
                  </div>
                  <button className="text-red-600 hover:text-red-700 font-semibold text-sm px-4 py-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    See more
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {loserOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setGainerStatus(option.key)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        gainerStatus === option.key
                          ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-md"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {losersData?.TopLosers.map((stock, index) => (
                    <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50/50 to-purple-50/30 rounded-xl hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-200 cursor-pointer border border-slate-200/50 hover:border-purple-200 hover:shadow-md group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                        {stock.icon || "📉"}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                        {stock.company_name || stock.symbol}
                        </div>
                        <div className="text-sm text-slate-600">
                        {stock.company || stock.exchange}
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                        ₹{stock.price || stock.ltp}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold flex items-center gap-1 ${
                          stock.positive ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {stock.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {stock.net_change}
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          stock.positive ? "text-emerald-600" : "text-red-600"
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

            {/* Stocks in News */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
              <div className="p-6 border-b border-slate-200/60">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Newspaper className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Stocks in News</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-semibold border border-purple-200">
                      News
                    </span>
                    <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm px-4 py-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
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
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50/50 to-purple-50/30 rounded-xl hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-200 cursor-pointer border border-slate-200/50 hover:border-purple-200 hover:shadow-md group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                          {stock.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                            {stock.symbol}
                          </div>
                          <div className="text-sm text-slate-600">
                            {stock.name}
                          </div>
                          <div className="text-lg font-bold text-slate-900">
                            {stock.price}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold flex items-center gap-1 ${
                            stock.positive ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {stock.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {stock.change}
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            stock.positive ? "text-emerald-600" : "text-red-600"
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
          <div className="space-y-8 ">
            {/* Watchlist */}
            {/* <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 "> */}
              <Watchlist watchlistName="defaultWatchlist" />
            

            {/* Market News */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
              <div className="p-6 border-b border-slate-200/60">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Newspaper className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Market News</h3>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {marketNews.map((news, index) => (
                    <div
                      key={index}
                      className="p-4 border border-slate-200/60 rounded-xl hover:border-orange-200 transition-all duration-200 cursor-pointer bg-gradient-to-r from-white/50 to-orange-50/30 hover:from-orange-50/50 hover:to-red-50/30 hover:shadow-md group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            news.category === "Policy"
                              ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200"
                              : news.category === "Markets"
                              ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200"
                              : news.category === "Investment"
                              ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200"
                              : "bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border border-orange-200"
                          }`}
                        >
                          {news.category}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {news.time}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-700 transition-colors">
                        {news.title}
                      </h4>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {news.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
                          {news.source}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 text-orange-600 hover:text-orange-700 font-semibold text-sm py-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all duration-200 hover:shadow-md">
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