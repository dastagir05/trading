"use client";
import React, { useEffect, useState } from "react";
import EQ_Stock from "../../data/EQ_Stock.json"; // Adjust path as needed

export type StockInfo = {
  name: string;
  trading_symbol: string;
  instrument_key: string;
};

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
    const result = EQ_Stock.filter(
      (stock) =>
        stock.trading_symbol.toLowerCase().includes(lower) ||
        stock.name.toLowerCase().includes(lower)
    );
    setFilteredStocks(result);
  }, [query]);

  if (!openDialog) return null;

  return (
    <div className="fixed inset-0 text-black bg-white/10 z-50 flex items-center justify-center backdrop-blur-xs ">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Search Stocks</h2>
        <input
          type="text"
          placeholder="Search by stock name or symbol"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
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
