"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronDown,
  LineChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Filter,
  Calendar,
  Info,
  RefreshCw,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type OptionGreeks = {
  vega: number;
  theta: number;
  gamma: number;
  delta: number;
  iv: number;
  pop: number;
};

type MarketData = {
  ltp: number;
  volume: number;
  oi: number;
  close_price: number;
  bid_price: number;
  bid_qty: number;
  ask_price: number;
  ask_qty: number;
  prev_oi: number;
};

type OptionContract = {
  instrument_key: string;
  market_data: MarketData;
  option_greeks: OptionGreeks;
};

type OptionItem = {
  expiry: string;
  pcr: number;
  strike_price: number;
  underlying_key: string;
  underlying_spot_price: number;
  call_options: OptionContract;
  put_options: OptionContract;
};

type ChartProp = {
  instrument_key: string;
  trading_symbol: string;
  expiry: string;
};

type ViewMode = "small" | "medium" | "large" | "mobile" | string;

const popularIndices = [
  {
    name: "Nifty 50",
    trading_symbol: "NIFTY 50",
    exchange: "NSE_INDEX",
    instrument_key: "NSE_INDEX|Nifty 50",
  },
  {
    name: "Nifty Bank",
    trading_symbol: "NIFTY BANK",
    exchange: "NSE_INDEX",
    instrument_key: "NSE_INDEX|Nifty Bank",
  },
  {
    name: "Nifty Fin Service",
    trading_symbol: "NIFTY FIN SERVICE",
    exchange: "NSE_INDEX",
    instrument_key: "NSE_INDEX|Nifty Fin Service",
  },
];

