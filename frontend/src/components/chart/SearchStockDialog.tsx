"use client";
import React, { useEffect, useState } from "react";
import EQ_Stock from "../../data/EQ_Stock.json";
import nse_indices from "../../data/nse_indices.json";
import nse_fo from "../../data/nse_fo.json";
import nse_fo_fut from "../../data/nse_fo_fut.json";

type StockInfo = {
  name: string;
  trading_symbol: string;
  instrument_key: string;
  [key: string]: unknown;
};

// type FOStockInfo = {
//   name: string;
//   instrument
// }

type Props = {
  openDialog: boolean;
  closeDialog: () => void;
  onSelectStock: (info: StockInfo) => void;
};

const SearchStockDialog = ({
  openDialog,
  closeDialog,
  onSelectStock,
}: Props) => {
  const [query, setQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState<StockInfo[]>([]);
  const [filteredStocksByType, setFilteredStocksByType] =
    useState<string>("all");

  useEffect(() => {
    if (openDialog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openDialog]);

  useEffect(() => {
    const lower = query.toLowerCase();
    const fromEQ = EQ_Stock.filter(
      (stock) =>
        stock.trading_symbol.toLowerCase().includes(lower) ||
        stock.name.toLowerCase().includes(lower)
    );

    const fromIndex = nse_indices.filter(
      (stock) =>
        stock.trading_symbol.toLowerCase().includes(lower) ||
        stock.name.toLowerCase().includes(lower)
    );
    const fromFO = Array.isArray(nse_fo_fut)
      ? nse_fo_fut.filter(
          (stock: StockInfo) =>
            stock.trading_symbol.toLowerCase().includes(lower) ||
            stock.name.toLowerCase().includes(lower)
        )
      : [];
    const fromOPT = Array.isArray(nse_fo)
      ? nse_fo.filter(
          (stock: StockInfo) =>
            stock.trading_symbol.toLowerCase().includes(lower) ||
            stock.name.toLowerCase().includes(lower)
        )
      : [];
    let result;
    if (filteredStocksByType === "FUT") {
      result = [...fromFO];
    } else if (filteredStocksByType === "stock") {
      result = [...fromEQ];
    } else if (filteredStocksByType === "index") {
      result = [...fromIndex];
    } else if (filteredStocksByType === "OPT") {
      result = [...fromOPT];
    } else {
      result = [...fromEQ, ...fromIndex, ...fromFO]; // Combine both
    }

    setFilteredStocks(result);
  }, [query, filteredStocksByType]);

  if (!openDialog) return null;

  return (
    <div className="fixed inset-0 text-black bg-white/10 z-50 flex items-center justify-center backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Search Stocks</h2>
        <input
          type="text"
          placeholder="Search by stock name or symbol"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul>
          {["stock", "index", "FUT", "OPT"].map((type, i) => (
            <li
              key={i}
              className="border-2 bg-gray-200 cursor-pointer px-2 py-1 inline-block mr-2 rounded"
              // You may want to implement filtering by type here in the future
              onClick={() => {
                setFilteredStocksByType(type);
              }}
            >
              {type}
            </li>
          ))}
        </ul>
        <ul className="max-h-60 overflow-y-auto">
          {filteredStocks.map((stock, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelectStock(stock);
                closeDialog();
              }}
            >
              {stock.trading_symbol} - {stock.name}
            </li>
          ))}
        </ul>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={closeDialog}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SearchStockDialog;
