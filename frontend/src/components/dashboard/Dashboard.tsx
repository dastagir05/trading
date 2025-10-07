import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ExternalLink,
  Newspaper,
  TrendingUp,
  TrendingDown,
  Eye,
} from "lucide-react";
import { stocksInNews, marketNews } from "../../data/dashboard";
import { useRouter } from "next/navigation";
import Watchlist from "./Watchlist";
import { getIndexLtpData, FinalIndexData } from "./MarketIndex";
import { TrendingStockItem, WeekHighLowItem } from "@/data/indiApi";
import { getGainersData, getLosersData } from "@/data/indiApi";
type StockDisplayItem = TrendingStockItem | WeekHighLowItem;

type GainersData = {
  TopGainers: StockDisplayItem[];
  BSEHigh52Week: StockDisplayItem[];
  NSEHigh52Week: StockDisplayItem[];
};
type LosersData = {
  TopLosers: StockDisplayItem[];
  BSELow52Week: StockDisplayItem[];
  NSELow52Week: StockDisplayItem[];
};

function MyDashboard() {
  const [gainersData, setGainersData] = useState<GainersData>({
    TopGainers: [],
    BSEHigh52Week: [],
    NSEHigh52Week: [],
  });

  const [losersData, setLosersData] = useState<LosersData>({
    TopLosers: [],
    BSELow52Week: [],
    NSELow52Week: [],
  });

  const [loserStatus, setLoserStatus] = useState<keyof LosersData>("TopLosers");
  const [gainerStatus, setGainerStatus] =
    useState<keyof GainersData>("TopGainers");
  const [indicesData, setIndicesData] = useState<FinalIndexData[]>([]);
  const [visibleIndexStart, setVisibleIndexStart] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640); // Example breakpoint for mobile
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const router = useRouter();

  const visibleIndices = isMobileView
    ? indicesData.slice(visibleIndexStart, visibleIndexStart + 2)
    : indicesData.slice(visibleIndexStart, visibleIndexStart + 5);

  const handleNextSet = () => {
    setVisibleIndexStart((prev) =>
      prev + 5 >= indicesData.length ? 0 : prev + 5
    );
  };

  useEffect(() => {
    getGainersData().then((data) =>
      setGainersData({
        TopGainers: data.TopGainers.map((stock) => ({
          ...stock,
          positive: parseFloat(stock.net_change) > 0,
        })),
        BSEHigh52Week: data.BSEHigh52Week.map((stock) => ({
          ...stock,
          positive: true,
        })),
        NSEHigh52Week: data.NSEHigh52Week.map((stock) => ({
          ...stock,
          positive: true,
        })),
      })
    );

    getLosersData().then((data) =>
      setLosersData({
        TopLosers: data.TopLosers.map((stock) => ({
          ...stock,
          positive: parseFloat(stock.net_change) > 0,
        })),
        BSELow52Week: data.BSELow52Week.map((stock) => ({
          ...stock,
          positive: false,
        })),
        NSELow52Week: data.NSELow52Week.map((stock) => ({
          ...stock,
          positive: false,
        })),
      })
    );
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
  const loserOptions: { label: string; key: keyof LosersData }[] = [
    { label: "Top Losers", key: "TopLosers" },
    { label: "52 Week Low (BSE)", key: "BSELow52Week" },
    { label: "52 Week Low (NSE)", key: "NSELow52Week" },
  ];

  function isTrendingStockItem(
    stock: StockDisplayItem
  ): stock is TrendingStockItem {
    return (stock as TrendingStockItem).company_name !== undefined;
  }

  const renderStockItem = (stock: StockDisplayItem) => {
    let name: string;
    let price: number;
    let netChange: number;
    let percentChange: string;
    let positive: boolean;

    if (isTrendingStockItem(stock)) {
      // stock is TrendingStockItem
      name = stock.company_name;
      price = Number(stock.price);
      netChange = parseFloat(stock.net_change);
      percentChange = stock.percent_change;
      positive = Number(stock.net_change) > 0 ? true : false;
    } else {
      // stock is WeekHighLowItem
      name = stock.company || "Unknown";
      price = stock.price || 0;
      netChange = 0;
      percentChange = "0%";
      positive = stock["52_week_high"] !== undefined ? true : false;
    }

    return (
      <div
        key={name + price}
        className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50/50 to-purple-50/30 rounded-lg sm:rounded-xl hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-200 cursor-pointer border border-slate-200/50 hover:border-purple-200 hover:shadow-md group"
      >
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="text-xl sm:text-2xl flex-shrink-0">
            {positive ? <TrendingUp /> : <TrendingDown />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-purple-700 transition-colors truncate">
              {name}
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900">
              ₹{price}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <div
            className={`font-semibold text-sm sm:text-base flex items-center gap-1 justify-end ${
              positive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {positive ? (
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            {netChange}
          </div>
          <div
            className={`text-xs sm:text-sm font-medium ${
              positive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            ({percentChange})
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Main Content */}
      <main className="mx-auto sm:px-4 lg:px-8 py-3 sm:py-4">
        {/* Market Indices */}
        <div className="mb-2 sm:mb-8">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="ml-10 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900">
                Market Indices
              </h2>
            </div>
            <button
              onClick={handleNextSet}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 text-slate-700 text-xs sm:text-sm font-medium"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">See More</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="flex overflow-x-auto gap-3 sm:gap-4 scroll-smooth pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            {visibleIndices.map((index, i) => (
              <div
                key={i}
                onClick={() => gotoChart(index.instrument_key)}
                className="min-w-[150px] sm:min-w-[260px] bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-3 sm:p-4 cursor-pointer border border-white/50 hover:border-emerald-200/50 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-2xl sm:text-3xl opacity-80">
                    {index.icon}
                  </div>
                  <div
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold ${
                      index.percent_change >= 0
                        ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200"
                        : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {index.percent_change >= 0 ? "+" : ""}
                    {index.percent_change.toFixed(2)}%
                  </div>
                </div>

                <div className="text-base sm:text-xl font-bold text-slate-900 mb-2">
                  {index.name}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg sm:text-2xl font-bold text-slate-900">
                    ₹{index.ltp.toLocaleString()}
                  </div>

                  <div
                    className={`text-sm sm:text-lg font-semibold flex items-center gap-1 ${
                      index.ltp - index.cp >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {index.ltp - index.cp >= 0 ? (
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    {index.ltp - index.cp >= 0 ? "+" : ""}
                    {(index.ltp - index.cp).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Market Data */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Top Gainers */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/50">
              <div className="p-4 sm:p-6 border-b border-slate-200/60">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      Top Gainers
                    </h3>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors self-start sm:self-auto">
                    See more
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {gainerOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setGainerStatus(option.key)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
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

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3">
                  {gainersData?.[gainerStatus]?.map(renderStockItem)}
                </div>
              </div>
            </div>

            {/* Top Losers */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/50">
              <div className="p-4 sm:p-6 border-b border-slate-200/60">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      Top Losers
                    </h3>
                  </div>
                  <button className="text-red-600 hover:text-red-700 font-semibold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors self-start sm:self-auto">
                    See more
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {loserOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setLoserStatus(option.key)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                        loserStatus === option.key
                          ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-md"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3">
                  {losersData?.[loserStatus]?.map(renderStockItem)}
                </div>
              </div>
            </div>

            {/* Stocks in News */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/50">
              <div className="p-4 sm:p-6 border-b border-slate-200/60">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Newspaper className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      Stocks in News
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold border border-purple-200">
                      News
                    </span>
                    <button className="text-purple-600 hover:text-purple-700 font-semibold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                      See more
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {stocksInNews.map((stock, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50/50 to-purple-50/30 rounded-lg sm:rounded-xl hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-200 cursor-pointer border border-slate-200/50 hover:border-purple-200 hover:shadow-md group"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="text-xl sm:text-2xl flex-shrink-0">
                          {stock.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                            {stock.symbol}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-600 truncate">
                            {stock.name}
                          </div>
                          <div className="text-base sm:text-lg font-bold text-slate-900">
                            {stock.price}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div
                          className={`font-semibold text-sm sm:text-base flex items-center gap-1 justify-end ${
                            stock.positive ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {stock.positive ? (
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                          {stock.change}
                        </div>
                        <div
                          className={`text-xs sm:text-sm font-medium ${
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

          {/* Right Column - Market News */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Watchlist */}
            <Watchlist watchlistName="defaultWatchlist" />
            {/* Market News */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/50">
              <div className="p-4 sm:p-6 border-b border-slate-200/60">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Newspaper className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      Market News
                    </h3>
                  </div>
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {marketNews.map((news, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 border border-slate-200/60 rounded-lg sm:rounded-xl hover:border-orange-200 transition-all duration-200 cursor-pointer bg-gradient-to-r from-white/50 to-orange-50/30 hover:from-orange-50/50 hover:to-red-50/30 hover:shadow-md group"
                    >
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <span
                          className={`text-xs px-2 sm:px-3 py-1 rounded-full font-semibold ${
                            news.category === "Policy"
                              ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200"
                              : news.category === "Markets"
                              ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200"
                              : "bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border border-orange-200"
                          }`}
                        >
                          {news.category}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {news.time}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm sm:text-base text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-700 transition-colors">
                        {news.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3 line-clamp-2">
                        {news.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
                          {news.source}
                        </span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 sm:mt-6 text-orange-600 hover:text-orange-700 font-semibold text-xs sm:text-sm py-2 sm:py-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg sm:rounded-xl hover:from-orange-100 hover:to-red-100 transition-all duration-200 hover:shadow-md">
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
