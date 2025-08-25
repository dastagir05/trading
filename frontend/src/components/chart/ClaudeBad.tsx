"use client"
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  CandlestickSeries,
  createChart,
  UTCTimestamp,
} from "lightweight-charts";
import { ChevronDown, TrendingUp, Clock, Search } from 'lucide-react';
import SearchStockDialog from "./SearchStockDialog";
import axios from "axios";
import { io } from "socket.io-client";
import PurchaseButton from "./PurchaseButton";
import EQ_Stock from "../../data/EQ_Stock.json";
import nse_indices from "../../data/nse_indices.json";
import nse_fo_fut from "../../data/nse_fo_fut.json";
import nse_fo from "../../data/nse_fo.json"
import { useSearchParams, useRouter } from "next/navigation";

type TimeframeLabel = (typeof timeframes)[number]["label"];

type StockInfo = {
  name: string;
  trading_symbol: string;
  instrument_key: string;
  [key: string]: any;
};

const timeframes = [
  { label: "1m", unit: "minutes", interval: 1 },
  { label: "3m", unit: "minutes", interval: 3 },
  { label: "5m", unit: "minutes", interval: 5 },
  { label: "15m", unit: "minutes", interval: 15 },
  { label: "30m", unit: "minutes", interval: 30 },
  { label: "1h", unit: "hours", interval: 1 },
  { label: "4h", unit: "hours", interval: 4 },
  { label: "1d", unit: "days", interval: 1 },
];

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

const Chart = () => {
  const chartContainerRef = useRef(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("15m");
  const [selectedIndex, setSelectedIndex] = useState("NSE_INDEX|Nifty 50");
  const [isLive, setIsLive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [candles, setCandles] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<TimeframeLabel>("15m");
  const [stockInfo, setStockInfo] = useState<StockInfo>({
    name: "RELIANCE INDUSTRIES LTD",
    trading_symbol: "RELIANCE",
    exchange: "NSE_EQ",
    instrument_key: "NSE_EQ|INE002A01018", // Default to RELIANCE
  });
  const [isReady, setIsReady] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const searchParams = useSearchParams();
  const instrumentKeyProp = searchParams.get("instrumentKey");

  const router = useRouter();


  useEffect(() => {
    if (!instrumentKeyProp) {
      // No param; use default and mark ready so we fetch once
      setIsReady(true);
      return;
    }

    const exchange = instrumentKeyProp.split("|")[0];

    if (exchange === "NSE_EQ") {
      const match = EQ_Stock.find(
        (stock: any) => stock.instrument_key === instrumentKeyProp
      );
      if (match) {
        setStockInfo({
          name: match.name,
          trading_symbol: match.trading_symbol,
          exchange: "NSE_EQ",
          instrument_key: instrumentKeyProp,
        });
      }
    } else if (exchange === "NSE_INDEX") {
      const match = nse_indices.find(
        (stock: any) => stock.instrument_key === instrumentKeyProp
      );
      if (match) {
        setStockInfo({
          name: match.name,
          trading_symbol: match.trading_symbol,
          exchange: "NSE_INDEX",
          instrument_key: instrumentKeyProp,
        });
      }
    } else if (exchange === "NSE_FO") {
      const match = nse_fo_fut.find(
        (stock: any) => stock.instrument_key === instrumentKeyProp
      );
      if (match) {
        setStockInfo({
          name: match.name,
          trading_symbol: match.trading_symbol,
          exchange: "NSE_FO",
          instrument_key: instrumentKeyProp,
          expiry: match.expiry,
          lotSize: match.lot_size,
        });
      } else if (Array.isArray(nse_fo)) {
        const match = nse_fo.find(
          (stock: any) => stock.instrument_key === instrumentKeyProp
        );
        if (match) {
          setStockInfo({
            name: match.name,
            trading_symbol: match.trading_symbol,
            exchange: "NSE_FO",
            instrument_type: match.instrument_key,
            instrument_key: instrumentKeyProp,
            expiry: match.expiry,
            lotSize: match.lot_size,
          });
        }
      }
    }

    // Mark ready after we apply the param
    setIsReady(true);
  }, [instrumentKeyProp]);

  // Format candle data
  const formatCandleData = useCallback((rawCandles: any[]) => {
    return rawCandles.map((candle) => {
      const cleanTimestamp = candle[0].split(".")[0].replace("+05:30", "Z");
      return {
        time: Math.floor(
          new Date(cleanTimestamp).getTime() / 1000
        ) as UTCTimestamp,
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
      };
    });
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) {
      setError("Chart container not found");
      return;
    }

    // Clean up previous chart if exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    try {
      const container = chartContainerRef.current as HTMLDivElement | null;
      if (!container) throw new Error("Chart container not found");
      const chart = createChart(container, {
        width: container.clientWidth,
        height: 700,
        layout: {
          textColor: "#191919",
          background: { color: "#ffffff" },
        },
        grid: {
          vertLines: { color: "#f0f0f0" },
          horzLines: { color: "#f0f0f0" },
        },
        timeScale: {
          timeVisible: true,
          borderColor: "#d1d4dc",
        },
      });

      chartRef.current = chart;

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      candleSeriesRef.current = candleSeries;

      // Handle resize with debounce
      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries.length || !chartRef.current) return;

        const { width, height } = entries[0].contentRect;
        chartRef.current.applyOptions({ width, height });
        chartRef.current.timeScale().fitContent();
      });

      resizeObserver.observe(chartContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        chart.remove();
        chartRef.current = null;
        candleSeriesRef.current = null;
      };
    } catch (err) {
      console.error("Chart initialization error:", err);
      setError(
        `Failed to initialize chart: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }, []);

  // Update chart data when candles change
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    try {
      const formattedData = formatCandleData(candles);
      candleSeriesRef.current.setData(formattedData);
      chartRef.current?.timeScale().fitContent();
    } catch (err) {
      console.error("Error updating chart data:", err);
      setError(
        `Failed to update chart data: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }, [candles, formatCandleData]);

  useEffect(() => {
    if (!isReady || !stockInfo?.instrument_key) return;

    const controller = new AbortController();
    let didCancel = false;

    const fetchCandles = async () => {
      try {
        const selectedTimeframe = timeframes.find(
          (tf) => tf.label === timeframe
        );
        if (!selectedTimeframe) {
          setError("Invalid timeframe selected");
          return;
        }

        const { unit, interval } = selectedTimeframe;
        const res = await axios.get(
          `/api/dcandle/${stockInfo.instrument_key}/${unit}/${interval}`,
          { signal: controller.signal }
        );
        if (didCancel) return;
        console.log("Fetched candles:", res.data);
        if (!res.data || res.data.length === 0) {
          setError("No candle data available");
          return;
        }
        setCandles(res.data);
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        console.error("Error fetching candles:", err);
        setError("Failed to fetch candle data");
      }
    };

    fetchCandles();

    return () => {
      didCancel = true;
      controller.abort();
    };
  }, [timeframe, stockInfo.instrument_key, isReady]);

  const gotoOptainpage = (instrumentKey: string) => {
    router.push(`/option?instrumentKey=${instrumentKey}`);
  };

  // const getSelectedData = () => {
  //   return popularIndices.find(index => index.instrument_key === selectedIndex) || popularIndices[0];
  // };

  // const selectedData = getSelectedData();
  // const isPositive = selectedData.change.startsWith('+');
  // const isPositive = true

  // const handleRefresh = () => {
  //   setRefreshing(true);
  //   setTimeout(() => setRefreshing(false), 2000);
  // };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-full mx-auto space-y-4">
        
        {/* Single Header Row with All Controls */}
        <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 p-6">
          <div className="flex items-center justify-between">
            
            {/* Left Section: Symbol Dropdown + Timeframes */}
            <div className="flex items-center space-x-3 ">
              {/* Symbol Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDialog(true)}
                  className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-4 py-3 font-semibold focus:outline-none cursor-pointer shadow-lg transition-all duration-200 min-w-[200px]"
                >
                  <div className="w-5 h-5">📊</div>
                  <span className="text-lg">{stockInfo.name}</span>
                </button>
              </div>
              <div>
              <div className="relative">
              <select
                className="w-full bg-white border-2 border-gray-200 hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 px-3 pr-6 py-3 rounded-xl text-gray-800 cursor-pointer font-medium shadow-sm hover:shadow-md transition-all duration-300 appearance-none"
                onChange={(e) => {
                  const selectedIndex = popularIndices.find(
                    (index) => index.instrument_key === e.target.value
                  );
                  if (selectedIndex) {
                    setStockInfo(selectedIndex);
                  }
                }}
                value={stockInfo.instrument_key}
              >
                <option value="">Choose Popular Stock</option>
                {popularIndices.map((index) => (
                  <option key={index.instrument_key} value={index.instrument_key}>
                    {index.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
              </div>

              {/* Timeframe Pills */}
              <div className="relative">
              <select
          className="w-full bg-white border-2 border-gray-200 hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 px-3 py-3 rounded-xl text-gray-800 cursor-pointer font-medium shadow-sm hover:shadow-md transition-all duration-300 appearance-none"
          onChange={(e) => setTimeframe(e.target.value as TimeframeLabel)}
          value={timeframe}
        >
          {timeframes.map((tf) => (
            <option key={tf.label} value={tf.label}>
              {tf.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

            </div>
            </div>

            {/* Center Section: Price Info */}
            <div className="flex items-center space-x-8">
              <div className="text-center">

                
                {/* <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900">₹{selectedData.price}</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    isPositive 
                      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' 
                      : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                  } shadow-md`}>
                    {isPositive ? <div className="w-4 h-4 mr-1">📈</div> : <div className="w-4 h-4 mr-1">📉</div>}
                    {selectedData.change} ({selectedData.changePercent})
                  </span>
                </div> */}
              </div>

              {/* Quick Stats */}
              {/* <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-gray-500 text-xs font-medium">VOLUME</div>
                  <div className="text-gray-900 font-bold">2.34M</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-xs font-medium">HIGH</div>
                  <div className="text-green-600 font-bold">25,123</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-xs font-medium">LOW</div>
                  <div className="text-red-600 font-bold">24,856</div>
                </div>
              </div> */}
            </div>

            {/* Right Section: Action Buttons */}
            <div className="flex items-center space-x-3">
              
              <div className="flex items-center space-x-2 ml-4">
              <PurchaseButton
          Symbol={stockInfo.trading_symbol}
          InstrumentKey={stockInfo.instrument_key}
          Expiry={stockInfo.expiry || undefined}
          lotSize={stockInfo.lotSize || undefined}
        />
                <button 
                onClick={() => gotoOptainpage(stockInfo.instrument_key)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md transform hover:scale-105">
                  OPTIONS
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart Container - Full Width */}
        <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
          
          {/* Chart Header */}
          <div className="px-6 py-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50">
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse"></div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedData.name} - {selectedTimeframe} Chart
                </h3>
              </div>
            </div> */}
          </div>

          {/* Chart Area */}
          <div className="relative">
            {/* <div
              ref={chartContainerRef}
              className="w-full h-[600px] bg-gradient-to-b from-gray-50 to-white"
            >
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 grid grid-cols-12 grid-rows-8">
                    {Array.from({ length: 96 }).map((_, i) => (
                      <div key={i} className="border border-gray-200"></div>
                    ))}
                  </div>
                  
                  <div className="absolute inset-0 flex items-end justify-around p-8">
                    {Array.from({ length: 80 }).map((_, i) => {
                      const height = Math.random() * 200 + 50;
                      const isGreen = Math.random() > 0.5;
                      return (
                        <div
                          key={i}
                          className={`w-2 ${isGreen ? 'bg-green-500' : 'bg-red-500'} opacity-70`}
                          style={{ height: `${height}px` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div> */}
               <div
        ref={chartContainerRef}
        // className=" bg-black border border-gray-300 rounded-lg shadow-md mt-3"
      >

              {/* Chart Loading Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-8 shadow-2xl">
                    <div className="w-16 h-16 mx-auto mb-4 animate-spin text-4xl flex items-center justify-center text-white">📈</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Chart Loading
                    </h3>
                    <p className="text-white/80 text-sm">
                      Initializing TradingView integration...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Overlay Controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-white hover:text-purple-600 transition-all duration-200 shadow-md border border-purple-100">
                <div className="w-4 h-4">🎯</div>
              </button>
              <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-white hover:text-purple-600 transition-all duration-200 shadow-md border border-purple-100">
                <div className="w-4 h-4">⚡</div>
              </button>
              <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-white hover:text-purple-600 transition-all duration-200 shadow-md border border-purple-100">
                <div className="w-4 h-4">🔊</div>
              </button>
            </div>
          </div>

          {/* Bottom Stats Panel */}
          <div className="px-6 py-4 border-t border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="grid grid-cols-6 gap-6">
              <div className="text-center">
                <div className="text-gray-500 text-xs font-medium mb-1">OPEN</div>
                <div className="text-gray-900 font-bold">24,856.25</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs font-medium mb-1">HIGH</div>
                <div className="text-green-600 font-bold">25,123.80</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs font-medium mb-1">LOW</div>
                <div className="text-red-600 font-bold">24,789.15</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs font-medium mb-1">CLOSE</div>
                <div className="text-gray-900 font-bold">24,975.35</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs font-medium mb-1">VOLUME</div>
                <div className="text-blue-600 font-bold">2.34M</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs font-medium mb-1">VWAP</div>
                <div className="text-purple-600 font-bold">24,923.67</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <SearchStockDialog
        openDialog={openDialog}
        closeDialog={() => setOpenDialog(false)}
        onSelectStock={setStockInfo}
      />
    </>

  );
};

export default Chart;