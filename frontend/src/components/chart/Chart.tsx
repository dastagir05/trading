import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  CandlestickData,
  CandlestickSeries,
  CandlestickSeriesOptions,
  CandlestickStyleOptions,
  createChart,
  DeepPartial,
  ISeriesApi,
  SeriesOptionsCommon,
  Time,
  UTCTimestamp,
  WhitespaceData,
} from "lightweight-charts";
import { ChevronDown, Menu, X } from "lucide-react";
import SearchStockDialog from "./SearchStockDialog";
import axios from "axios";
import PurchaseButton from "./PurchaseButton";
import EQ_Stock from "../../data/EQ_Stock.json";
import nse_indices from "../../data/nse_indices.json";
import nse_fo_fut from "../../data/nse_fo_fut.json";
import nse_fo from "../../data/nse_fo.json";
import { useSearchParams, useRouter } from "next/navigation";

type TimeframeLabel = (typeof timeframes)[number]["label"];

type StockInfo = {
  name: string;
  trading_symbol: string;
  instrument_key: string;
  expiry?: Date | null;
  lotSize?: number | null;
  [key: string]: unknown;
};

export type NSE_FO_Stock = {
  name: string;
  trading_symbol: string;
  exchange?: string;
  instrument_key: string;
  expiry: Date | number;
  lot_size: number;
  [key: string]: unknown;
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
type Candle = [
  timestamp: string,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number
];

const Chart = () => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candleSeriesRef =
    useRef<
      ISeriesApi<
        "Candlestick",
        Time,
        CandlestickData<Time> | WhitespaceData<Time>,
        CandlestickSeriesOptions,
        DeepPartial<CandlestickStyleOptions & SeriesOptionsCommon>
      >
    >(null);
  const [error, setError] = useState<string | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [timeframe, setTimeframe] = useState<TimeframeLabel>("15m");
  const [stockInfo, setStockInfo] = useState<StockInfo>({
    name: "RELIANCE INDUSTRIES LTD",
    trading_symbol: "RELIANCE",
    exchange: "NSE_EQ",
    instrument_key: "NSE_EQ|INE002A01018",
  });
  const [isReady, setIsReady] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const searchParams = useSearchParams();
  const instrumentKeyProp = searchParams.get("instrumentKey");
  const nameProp = searchParams.get("name");
  const expiryProp = searchParams.get("expiry");
  const lotSizeProp = searchParams.get("lotSize");

  const router = useRouter();

  useEffect(() => {
    if (!instrumentKeyProp) {
      setIsReady(true);
      return;
    }

    const exchange = instrumentKeyProp.split("|")[0];
    if (exchange === "NSE_EQ") {
      const match = EQ_Stock.find(
        (stock: StockInfo) => stock.instrument_key === instrumentKeyProp
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
        (stock: StockInfo) => stock.instrument_key === instrumentKeyProp
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
      const nse_fo_fut_1: NSE_FO_Stock[] = nse_fo_fut;
      const match = nse_fo_fut_1.find(
        (stock: NSE_FO_Stock) => stock.instrument_key === instrumentKeyProp
      );
      if (match) {
        setStockInfo({
          name: match.name,
          trading_symbol: match.trading_symbol,
          exchange: "NSE_FO",
          instrument_key: instrumentKeyProp,
          expiry: match.expiry ? new Date(match.expiry) : null,
          lotSize: match.lot_size,
        });
      } else if (Array.isArray(nse_fo)) {
        setStockInfo({
          name: nameProp || "Not Found",
          trading_symbol: instrumentKeyProp,
          exchange: "NSE_FO",
          instrument_key: instrumentKeyProp,
          expiry: expiryProp ? new Date(expiryProp) : null,
          lotSize: lotSizeProp ? parseInt(lotSizeProp) : null,
        });
      }
    }

    setIsReady(true);
  }, [instrumentKeyProp]);

  const formatCandleData = useCallback((rawCandles: Candle[]) => {
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

  useEffect(() => {
    if (!chartContainerRef.current) {
      setError("Chart container not found");
      console.log("Chart container not found", error);
      return;
    }

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    try {
      const container = chartContainerRef.current as HTMLDivElement | null;
      if (!container) throw new Error("Chart container not found");

      const isMobile = window.innerWidth < 768;
      const chart = createChart(container, {
        width: container.clientWidth,
        height: isMobile ? 600 : 700,
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

      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries.length || !chartRef.current) return;
        const { width } = entries[0].contentRect;
        const isMobile = width < 768;
        chartRef.current.applyOptions({
          width,
          height: isMobile ? 600 : 700,
        });
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
        if (!res.data || res.data.length === 0) {
          setError("No candle data available");
          return;
        }
        setCandles(res.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === "CanceledError") return;
          console.error("Error fetching candles:", err);
          setError("Failed to fetch candle data");
        } else {
          console.error("Unknown error fetching candles:", err);
          setError("Failed to fetch candle data");
        }
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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-2 md:p-4">
        <div className="max-w-full mx-auto space-y-2 md:space-y-4">
          {/* Mobile Header - Compact */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-purple-100 p-3 md:p-6">
            {/* Mobile Top Bar */}
            <div className="flex items-center justify-between mb-3 md:hidden">
              <button
                onClick={() => setOpenDialog(true)}
                className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-md flex-1 mr-2"
              >
                <span>📊</span>
                <span className="truncate">{stockInfo.trading_symbol}</span>
              </button>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 bg-gray-100 text-black rounded-lg"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
              <div className="md:hidden text-black space-y-3 mb-3 pb-3 border-b border-gray-200">
                <div className="relative">
                  <select
                    className="w-full bg-white border-2 border-gray-200 px-3 py-2 rounded-lg text-sm"
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
                    <option value="">Popular Stocks</option>
                    {popularIndices.map((index) => (
                      <option
                        key={index.instrument_key}
                        value={index.instrument_key}
                      >
                        {index.name}
                      </option>
                    ))}
                  </select>
                  {/* <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /> */}
                </div>

                <div className="relative">
                  <select
                    className="w-full bg-white border-2 border-gray-200 px-3 py-2 rounded-lg text-sm"
                    onChange={(e) =>
                      setTimeframe(e.target.value as TimeframeLabel)
                    }
                    value={timeframe}
                  >
                    {timeframes.map((tf) => (
                      <option key={tf.label} value={tf.label}>
                        {tf.label}
                      </option>
                    ))}
                  </select>
                  {/* <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /> */}
                </div>

                <div className="flex gap-2">
                  <PurchaseButton
                    Symbol={stockInfo.trading_symbol}
                    InstrumentKey={stockInfo.instrument_key}
                    Expiry={stockInfo.expiry || undefined}
                    lotSize={stockInfo.lotSize || undefined}
                  />
                  <button
                    onClick={() => gotoOptainpage(stockInfo.name)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold rounded-lg shadow-md"
                  >
                    OPTIONS
                  </button>
                </div>
              </div>
            )}

            {/* Desktop Header - Original Layout */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setOpenDialog(true)}
                    className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-4 py-3 font-semibold shadow-lg transition-all duration-200 min-w-[200px]"
                  >
                    <div className="w-5 h-5">📊</div>
                    <span className="text-lg">{stockInfo.name}</span>
                  </button>
                </div>

                <div className="relative">
                  <select
                    className="bg-white border-2 border-gray-200 hover:border-green-400 focus:border-green-500 px-3 pr-6 py-3 rounded-xl text-gray-800 cursor-pointer font-medium shadow-sm"
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
                    <option value="">Popular Stocks</option>
                    {popularIndices.map((index) => (
                      <option
                        key={index.instrument_key}
                        value={index.instrument_key}
                      >
                        {index.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    className="bg-white border-2 border-gray-200 hover:border-green-400 focus:border-green-500 px-3 py-3 rounded-xl text-gray-800 cursor-pointer font-medium shadow-sm"
                    onChange={(e) =>
                      setTimeframe(e.target.value as TimeframeLabel)
                    }
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

              <div className="flex items-center space-x-3">
                <PurchaseButton
                  Symbol={stockInfo.trading_symbol}
                  InstrumentKey={stockInfo.instrument_key}
                  Expiry={stockInfo.expiry || undefined}
                  lotSize={stockInfo.lotSize || undefined}
                />
                <button
                  onClick={() => gotoOptainpage(stockInfo.name)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md"
                >
                  OPTIONS
                </button>
              </div>
            </div>

            {/* Mobile Timeframe Pills - Always Visible */}
            <div className="md:hidden overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max pb-1">
                {timeframes.map((tf) => (
                  <button
                    key={tf.label}
                    onClick={() => setTimeframe(tf.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      timeframe === tf.label
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
            <div className="px-3 md:px-6 py-3 md:py-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse"></div>
                  <h3 className="text-sm md:text-xl font-bold text-gray-900">
                    Live Chart
                  </h3>
                </div>
              </div>
            </div>

            <div className="relative">
              <div ref={chartContainerRef} className="w-full">
                {!candles.length && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90">
                    <div className="text-center p-4 md:p-8">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl md:rounded-2xl p-4 md:p-8 shadow-2xl">
                        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 animate-spin text-2xl md:text-4xl flex items-center justify-center text-white">
                          📈
                        </div>
                        <h3 className="text-lg md:text-2xl font-bold text-white mb-2">
                          Loading Chart
                        </h3>
                        <p className="text-white/80 text-xs md:text-sm">
                          Fetching market data...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