const OptionsPage = () => {
  const [data, setData] = useState<OptionItem[]>([]);
  const [availableExpiries, setAvailableExpiries] = useState<string[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("medium");
  const [atmStrike, setAtmStrike] = useState<number>(0);
  const [selectedSymbol, setSelectedSymbol] =
    useState<string>("NSE_INDEX|Nifty 50");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbol = searchParams.get("instrumentKey");

  useEffect(() => {
    setSelectedSymbol(symbol || selectedSymbol);
  }, [symbol, selectedSymbol]);
  useEffect(() => {
    if (window.innerWidth < 640) {
      setViewMode("mobile");
    }
  }, []);

  const fetchExpiryDates = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/option/contract`,
        {
          params: { instrument_key: selectedSymbol },
        }
      );
      const expirations = res.data.expirations || [];
      expirations.sort(
        (a: string, b: string) => new Date(a).getTime() - new Date(b).getTime()
      );

      setAvailableExpiries(expirations);
      if (expirations.length > 0) {
        const firstExpiry = expirations[0];
        setSelectedExpiry(firstExpiry);
        await fetchOptionData(selectedSymbol, firstExpiry); // <-- pass manually
      }
    } catch (error) {
      console.error("Error fetching expiry dates:", error);
    }
  };

  const fetchOptionData = async (
    symbolParam = selectedSymbol,
    expiryParam = selectedExpiry
  ) => {
    if (!expiryParam) return;
    if (symbolParam.toLowerCase().startsWith("nifty")) {
      setSelectedSymbol("NSE_INDEX|" + selectedSymbol);
    }

    try {
      setRefreshing(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/option`,
        {
          params: {
            instrumentKey: symbolParam,
            expiry_date: expiryParam,
          },
        }
      );
      const rawData: OptionItem[] = res.data.data;
      setData(rawData);
      if (rawData.length > 0) {
        const spotPrice = rawData[0].underlying_spot_price;
        const closest = rawData.reduce((prev, curr) =>
          Math.abs(curr.strike_price - spotPrice) <
          Math.abs(prev.strike_price - spotPrice)
            ? curr
            : prev
        );
        setAtmStrike(closest.strike_price);
      }
    } catch (error) {
      console.error("Error fetching option data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getSelectedSymbolName = () => {
    const selected = popularIndices.find(
      (index) => index.instrument_key === selectedSymbol
    );
    return selected ? selected.name : "Select Symbol";
  };

  useEffect(() => {
    fetchExpiryDates();
  }, [symbol, selectedSymbol]);

  useEffect(() => {
    if (selectedExpiry) {
      fetchOptionData();
    }
  }, [symbol, selectedExpiry, selectedSymbol]);

  useEffect(() => {
    if (selectedExpiry) {
      const interval = setInterval(fetchOptionData, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedExpiry, selectedSymbol]);

  const getFilteredData = () => {
    if (viewMode === "small" || viewMode === "mobile") {
      const atmIndex = data.findIndex(
        (item) => item.strike_price === atmStrike
      );
      const start = Math.max(0, atmIndex - 10);
      const end = Math.min(data.length, atmIndex + 11);
      return data.slice(start, end);
    } else if (viewMode === "medium") {
      const atmIndex = data.findIndex(
        (item) => item.strike_price === atmStrike
      );
      const start = Math.max(0, atmIndex - 10);
      const end = Math.min(data.length, atmIndex + 11);
      return data.slice(start, end);
    }
    return data;
  };

  const getOIChange = (current: number, previous: number) => {
    return current - previous;
  };

  const isATM = (strike: number) => Math.abs(strike - atmStrike) <= 25;
  const isCallITM = (strike: number) => strike <= atmStrike;
  const isPutITM = (strike: number) => strike > atmStrike;

  const handleShowGraph = ({
    instrument_key,
    trading_symbol,
    expiry,
  }: ChartProp) => {
    let lotSize = 35;
    if (trading_symbol.includes("NSE_INDEX|Nifty 50")) {
      lotSize = 75;
    }
    router.push(
      `/chart?instrumentKey=${instrument_key}&name=${trading_symbol}&expiry=${expiry}&lotSize=${lotSize}`
    );
  };

  const handleRefresh = () => {
    fetchOptionData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
            <div className="animate-pulse space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="h-8 bg-gray-200 rounded w-2/3 sm:w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded w-full sm:w-1/4"></div>
              </div>
              <div className="h-64 sm:h-96 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center max-w-md mx-auto">
          <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            No option data available for the selected parameters.
          </p>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const spotPrice = data[0]?.underlying_spot_price || 24585.05;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            {/* Top Row - Title and Live Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Option Chain
                </h1>
                <div className="flex items-center px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-1 sm:mr-2"></div>
                  Live
                </div>
              </div>

              {/* Refresh Button - Desktop */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="hidden sm:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
            <div className="lg:flex lg:items-center lg:justify-between lg:space-y-0 space-y-4">
              {/* Symbol Selector and Price */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors duration-200 font-medium text-sm sm:text-base w-full sm:w-auto justify-between sm:justify-start"
                  >
                    <span>{getSelectedSymbolName()}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full mt-1 w-full sm:w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden">
                      {popularIndices.map((index) => (
                        <button
                          key={index.instrument_key}
                          onClick={() => {
                            setSelectedSymbol(index.instrument_key);
                            setDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base ${
                            selectedSymbol === index.instrument_key
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {index.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    ₹{spotPrice.toLocaleString()}
                  </span>
                  <span className="flex items-center px-2 sm:px-3 py-1 bg-green-50 text-green-700 rounded text-xs sm:text-sm font-medium">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    +0.91%
                  </span>
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* View Mode Toggle */}
                <div className="hidden lg:flex bg-gray-100 rounded-md p-1 w-full sm:w-auto">
                  {["small", "medium", "large"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded transition-all ${
                        viewMode === mode
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Expiry Selector */}
                <div className="relative w-full sm:w-auto">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-8 py-2 text-xs sm:text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                    value={selectedExpiry}
                    onChange={(e) => setSelectedExpiry(e.target.value)}
                  >
                    {availableExpiries.map((exp) => (
                      <option key={exp} value={exp}>
                        {new Date(exp).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Refresh Button - Mobile */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 font-medium text-sm"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Options Chain Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-200">
                  <th
                    colSpan={
                      viewMode === "mobile"
                        ? 1
                        : viewMode === "small"
                        ? 3
                        : viewMode === "medium"
                        ? 5
                        : 8
                    }
                    className="text-center py-3 sm:py-4 text-sm sm:text-lg font-semibold text-green-700 bg-green-50 border-r border-gray-200"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      CALLS
                    </div>
                  </th>

                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 bg-gray-50 border-x border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">STRIKE</span>
                    </div>
                  </th>

                  <th
                    colSpan={
                      viewMode === "mobile"
                        ? 1
                        : viewMode === "small"
                        ? 3
                        : viewMode === "medium"
                        ? 5
                        : 8
                    }
                    className="text-center py-3 sm:py-4 text-sm sm:text-lg font-semibold text-red-700 bg-red-50 border-l border-gray-200"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      PUTS
                    </div>
                  </th>
                </tr>

                <tr className="bg-gray-50 text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  {viewMode === "large" && (
                    <>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-right border-r border-gray-200">
                        Bid
                      </th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-right border-r border-gray-200">
                        Ask
                      </th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-right border-r border-gray-200">
                        Volume
                      </th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-right border-r border-gray-200">
                        IV %
                      </th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-right border-r border-gray-200">
                        Delta
                      </th>
                    </>
                  )}
                  {viewMode === "medium" && (
                    <>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-right border-r border-gray-200">
                        Volume
                      </th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-right border-r border-gray-200">
                        IV %
                      </th>
                    </>
                  )}
                  {viewMode !== "mobile" && (
                    <>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-right border-r border-gray-200 whitespace-nowrap">
                        OI Change
                      </th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-right border-r-2 border-gray-300 whitespace-nowrap">
                        Open Int
                      </th>
                    </>
                  )}
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-right border-r-2 border-gray-300">
                    LTP
                  </th>

                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center bg-gray-100 border-x-2 border-gray-300 font-semibold">
                    Price
                  </th>

                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-left border-l-2 border-gray-300">
                    LTP
                  </th>
                  {viewMode !== "mobile" && (
                    <>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-left border-l border-gray-200 whitespace-nowrap">
                        Open Int
                      </th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-left border-l border-gray-200 whitespace-nowrap">
                        OI Change
                      </th>
                    </>
                  )}
                  {viewMode === "medium" && (
                    <>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-left border-l border-gray-200">
                        IV %
                      </th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-left border-l border-gray-200">
                        Volume
                      </th>
                    </>
                  )}
                  {viewMode === "large" && (
                    <>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-left border-l border-gray-200">
                        Delta
                      </th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-left border-l border-gray-200">
                        IV %
                      </th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-left border-l border-gray-200">
                        Volume
                      </th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-left border-l border-gray-200">
                        Ask
                      </th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-left border-l border-gray-200">
                        Bid
                      </th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item, idx) => {
                  const callOIChange = getOIChange(
                    item.call_options.market_data.oi,
                    item.call_options.market_data.prev_oi
                  );
                  const putOIChange = getOIChange(
                    item.put_options.market_data.oi,
                    item.put_options.market_data.prev_oi
                  );
                  const isATMStrike = isATM(item.strike_price);
                  const callITM = isCallITM(item.strike_price);
                  const putITM = isPutITM(item.strike_price);

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-gray-50 transition-colors ${
                        isATMStrike
                          ? "bg-blue-50 border-l-2 border-r-2 border-blue-200"
                          : ""
                      }`}
                    >
                      {viewMode === "large" && (
                        <>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm border-r border-gray-100 ${
                              callITM ? "bg-green-25" : ""
                            }`}
                          >
                            <span className="font-medium text-gray-900">
                              ₹
                              {item.call_options.market_data.bid_price.toFixed(
                                2
                              )}
                            </span>
                          </td>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm border-r border-gray-100 ${
                              callITM ? "bg-green-25" : ""
                            }`}
                          >
                            <span className="font-medium text-gray-900">
                              ₹
                              {item.call_options.market_data.ask_price.toFixed(
                                2
                              )}
                            </span>
                          </td>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm border-r border-gray-100 ${
                              callITM ? "bg-green-25" : ""
                            }`}
                          >
                            <span className="font-mono text-gray-900">
                              {item.call_options.market_data.volume.toLocaleString()}
                            </span>
                          </td>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm border-r border-gray-100 ${
                              callITM ? "bg-green-25" : ""
                            }`}
                          >
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                              {item.call_options.option_greeks.iv.toFixed(1)}%
                            </span>
                          </td>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm border-r border-gray-100 ${
                              callITM ? "bg-green-25" : ""
                            }`}
                          >
                            <span className="font-mono text-gray-900">
                              {item.call_options.option_greeks.delta.toFixed(2)}
                            </span>
                          </td>
                        </>
                      )}
                      {viewMode === "medium" && (
                        <>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm border-r border-gray-100 ${
                              callITM ? "bg-green-25" : ""
                            }`}
                          >
                            <span className="font-mono text-gray-900">
                              {item.call_options.market_data.volume.toLocaleString()}
                            </span>
                          </td>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm border-r border-gray-100 ${
                              callITM ? "bg-green-25" : ""
                            }`}
                          >
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                              {item.call_options.option_greeks.iv.toFixed(1)}%
                            </span>
                          </td>
                        </>
                      )}
                      {viewMode !== "mobile" && (
                        <>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-right border-r border-gray-100 ${
                              callITM ? "bg-green-25" : ""
                            }`}
                          >
                            <span
                              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium whitespace-nowrap ${
                                callOIChange > 0
                                  ? "bg-green-100 text-green-800"
                                  : callOIChange < 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {callOIChange > 0 ? "+" : ""}
                              {callOIChange.toLocaleString()}
                            </span>
                          </td>

                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-right border-r border-gray-100 ${
                              callITM ? "bg-green-25" : ""
                            }`}
                          >
                            <span className="font-mono font-semibold text-gray-900 text-xs sm:text-sm">
                              {item.call_options.market_data.oi.toLocaleString()}
                            </span>
                          </td>
                        </>
                      )}
                      <td
                        className={`px-2 sm:px-3 py-2 sm:py-3 text-right border-r-2 border-gray-300 ${
                          callITM ? "bg-green-25" : ""
                        }`}
                      >
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button
                            onClick={() =>
                              handleShowGraph({
                                instrument_key:
                                  item.call_options.instrument_key,
                                trading_symbol: item.underlying_key,
                                expiry: item.expiry,
                              })
                            }
                            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                          >
                            <LineChart
                              size={12}
                              className="sm:w-3.5 sm:h-3.5"
                            />
                          </button>
                          <span className="font-semibold text-green-600 text-lg sm:text-lg">
                            ₹{item.call_options.market_data.ltp.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      <td
                        className={`px-3 sm:px-6 py-2 sm:py-3 text-center font-bold border-x-2 border-gray-300 ${
                          isATMStrike
                            ? "bg-blue-100 text-blue-900"
                            : "bg-gray-50 text-gray-900"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-sm sm:text-lg whitespace-nowrap">
                            {item.strike_price.toLocaleString()}
                          </span>
                          {isATMStrike && (
                            <span className="text-xs text-blue-700 font-medium bg-white px-1.5 sm:px-2 py-0.5 rounded">
                              ATM
                            </span>
                          )}
                        </div>
                      </td>

                      <td
                        className={`px-2 sm:px-3 py-2 sm:py-3 text-left border-l-2 border-gray-300 ${
                          putITM ? "bg-red-25" : ""
                        }`}
                      >
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="font-semibold text-red-600 text-lg sm:text-lg">
                            ₹{item.put_options.market_data.ltp.toFixed(2)}
                          </span>
                          <button
                            onClick={() =>
                              handleShowGraph({
                                instrument_key: item.put_options.instrument_key,
                                trading_symbol: item.underlying_key,
                                expiry: item.expiry,
                              })
                            }
                            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                          >
                            <LineChart
                              size={12}
                              className="sm:w-3.5 sm:h-3.5"
                            />
                          </button>
                        </div>
                      </td>

                      {viewMode !== "mobile" && (
                        <>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-left border-l border-gray-100 ${
                              putITM ? "bg-red-25" : ""
                            }`}
                          >
                            <span className="font-mono font-semibold text-gray-900 text-xs sm:text-sm">
                              {item.put_options.market_data.oi.toLocaleString()}
                            </span>
                          </td>

                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-left border-l border-gray-100 ${
                              putITM ? "bg-red-25" : ""
                            }`}
                          >
                            <span
                              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium whitespace-nowrap ${
                                putOIChange > 0
                                  ? "bg-green-100 text-green-800"
                                  : putOIChange < 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {putOIChange > 0 ? "+" : ""}
                              {putOIChange.toLocaleString()}
                            </span>
                          </td>
                        </>
                      )}
                      {viewMode === "medium" && (
                        <>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm border-l border-gray-100 ${
                              putITM ? "bg-red-25" : ""
                            }`}
                          >
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                              {item.put_options.option_greeks.iv.toFixed(1)}%
                            </span>
                          </td>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm border-l border-gray-100 ${
                              putITM ? "bg-red-25" : ""
                            }`}
                          >
                            <span className="font-mono text-gray-900">
                              {item.put_options.market_data.volume.toLocaleString()}
                            </span>
                          </td>
                        </>
                      )}
                      {viewMode === "large" && (
                        <>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm border-l border-gray-100 ${
                              putITM ? "bg-red-25" : ""
                            }`}
                          >
                            <span className="font-mono text-gray-900">
                              {item.put_options.option_greeks.delta.toFixed(2)}
                            </span>
                          </td>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm border-l border-gray-100 ${
                              putITM ? "bg-red-25" : ""
                            }`}
                          >
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                              {item.put_options.option_greeks.iv.toFixed(1)}%
                            </span>
                          </td>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm border-l border-gray-100 ${
                              putITM ? "bg-red-25" : ""
                            }`}
                          >
                            <span className="font-mono text-gray-900">
                              {item.put_options.market_data.volume.toLocaleString()}
                            </span>
                          </td>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm border-l border-gray-100 ${
                              putITM ? "bg-red-25" : ""
                            }`}
                          >
                            <span className="font-medium text-gray-900">
                              ₹
                              {item.put_options.market_data.ask_price.toFixed(
                                2
                              )}
                            </span>
                          </td>
                          <td
                            className={`px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm border-l border-gray-100 ${
                              putITM ? "bg-red-25" : ""
                            }`}
                          >
                            <span className="font-medium text-gray-900">
                              ₹
                              {item.put_options.market_data.bid_price.toFixed(
                                2
                              )}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Total Call OI
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {filteredData
                    .reduce(
                      (sum, item) => sum + item.call_options.market_data.oi,
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 rounded-lg p-2 sm:p-3">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Total Put OI
                </p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {filteredData
                    .reduce(
                      (sum, item) => sum + item.put_options.market_data.oi,
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-red-100 rounded-lg p-2 sm:p-3">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Put-Call Ratio
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {filteredData.length > 0
                    ? (
                        filteredData.reduce(
                          (sum, item) => sum + item.put_options.market_data.oi,
                          0
                        ) /
                        filteredData.reduce(
                          (sum, item) => sum + item.call_options.market_data.oi,
                          0
                        )
                      ).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <div className="bg-blue-100 rounded-lg p-2 sm:p-3">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                  ATM Strike
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  ₹{atmStrike.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-100 rounded-lg p-2 sm:p-3">
                <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex flex-wrap items-center gap-3 sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-200 rounded-full"></div>
                <span className="font-medium">Call ITM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-200 rounded-full"></div>
                <span className="font-medium">Put ITM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                <span className="font-medium">ATM Strike</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Info className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-700">
                Live • Auto-refresh 30s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsPage;
