"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, LineChart, TrendingUp, TrendingDown, Activity, Filter, Calendar, Info, Sparkles, RefreshCw } from "lucide-react";
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

type ViewMode = "small" | "medium" | "large" | string;

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
  const [selectedSymbol, setSelectedSymbol] = useState<string>("NSE_INDEX|Nifty 50");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbol = searchParams.get("instrumentKey");

  useEffect(() => {
    setSelectedSymbol(symbol || selectedSymbol);
  }, [symbol]);

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
      if (expirations.length > 0 && !selectedExpiry) {
        setSelectedExpiry(expirations[0]);
      }
    } catch (error) {
      console.error("Error fetching expiry dates:", error);
    }
  }

  // Fetch option chain data
  const fetchOptionData = async () => {
    if (!selectedExpiry) return;
    
    try {
      setRefreshing(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/option`,
        {
          params: { instrumentKey: selectedSymbol, expiry_date: selectedExpiry },
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
    const selected = popularIndices.find(index => index.instrument_key === selectedSymbol);
    return selected ? selected.name : 'Select Symbol';
  };

  // Initialize component
  useEffect(() => {
    fetchExpiryDates();
  }, [symbol, selectedSymbol]);

  // Fetch data when expiry changes
  useEffect(() => {
    if (selectedExpiry) {
      fetchOptionData();
    }
  }, [symbol, selectedExpiry, selectedSymbol]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (selectedExpiry) {
      const interval = setInterval(fetchOptionData, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedExpiry, selectedSymbol]);

  const getFilteredData = () => {
    if (viewMode === "small") {
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

  const isATM = (strike: number) => Math.abs(strike - atmStrike) <= 50;
  const isCallITM = (strike: number) => strike <= atmStrike;
  const isPutITM = (strike: number) => strike > atmStrike;

  const handleShowGraph = (instrumentKey: string) => {
    router.push(`/chart?instrumentKey=${instrumentKey}`);
  };

  const handleRefresh = () => {
    fetchOptionData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 p-8">
            <div className="animate-pulse space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-8 bg-gradient-to-r from-purple-200 to-blue-200 rounded-xl w-1/3"></div>
                <div className="h-10 bg-gradient-to-r from-purple-200 to-blue-200 rounded-xl w-1/4"></div>
              </div>
              <div className="h-96 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 p-12 text-center">
          <Activity className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">No option data available for the selected parameters.</p>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const spotPrice = data[0]?.underlying_spot_price || 24585.05;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              
              {/* Enhanced Custom Symbol Selector */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="appearance-none bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-2xl px-6 py-3 font-semibold focus:ring-4 focus:ring-purple-200 focus:outline-none cursor-pointer shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-3 min-w-[200px] justify-between"
                >
                  <span className="text-lg">{getSelectedSymbolName()}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Custom Dropdown */}
                {dropdownOpen && (
                  <div className="absolute top-full mt-2 w-full min-w-[280px] bg-white rounded-2xl shadow-2xl border border-purple-100 z-50 overflow-hidden">
                    {popularIndices.map((index) => (
                      <button
                        key={index.instrument_key}
                        onClick={() => {
                          setSelectedSymbol(index.instrument_key);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-6 py-4 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 font-medium ${
                          selectedSymbol === index.instrument_key 
                            ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700' 
                            : 'text-gray-700 hover:text-purple-600'
                        } border-b border-purple-50 last:border-b-0`}
                      >
                        {index.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-2xl font-normal text-gray-600">Option Chain</span>
              
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Live
              </span>
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-4xl font-bold text-gray-900">₹{spotPrice.toLocaleString()}</span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-md">
                <TrendingUp className="w-4 h-4 mr-1" />
                +0.91%
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* View Mode Toggle */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-1 flex shadow-inner">
            {(["small", "medium", "large"]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  viewMode === mode
                    ? "bg-white text-purple-600 shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-purple-600 hover:bg-white/50"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Expiry Selector */}
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 z-10" />
            <select
              className="appearance-none bg-white border-2 border-purple-200 rounded-2xl px-12 py-4 text-sm font-semibold text-gray-900 focus:ring-4 focus:ring-purple-200 focus:border-purple-400 cursor-pointer shadow-lg transition-all duration-200"
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
            >
              {availableExpiries.map((exp) => (
                <option key={exp} value={exp}>
                  {new Date(exp).toLocaleDateString('en-IN', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
        


        {/* Options Chain Table */}
        <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {/* Main Headers */}
                <tr className="bg-gradient-to-r from-green-50 via-green-100 to-red-100">
                  <th
                    colSpan={viewMode === "small" ? 3 : viewMode === "medium" ? 5 : 8}
                    className="text-center py-6 text-xl font-bold text-green-700 border-r-4 border-purple-200"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <TrendingUp className="w-6 h-6" />
                      CALLS
                    </div>
                  </th>
                  
                  <th className="px-8 py-6 text-center font-bold text-gray-900 bg-gradient-to-r from-purple-100 to-blue-100 border-x-4 border-purple-200">
                    <div className="flex items-center justify-center gap-3">
                      <Activity className="w-6 h-6 text-purple-600" />
                      STRIKE
                    </div>
                  </th>
                  
                  <th
                    colSpan={viewMode === "small" ? 3 : viewMode === "medium" ? 5 : 8}
                    className="text-center py-6 text-xl font-bold text-red-700 border-l-4 border-purple-200"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <TrendingDown className="w-6 h-6" />
                      PUTS
                    </div>
                  </th>
                </tr>

                {/* Column Headers */}
                <tr className="bg-gradient-to-r from-purple-50 to-blue-50 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {/* Call columns */}
                  {viewMode === "large" && (
                    <>
                      <th className="px-4 py-4 text-right border-r border-purple-100">Bid</th>
                      <th className="px-4 py-4 text-right border-r border-purple-100">Ask</th>
                      <th className="px-4 py-4 text-right border-r border-purple-100">Volume</th>
                      <th className="px-4 py-4 text-right border-r border-purple-100">IV %</th>
                      <th className="px-4 py-4 text-right border-r border-purple-100">Delta</th>
                    </>
                  )}
                  {viewMode === "medium" && (
                    <>
                      <th className="px-4 py-4 text-right border-r border-purple-100">Volume</th>
                      <th className="px-4 py-4 text-right border-r border-purple-100">IV %</th>
                    </>
                  )}
                  <th className="px-4 py-4 text-right border-r border-purple-100">OI Change</th>
                  <th className="px-4 py-4 text-right border-r border-purple-100">Open Interest</th>
                  <th className="px-4 py-4 text-right border-r-4 border-purple-200">LTP</th>

                  <th className="px-8 py-4 text-center bg-gradient-to-r from-purple-100 to-blue-100 border-x-4 border-purple-200 font-bold">Price</th>

                  <th className="px-4 py-4 text-left border-l-4 border-purple-200">LTP</th>
                  <th className="px-4 py-4 text-left border-l border-purple-100">Open Interest</th>
                  <th className="px-4 py-4 text-left border-l border-purple-100">OI Change</th>
                  {viewMode === "medium" && (
                    <>
                      <th className="px-4 py-4 text-left border-l border-purple-100">IV %</th>
                      <th className="px-4 py-4 text-left border-l border-purple-100">Volume</th>
                    </>
                  )}
                  {viewMode === "large" && (
                    <>
                      <th className="px-4 py-4 text-left border-l border-purple-100">Delta</th>
                      <th className="px-4 py-4 text-left border-l border-purple-100">IV %</th>
                      <th className="px-4 py-4 text-left border-l border-purple-100">Volume</th>
                      <th className="px-4 py-4 text-left border-l border-purple-100">Ask</th>
                      <th className="px-4 py-4 text-left border-l border-purple-100">Bid</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-50">
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
                      className={`hover:bg-gradient-to-r hover:from-purple-25 hover:to-blue-25 transition-all duration-200 ${
                        isATMStrike ? "bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-r-4 border-purple-300" : ""
                      }`}
                    >
                      {/* Call Options */}
                      {viewMode === "large" && (
                        <>
                          <td className={`px-4 py-4 text-right text-sm border-r border-purple-50 ${callITM ? "bg-gradient-to-r from-green-50 to-green-100" : ""}`}>
                            <span className="font-semibold text-green-700">₹{item.call_options.market_data.bid_price.toFixed(2)}</span>
                          </td>
                          <td className={`px-4 py-4 text-right text-sm border-r border-purple-50 ${callITM ? "bg-gradient-to-r from-green-50 to-green-100" : ""}`}>
                            <span className="font-semibold text-green-700">₹{item.call_options.market_data.ask_price.toFixed(2)}</span>
                          </td>
                          <td className={`px-4 py-4 text-right text-sm border-r border-purple-50 ${callITM ? "bg-gradient-to-r from-green-50 to-green-100" : ""}`}>
                            <span className="font-mono font-semibold">{item.call_options.market_data.volume.toLocaleString()}</span>
                          </td>
                          <td className={`px-4 py-4 text-right text-sm border-r border-purple-50 ${callITM ? "bg-gradient-to-r from-green-50 to-green-100" : ""}`}>
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl text-xs font-bold text-purple-700">
                              {item.call_options.option_greeks.iv.toFixed(1)}%
                            </span>
                          </td>
                          <td className={`px-4 py-4 text-right text-sm border-r border-purple-50 ${callITM ? "bg-gradient-to-r from-green-50 to-green-100" : ""}`}>
                            <span className="font-mono font-semibold">{item.call_options.option_greeks.delta.toFixed(2)}</span>
                          </td>
                        </>
                      )}
                      {viewMode === "medium" && (
                        <>
                          <td className={`px-4 py-4 text-right text-sm border-r border-purple-50 ${callITM ? "bg-gradient-to-r from-green-50 to-green-100" : ""}`}>
                            <span className="font-mono font-semibold">{item.call_options.market_data.volume.toLocaleString()}</span>
                          </td>
                          <td className={`px-4 py-4 text-right text-sm border-r border-purple-50 ${callITM ? "bg-gradient-to-r from-green-50 to-green-100" : ""}`}>
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl text-xs font-bold text-purple-700">
                              {item.call_options.option_greeks.iv.toFixed(1)}%
                            </span>
                          </td>
                        </>
                      )}

                      <td className={`px-4 py-4 text-right border-r border-purple-50 ${callITM ? "bg-gradient-to-r from-green-50 to-green-100" : ""}`}>
                        <span className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-bold shadow-sm ${
                          callOIChange > 0
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                            : callOIChange < 0
                            ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"
                        }`}>
                          {callOIChange > 0 ? "+" : ""}
                          {callOIChange.toLocaleString()}
                        </span>
                      </td>

                      <td className={`px-4 py-4 text-right border-r border-purple-50 ${callITM ? "bg-gradient-to-r from-green-50 to-green-100" : ""}`}>
                        <span className="font-mono font-bold text-gray-900 text-lg">
                          {item.call_options.market_data.oi.toLocaleString()}
                        </span>
                      </td>

                      <td className={`px-4 py-4 text-right border-r-4 border-purple-200 ${callITM ? "bg-gradient-to-r from-green-50 to-green-100" : ""}`}>
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleShowGraph(item.call_options.instrument_key)}
                            className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 text-blue-600 hover:text-purple-600 transition-all duration-200 shadow-md"
                          >
                            <LineChart size={16} />
                          </button>
                          <span className="font-bold text-green-600 text-xl">
                            ₹{item.call_options.market_data.ltp.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Strike Price */}
                      <td className={`px-8 py-4 text-center font-bold text-xl border-x-4 border-purple-200 ${
                        isATMStrike 
                          ? "bg-gradient-to-r from-purple-200 via-blue-200 to-purple-200 text-purple-900 shadow-lg" 
                          : "bg-gradient-to-r from-purple-100 to-blue-100 text-gray-900"
                      }`}>
                        <div className="flex flex-col items-center">
                          <span className="text-2xl">{item.strike_price.toLocaleString()}</span>
                          {isATMStrike && (
                            <span className="text-xs text-purple-700 font-bold bg-white px-2 py-1 rounded-full shadow">ATM</span>
                          )}
                        </div>
                      </td>

                      {/* Put Options */}
                      <td className={`px-4 py-4 text-left border-l-4 border-purple-200 ${putITM ? "bg-gradient-to-r from-red-50 to-red-100" : ""}`}>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-red-600 text-xl">
                            ₹{item.put_options.market_data.ltp.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleShowGraph(item.put_options.instrument_key)}
                            className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 text-red-600 hover:text-pink-600 transition-all duration-200 shadow-md"
                          >
                            <LineChart size={16} />
                          </button>
                        </div>
                      </td>

                      <td className={`px-4 py-4 text-left border-l border-purple-50 ${putITM ? "bg-gradient-to-r from-red-50 to-red-100" : ""}`}>
                        <span className="font-mono font-bold text-gray-900 text-lg">
                          {item.put_options.market_data.oi.toLocaleString()}
                        </span>
                      </td>

                      <td className={`px-4 py-4 text-left border-l border-purple-50 ${putITM ? "bg-gradient-to-r from-red-50 to-red-100" : ""}`}>
                        <span className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-bold shadow-sm ${
                          putOIChange > 0
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                            : putOIChange < 0
                            ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"
                        }`}>
                          {putOIChange > 0 ? "+" : ""}
                          {putOIChange.toLocaleString()}
                        </span>
                      </td>

                      {viewMode === "medium" && (
                        <>
                          <td className={`px-4 py-4 text-left text-sm border-l border-purple-50 ${putITM ? "bg-gradient-to-r from-red-50 to-red-100" : ""}`}>
                            <span className="font-semibold text-red-700">₹{item.put_options.market_data.ask_price.toFixed(2)}</span>
                          </td>
                          <td className={`px-4 py-4 text-left text-sm border-l border-purple-50 ${putITM ? "bg-gradient-to-r from-red-50 to-red-100" : ""}`}>
                            <span className="font-semibold text-red-700">₹{item.put_options.market_data.bid_price.toFixed(2)}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Call OI</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredData.reduce((sum, item) => sum + item.call_options.market_data.oi, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Put OI</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredData.reduce((sum, item) => sum + item.put_options.market_data.oi, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-xl p-3">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Put-Call Ratio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredData.length > 0 ? (
                    filteredData.reduce((sum, item) => sum + item.put_options.market_data.oi, 0) /
                    filteredData.reduce((sum, item) => sum + item.call_options.market_data.oi, 0)
                  ).toFixed(2) : "0.00"}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-400 to-blue-600 rounded-xl p-3">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">ATM Strike</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{atmStrike.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl p-3">
                <Filter className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 p-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-r from-green-200 to-green-300 rounded-full shadow"></div>
                <span className="font-semibold">Call ITM</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-r from-red-200 to-red-300 rounded-full shadow"></div>
                <span className="font-semibold">Put ITM</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full shadow"></div>
                <span className="font-semibold">ATM Strike</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Info className="w-4 h-4 text-purple-500" />
              <span className="font-semibold text-purple-700">Live market data • Auto-refresh every 30s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsPage;