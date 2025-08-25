"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowDownRight, ArrowUpRight, LineChart } from "lucide-react";
import { useRouter } from "next/navigation";
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

type ViewMode = "small" | "medium" | "large";
const expiryList = [
  "2025-08-21",
  "2025-09-30",
  "2025-10-28",
  "2025-12-30",
  "2026-03-31",
  "2026-06-30",
];

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

const OptionsPage: React.FC<{ symbol?: string }> = ({
  symbol = "NSE_INDEX|Nifty 50",
}) => {
  const [data, setData] = useState<OptionItem[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState<string>(expiryList[0]);
  const [loading, setLoading] = useState(true);
  // const [expiryDate, setExpiryDate] = useState("2025-08-28");
  const [viewMode, setViewMode] = useState<ViewMode>("small");
  const [atmStrike, setAtmStrike] = useState<number>(0);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(symbol);
  const router = useRouter();

  // Update selectedSymbol when symbol prop changes
  useEffect(() => {
    setSelectedSymbol(symbol);
  }, [symbol]);

  useEffect(() => {
    const fetchOptionData = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/option`,
          {
            params: { instrumentKey: selectedSymbol, expiry_date: selectedExpiry },
          }
        );
        // console.log("Fetched option data:", res.data.data);
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
      }
    };

    fetchOptionData();
  }, [selectedSymbol, selectedExpiry]);

  const getFilteredData = () => {
    if (viewMode === "small") {
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

  if (loading) {
    return (
      <div className="p-4 bg-white">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  if (!data.length)
    return <div className="p-4 text-red-500">No option data available.</div>;

  const filteredData = getFilteredData();
  const uniqueExpiries = [...new Set(data.map((item) => item.expiry))];

  return (
    <div className="p-4 bg-white">
      {/* Symbol Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Index:
        </label>
        <select
          className="text-sm border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
        >
          {popularIndices.map((index) => (
            <option key={index.instrument_key} value={index.instrument_key}>
              {index.name}
            </option>
          ))}
        </select>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium text-gray-900">
            {selectedSymbol.split("|")[1]} Option Chain
          </h2>
          <span className="text-sm text-gray-600">₹24,585.05</span>
          <span className="text-sm text-green-600 flex items-center">
            +0.91%
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Buttons */}
          <div className="flex border border-gray-300 rounded">
            {(["small", "medium", "large"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium border-r border-gray-300 last:border-r-0 ${
                  viewMode === mode
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <select
            className="text-sm border border-gray-300 rounded px-2 py-1"
            value={selectedExpiry}
            onChange={(e) => setSelectedExpiry(e.target.value)}
          >
            {expiryList.map((exp) => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Option Chain Table */}
      <div className="border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* Calls Header */}
              <th
                colSpan={
                  viewMode === "small" ? 3 : viewMode === "medium" ? 5 : 8
                }
                className="text-center py-2 text-sm font-medium text-gray-900 border-r border-gray-200"
              >
                CALLS
              </th>

              {/* Strike Header */}
              <th className="px-3 py-2 text-center font-medium text-gray-900 bg-gray-100">
                STRIKE
              </th>

              {/* Puts Header */}
              <th
                colSpan={
                  viewMode === "small" ? 3 : viewMode === "medium" ? 5 : 8
                }
                className="text-center py-2 text-sm font-medium text-gray-900 border-l border-gray-200"
              >
                PUTS
              </th>
            </tr>

            <tr className="text-xs text-gray-600 bg-gray-50">
              {/* Call columns */}
              {viewMode === "large" && (
                <>
                  <th className="px-2 py-2 text-right border-r border-gray-200">
                    Bid
                  </th>
                  <th className="px-2 py-2 text-right border-r border-gray-200">
                    Ask
                  </th>
                  <th className="px-2 py-2 text-right border-r border-gray-200">
                    Volume
                  </th>
                  <th className="px-2 py-2 text-right border-r border-gray-200">
                    IV
                  </th>
                  <th className="px-2 py-2 text-right border-r border-gray-200">
                    Delta
                  </th>
                </>
              )}
              {viewMode === "medium" && (
                <>
                  <th className="px-2 py-2 text-right border-r border-gray-200">
                    Volume
                  </th>
                  <th className="px-2 py-2 text-right border-r border-gray-200">
                    IV
                  </th>
                </>
              )}
              <th className="px-2 py-2 text-right border-r border-gray-200">
                OI Chg
              </th>
              <th className="px-2 py-2 text-right border-r border-gray-200">
                OI
              </th>
              <th className="px-2 py-2 text-right border-r border-gray-200">
                LTP
              </th>

              <th className="px-3 py-2 text-center bg-gray-100"></th>

              <th className="px-2 py-2 text-left border-l border-gray-200">
                LTP
              </th>
              <th className="px-2 py-2 text-left border-l border-gray-200">
                OI
              </th>
              <th className="px-2 py-2 text-left border-l border-gray-200">
                OI Chg
              </th>
              {viewMode === "medium" && (
                <>
                  <th className="px-2 py-2 text-left border-l border-gray-200">
                    IV
                  </th>
                  <th className="px-2 py-2 text-left border-l border-gray-200">
                    Volume
                  </th>
                </>
              )}
              {viewMode === "large" && (
                <>
                  <th className="px-2 py-2 text-left border-l border-gray-200">
                    Delta
                  </th>
                  <th className="px-2 py-2 text-left border-l border-gray-200">
                    IV
                  </th>
                  <th className="px-2 py-2 text-left border-l border-gray-200">
                    Volume
                  </th>
                  <th className="px-2 py-2 text-left border-l border-gray-200">
                    Ask
                  </th>
                  <th className="px-2 py-2 text-left border-l border-gray-200">
                    Bid
                  </th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
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
              // const isATMStrike = atmStrike;

              return (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  {/* Call Options */}
                  {viewMode === "large" && (
                    <>
                      <td
                        className={`px-2 py-2 text-right text-gray-700 border-r border-gray-100 ${
                          callITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.call_options.market_data.bid_price.toFixed(2)}
                      </td>
                      <td
                        className={`px-2 py-2 text-right text-gray-700 border-r border-gray-100 ${
                          callITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.call_options.market_data.ask_price.toFixed(2)}
                      </td>
                      <td
                        className={`px-2 py-2 text-right text-gray-700 border-r border-gray-100 ${
                          callITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.call_options.market_data.volume.toLocaleString()}
                      </td>
                      <td
                        className={`px-2 py-2 text-right text-gray-700 border-r border-gray-100 ${
                          callITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.call_options.option_greeks.iv.toFixed(1)}%
                      </td>
                      <td
                        className={`px-2 py-2 text-right text-gray-700 border-r border-gray-100 ${
                          callITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.call_options.option_greeks.delta.toFixed(2)}
                      </td>
                    </>
                  )}
                  {viewMode === "medium" && (
                    <>
                      <td
                        className={`px-2 py-2 text-right text-gray-700 border-r border-gray-100 ${
                          callITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.call_options.market_data.volume.toLocaleString()}
                      </td>
                      <td
                        className={`px-2 py-2 text-right text-gray-700 border-r border-gray-100 ${
                          callITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.call_options.option_greeks.iv.toFixed(1)}%
                      </td>
                    </>
                  )}

                  <td
                    className={`px-2 py-2 text-right border-r border-gray-100 ${
                      callITM ? "bg-yellow-100" : ""
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        callOIChange > 0
                          ? "text-green-600"
                          : callOIChange < 0
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {callOIChange > 0 ? "+" : ""}
                      {callOIChange.toLocaleString()}
                    </span>
                  </td>

                  <td
                    className={`px-2 py-2 text-right text-gray-900 border-r border-gray-100 ${
                      callITM ? "bg-yellow-100" : ""
                    }`}
                  >
                    {item.call_options.market_data.oi.toLocaleString()}
                  </td>

                  <td
                    className={`px-2 py-2 text-right font-medium text-blue-600 border-r border-gray-100 ${
                      callITM ? "bg-yellow-100" : ""
                    }`}
                  >
                    <button
                      onClick={() => handleShowGraph(item.call_options.instrument_key)}
                      className="flex items-center justify-end gap-1 text-blue-600 hover:text-blue-800 w-full"
                    >
                      <LineChart size={14} />
                      {item.call_options.market_data.ltp.toFixed(2)}
                    </button>
                  </td>

                  {/* Strike Price */}
                  <td
                    className={`px-3 py-2 text-center font-medium ${
                      isATMStrike ? "bg-blue-100" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {item.strike_price.toLocaleString()}
                  </td>

                  {/* Put Options */}
                  <td
                    className={`px-2 py-2 text-left font-medium text-red-600 border-l border-gray-100 ${
                      putITM ? "bg-yellow-100" : ""
                    }`}
                  >
                    <button
                      onClick={() =>
                        handleShowGraph(item.put_options.instrument_key)
                      }
                      className="flex items-center gap-1 text-red-600 hover:text-red-800"
                      >
                      {item.put_options.market_data.ltp.toFixed(2)}
                      <LineChart size={14} />
                    </button>
                  </td>

                  <td
                    className={`px-2 py-2 text-left text-gray-900 border-l border-gray-100 ${
                      putITM ? "bg-yellow-100" : ""
                    }`}
                  >
                    {item.put_options.market_data.oi.toLocaleString()}
                  </td>

                  <td
                    className={`px-2 py-2 text-left border-l border-gray-100 ${
                      putITM ? "bg-yellow-100" : ""
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        putOIChange > 0
                          ? "text-green-600"
                          : putOIChange < 0
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {putOIChange > 0 ? "+" : ""}
                      {putOIChange.toLocaleString()}
                    </span>
                  </td>

                  {viewMode === "medium" && (
                    <>
                      <td
                        className={`px-2 py-2 text-left text-gray-700 border-l border-gray-100 ${
                          putITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.put_options.option_greeks.iv.toFixed(1)}%
                      </td>
                      <td
                        className={`px-2 py-2 text-left text-gray-700 border-l border-gray-100 ${
                          putITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.put_options.market_data.volume.toLocaleString()}
                      </td>
                    </>
                  )}
                  {viewMode === "large" && (
                    <>
                      <td
                        className={`px-2 py-2 text-left text-gray-700 border-l border-gray-100 ${
                          putITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.put_options.option_greeks.delta.toFixed(2)}
                      </td>
                      <td
                        className={`px-2 py-2 text-left text-gray-700 border-l border-gray-100 ${
                          putITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.put_options.option_greeks.iv.toFixed(1)}%
                      </td>
                      <td
                        className={`px-2 py-2 text-left text-gray-700 border-l border-gray-100 ${
                          putITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.put_options.market_data.volume.toLocaleString()}
                      </td>
                      <td
                        className={`px-2 py-2 text-left text-gray-700 border-l border-gray-100 ${
                          putITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.put_options.market_data.ask_price.toFixed(2)}
                      </td>
                      <td
                        className={`px-2 py-2 text-left text-gray-700 border-l border-gray-100 ${
                          putITM ? "bg-yellow-100" : ""
                        }`}
                      >
                        {item.put_options.market_data.bid_price.toFixed(2)}
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
  );
};

export default OptionsPage;
