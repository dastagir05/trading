import React from "react";
import { useState, useEffect, JSX } from "react";
import { User } from "../../types/user";
import { Trade } from "@/types/trade";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Building2,
  Factory,
  Landmark,
  Cpu,
  Car,
  Fuel,
  Pill,
  Smartphone,
  Wifi,
  Home,
  ShoppingCart,
  Briefcase,
  Eye,

} from "lucide-react";
import TradeCard from "./TradeCard";
// Helper function to get company icon
const getCompanyIcon = (symbol: string) => {
  const iconMap: { [key: string]: JSX.Element } = {
    RELIANCE: <Fuel className="w-6 h-6 text-orange-600" />,
    TCS: <Cpu className="w-6 h-6 text-blue-600" />,
    HDFCBANK: <Landmark className="w-6 h-6 text-red-600" />,
    BankNifty: <Landmark className="w-6 h-6 text-red-600" />,
    INFY: <Cpu className="w-6 h-6 text-blue-500" />,
    BHARTIARTL: <Smartphone className="w-6 h-6 text-red-500" />,
    MARUTI: <Car className="w-6 h-6 text-blue-600" />,
    SUNPHARMA: <Pill className="w-6 h-6 text-orange-500" />,
    NESTLEIND: <ShoppingCart className="w-6 h-6 text-red-600" />,
    ASIANPAINT: <Home className="w-6 h-6 text-yellow-600" />,
  };
  return iconMap[symbol] || <Building2 className="w-6 h-6 text-gray-600" />;
};

// Helper function to get status styling
const getStatusStyle = (status: string) => {
  switch (status) {
    case "completed":
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    case "inprocess":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: <Clock className="w-4 h-4" />,
      };
    case "cancelled":
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: <XCircle className="w-4 h-4" />,
      };
    case "rejected":
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: <AlertCircle className="w-4 h-4" />,
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: <Clock className="w-4 h-4" />,
      };
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("en-IN"),
    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

const TradeTable = () => {
  const [trades, setTrades] = useState<Trade[]>();
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sideFilter, setSideFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade>();
  const [ltpData, setLtpData] = useState<{[key: string]: number}>({});
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!session?.user?._id) return;

    const fetchTrades = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trade/gettrades?userId=${session.user._id}`
      );
      const data = await res.data;
      setTrades(data);
    };

    fetchTrades();
  }, [session, selectedTrade, openDialog]);

  useEffect(() => {
    let filtered = trades;
    if (!filtered) return;
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((trade) =>
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((trade) => trade.status === statusFilter);
    }

    // Side filter
    if (sideFilter !== "all") {
      filtered = filtered.filter((trade) => trade.side === sideFilter);
    }

    setFilteredTrades(filtered);
  }, [trades, searchTerm, statusFilter, sideFilter]);
  const deleteTrades = async (userId: string, tradeId: string) => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trade/closeTrade`,
      {
        userId: userId,
        tradeId: tradeId,
      }
    );
    console.log(res);
  };
  useEffect(() => {
    if (!trades || trades.length === 0) return;
  
    let cancelled = false;
  
    const isMarketOpen = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const day = now.getDay(); // 0 = Sunday
  
      const isWeekday = day >= 1 && day <= 5;
      const afterOpen = hours > 9 || (hours === 9 && minutes >= 15);
      const beforeClose = hours < 15 || (hours === 15 && minutes <= 30);
  
      console.log("return", isWeekday && afterOpen && beforeClose)
      return isWeekday && afterOpen && beforeClose;
    };

    const fetchLtpData = async () => {
      const inprocessTrades: Trade[] = trades.filter(t => t.status === "inprocess");
      const allKeys = inprocessTrades.map(t => t.instrumentKey);
      const uniqueKeys = [...new Set(allKeys)];
      if (uniqueKeys.length === 0) return;

      try {
        const query = uniqueKeys.map(k => encodeURIComponent(k)).join(",");
        const res = await fetch(`/api/getLTP/${query}`);
        const data = await res.json(); // { [key]: ltp }
  
        if (!cancelled) {
          setLtpData(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("LTP fetch failed:", err);
      }
    };
  
    const poll = async () => {
      await fetchLtpData();
  
      if (!cancelled && isMarketOpen()) {
        setTimeout(poll, 10000); // Repeat only if market open
      }
    };
  
    poll(); // Start polling or one-time fetch
  
    return () => {
      cancelled = true;
    };
  }, [trades]);
  
  // Calculate PnL using cached LTP data
  const getPnL = (instrumentKey: string, entryPrice: number) => {
    console.log("myltpp",ltpData)
    const ltp = ltpData[instrumentKey];
    console.log("let",ltp)
    // return ltpData ? ltpData.last_price - entryPrice : 0;
    return ltp ? ltp - entryPrice : ltpData.last_price - entryPrice;
  };
  return (
    <>
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="inprocess">In Process</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Buy & Sell</option>
              <option value="buy">Buy Only</option>
              <option value="sell">Sell Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Trade History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Stock",
                  "Type",
                  "Quantity",
                  "Price",
                  "P&L",
                  "Status",
                  "Date & Time",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrades &&
                filteredTrades.map((trade) => {
                  const statusStyle = getStatusStyle(trade.status);
                  const dateTime = formatDate(trade.createdAt);
                  
                  return (
                    <tr
                      key={trade._id}
                      className="hover:bg-gray-50 transition-colors"
                      onClick={() => {setOpenDialog(true); setSelectedTrade(trade)}}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-3">
                            {getCompanyIcon(trade.symbol) || (
                              <Fuel className="w-6 h-6 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {trade.symbol}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {trade.capCategory} Cap
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            trade.side === "buy"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {trade.side === "buy" ? (
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                          )}
                          {trade.side.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trade.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{trade.entryPrice.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-90 ${trade.pnl && trade.pnl > 0 ? "text-green-500" : "text-red-500"}`}>
                        ₹{
                          trade.pnl !== undefined && trade.pnl !== null
                            ? trade.pnl
                            : trade.status === "pending"
                              ? "-"
                              : getPnL(trade.instrumentKey, trade.entryPrice).toFixed(2)
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.icon}
                          <span className="ml-1 capitalize">
                            {trade.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{dateTime.date}</div>
                        <div className="text-gray-500">{dateTime.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button className="text-green-600 hover:text-green-700"
                          onClick= {() => {setOpenDialog(true); setSelectedTrade(trade)}}
                          
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {trade.status === "inprocess" && (
                          <button
                            className="text-gray-400 hover:text-gray-600 ml-2"
                            onClick={() =>
                              deleteTrades(trade.userId, trade._id)
                            }
                          >
                            Close
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {filteredTrades && filteredTrades.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No trades found
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" || sideFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start trading to see your trade history here"}
            </p>
          </div>
        )}
      </div>
      {selectedTrade && <TradeCard trade={selectedTrade} openDialog={openDialog} closeDialog={() => setOpenDialog(false)} />}
    </>
  );
};

export default TradeTable;
