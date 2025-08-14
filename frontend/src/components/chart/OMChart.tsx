"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  CandlestickSeries,
  createChart,
  UTCTimestamp,
} from "lightweight-charts";
import SearchStockDialog from "./SearchStockDialog";
import axios from "axios";
import { io } from "socket.io-client";
import PurchaseButton from "./PurchaseButton";
import EQ_Stock from "../../data/EQ_Stock.json";
import nse_indices from "../../data/nse_indices.json";
import nse_fo_fut from "../../data/nse_fo_fut.json";
import nse_fo from "../../data/nse_fo.json"

const timeframes = [
  { label: "1m", unit: "minutes", interval: 1 },
  { label: "3m", unit: "minutes", interval: 3 },
  { label: "5m", unit: "minutes", interval: 5 },
  { label: "10m", unit: "minutes", interval: 10 },
  { label: "15m", unit: "minutes", interval: 15 },
  { label: "30m", unit: "minutes", interval: 30 },

  { label: "1h", unit: "hours", interval: 1 },
  { label: "2h", unit: "hours", interval: 2 },
  { label: "4h", unit: "hours", interval: 4 },

  // optionally more
  { label: "1d", unit: "days", interval: 1 },
  { label: "1M", unit: "months", interval: 1 },
] as const;
import { useSearchParams } from "next/navigation";

type TimeframeLabel = (typeof timeframes)[number]["label"];

type StockInfo = {
  name: string;
  trading_symbol: string;
  instrument_key: string;
  [key: string]: any;
};

export function OMChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
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

  // Popular NSE indices for quick selection
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

  // Resubscribe if instrumentKey changes
  // useEffect(() => {
  //   if (socket?.connected && stockInfo.instrument_key) {
  //     socket.emit("subscribe_instrument", {
  //       instrumentKey: stockInfo.instrument_key,
  //     });
  //   }
  // }, [stockInfo.instrument_key, socket]);

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
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
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

  if (error) {
    return (
      <div className="chart-error" style={{ color: "red", padding: "20px" }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center bg-white mb-3">
        <div className="relative group inline-block">
          <button
            className="bg-gray-200  px-4 py-2 rounded  text-black cursor-pointer"
            onClick={() => setOpenDialog(true)}
          >
            🔍 {stockInfo.name}
          </button>

          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Change Stock
          </div>
        </div>

        <select
          className="bg-gray-200 px-4 py-2.5 rounded text-black cursor-pointer mx-4"
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
          <option value="">Select Popular Index</option>
          {popularIndices.map((index) => (
            <option key={index.instrument_key} value={index.instrument_key}>
              {index.name}
            </option>
          ))}
        </select>

        <select
          className="bg-gray-200 px-4 py-2.5 rounded text-black cursor-pointer mx-4"
          onChange={(e) => setTimeframe(e.target.value as TimeframeLabel)}
          value={timeframe}
        >
          {timeframes.map((tf) => (
            <option key={tf.label} value={tf.label}>
              {tf.label}
            </option>
          ))}
        </select>

        <PurchaseButton
          Symbol={stockInfo.trading_symbol}
          InstrumentKey={stockInfo.instrument_key}
          Expiry={stockInfo.expiry || undefined}
          lotSize={stockInfo.lotSize || undefined}
        />

        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>
      <div>
        {stockInfo.trading_symbol}
      </div>
      <div
        ref={chartContainerRef}
        // style={{
        //   width: "100%",
        //   height: "100%",
        //   position: "relative",
        // }}
        className=" bg-black border border-gray-300 rounded-lg shadow-md mt-3"
      />

      <SearchStockDialog
        openDialog={openDialog}
        closeDialog={() => setOpenDialog(false)}
        onSelectStock={setStockInfo}
      />
    </>
  );
}
export default OMChart;
