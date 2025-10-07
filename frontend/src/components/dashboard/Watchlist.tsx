"use client";
import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import SearchStockDialog, { StockInfo } from "./SearchStock";
import { getFixWatchlist, FinalData, SingleResponce } from "./MarketIndex";
import { useSession } from "next-auth/react";
import axios from "axios";

// My Holdings Data
type WatchlistProps = {
  watchlistName: string;
};
const Watchlist = ({ watchlistName }: WatchlistProps) => {
  const [watchlist, setWatchlist] = useState<FinalData[]>();
  const [openDialog, setOpenDialog] = useState(false);
  const { data: session } = useSession();
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (!session?.user?._id) return;

    console.log("15/7", session?.user?._id);
    getFixWatchlist(session.user._id).then((data) => setWatchlist(data));
  }, [session]);

  const handleAddStock = async (stock: StockInfo) => {
    // Prevent duplicates
    if (watchlist?.some((s) => s.trading_symbol === stock.trading_symbol))
      return;

    try {
      // Replace with your actual API URL
      console.log("before session user", session?.user._id, session?.user);
      if (!session?.user?._id) return;
      console.log("beff res");
      const res = await fetch(`/api/getLTP/${stock.instrument_key}`);
      console.log("reswatch", res.json());
      const data: SingleResponce = await res.json();
      console.log("wat data", data);
      const ltp = data?.last_price;
      const cp = data?.cp;
      const percent_change = cp ? ((ltp - cp) / cp) * 100 : 0;

      const newStock = {
        name: stock.name,
        instrument_key: stock.instrument_key,
        trading_symbol: stock.trading_symbol,
        ltp: data.last_price,
        cp: data.cp,
        percent_change: parseFloat(percent_change.toFixed(2)),
      };
      const bacres = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/watchlist/addInstrument`,
        {
          userId: session.user._id,
          watchlistName,
          instrumentKeys: [stock.instrument_key],
        }
      );
      console.log("add ress", bacres);

      setWatchlist((prev) => [...(prev ?? []), newStock]);
    } catch (error) {
      console.error("Failed to fetch LTP:", error);
      // fallback if needed
      const fallbackStock = {
        trading_symbol: stock.trading_symbol,
        instrument_key: stock.instrument_key,
        name: stock.name,
        ltp: 0,
        cp: 0,
        percent_change: 0,
      };
      setWatchlist((prev) => [...(prev ?? []), fallbackStock]);
    }
  };

  const handleRemoveWatchlist = async () => {
    if (!session?.user?._id) return;

    const bacres = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/watchlist/delete`,
      {
        params: {
          userId: session.user._id,
          watchlistName,
        },
      }
    );
    console.log("remwatc ress", bacres);
  };

  const handleDeleteStock = async (instrumentKey: string) => {
    if (!session?.user?._id) return;
    console.log("del instrumen ff", instrumentKey);
    const bacres = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/watchlist/delInstrument`,
      {
        userId: session.user._id,
        watchlistName,
        instrumentKey,
      }
    );
    console.log("delstock ress", bacres);
    setWatchlist((prev) =>
      prev?.filter((stock) => stock.instrument_key !== instrumentKey)
    ); // this look not good but i will work
  };

  return (
    <>
      {/* Watchlist */}
      <div className="bg-white rounded-lg shadow-sm ">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Watchlist</h3>
            <div>
              {isEdit && (
                <>
                  <button
                    onClick={() => handleRemoveWatchlist()}
                    title="Delete Watchlist"
                    className="mr-3"
                  >
                    <Trash2 className="w-6 h-6 text-black cursor-pointer hover:text-red-500" />
                  </button>
                  <button
                    onClick={() => setIsEdit(false)}
                    className="mr-2"
                    title="cancel deletion"
                  >
                    <X className="w-6 h-6 text-black cursor-pointer hover:text-gray-600" />
                  </button>
                </>
              )}
              {!isEdit && (
                <>
                  <button
                    onClick={() => setOpenDialog(true)}
                    className="mr-2"
                    title="Add Stock"
                  >
                    <Plus className="w-6 h-6 text-black cursor-pointer hover:text-green-500" />
                  </button>
                  <button
                    onClick={() => setIsEdit(true)}
                    className="mr-2"
                    title="Edit Watchlist"
                  >
                    <Pencil className="w-5 h-5 text-black cursor-pointer hover:text-blue-400" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-4">
            {watchlist?.map((stock, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-medium text-gray-900">
                      {stock.trading_symbol}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {stock.name}
                    </div>
                  </div>
                </div>
                <div className="text-right flex">
                  <div className="mr-4">
                    <div className="font-medium text-gray-900">
                      ₹{stock.ltp}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        stock.percent_change > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stock.percent_change > 0 ? "+" : ""}
                      {stock.percent_change}%
                    </div>
                  </div>

                  {isEdit && (
                    <button
                      onClick={() => handleDeleteStock(stock.instrument_key)}
                    >
                      <Trash2 className="w-5 h-5 text-black cursor-pointer hover:text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-green-600 hover:text-green-700 font-medium text-sm py-2">
            View all watchlist
          </button>
        </div>
      </div>

      <SearchStockDialog
        openDialog={openDialog}
        closeDialog={() => setOpenDialog(false)}
        onSelectStock={handleAddStock}
      />
    </>
  );
};

export default Watchlist;
