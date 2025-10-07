"use client";
import axios from "axios";
import {
  BarChart3,
  Banknote,
  Cpu,
  BarChart2,
  Car,
  TrendingUp,
  Activity,
  BarChartHorizontal,
  Package,
  Pill,
  BarChartBig,
  Wallet,
  Fuel,
  Globe,
} from "lucide-react";
import { ReactNode } from "react";
import EQ_Stock from "@/data/EQ_Stock.json";
type LtpResponse = {
  last_price: number;
  instrument_key: string;
  cp: number;
};

type IndexInfo = {
  name: string;
  instrument_key: string;
  icon: ReactNode; // ✅ Accepts JSX like <BarChart3 className="..." />
};
type Info = {
  name: string;
  instrument_key: string;
  trading_symbol: string; // ✅ Accepts JSX like <BarChart3 className="..." />
};
type Watchlist = {
  _id: string;
  userId: string;
  watchlistName: string;
  instrumentKeys: string[];
  createdAt: string;
  updatedAt: string;
};

export type FinalIndexData = {
  name: string;
  instrument_key: string;
  ltp: number;
  cp: number;
  percent_change: number;
  icon: ReactNode;
};
export type FinalData = {
  name: string;
  instrument_key: string;
  ltp: number;
  trading_symbol: string;
  cp: number;
  percent_change: number;
};
export type SingleResponce = {
  last_price: number;
  cp: number;
};
// Your popular index list
const popIK: IndexInfo[] = [
  {
    name: "Nifty 50",
    instrument_key: "NSE_INDEX|Nifty 50",
    icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
  },
  {
    name: "Nifty Bank",
    instrument_key: "NSE_INDEX|Nifty Bank",
    icon: <Banknote className="w-6 h-6 text-green-600" />,
  },
  {
    name: "Nifty IT",
    instrument_key: "NSE_INDEX|Nifty IT",
    icon: <Cpu className="w-6 h-6 text-indigo-500" />,
  },
  {
    name: "Nifty Midcap 50",
    instrument_key: "NSE_INDEX|Nifty Midcap 50",
    icon: <BarChart2 className="w-6 h-6 text-yellow-500" />,
  },
  {
    name: "Nifty Auto",
    instrument_key: "NSE_INDEX|Nifty Auto",
    icon: <Car className="w-6 h-6 text-orange-500" />,
  },
  {
    name: "Nifty Next 50",
    instrument_key: "NSE_INDEX|Nifty Next 50",
    icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
  },
  {
    name: "NIFTY MIDCAP 100",
    instrument_key: "NSE_INDEX|NIFTY MIDCAP 100",
    icon: <Activity className="w-6 h-6 text-blue-400" />,
  },
  {
    name: "NIFTY SMLCAP 100",
    instrument_key: "NSE_INDEX|NIFTY SMLCAP 100",
    icon: <BarChartHorizontal className="w-6 h-6 text-violet-500" />,
  },
  {
    name: "Nifty FMCG",
    instrument_key: "NSE_INDEX|Nifty FMCG",
    icon: <Package className="w-6 h-6 text-yellow-600" />,
  },
  {
    name: "Nifty Pharma",
    instrument_key: "NSE_INDEX|Nifty Pharma",
    icon: <Pill className="w-6 h-6 text-pink-500" />,
  },
  {
    name: "Nifty 100",
    instrument_key: "NSE_INDEX|Nifty 100",
    icon: <BarChartBig className="w-6 h-6 text-blue-600" />,
  },
  {
    name: "Nifty Fin Service",
    instrument_key: "NSE_INDEX|Nifty Fin Service",
    icon: <Wallet className="w-6 h-6 text-green-500" />,
  },
  {
    name: "NIFTY OIL AND GAS",
    instrument_key: "NSE_INDEX|NIFTY OIL AND GAS",
    icon: <Fuel className="w-6 h-6 text-amber-600" />,
  },
  {
    name: "Nifty MNC",
    instrument_key: "NSE_INDEX|Nifty MNC",
    icon: <Globe className="w-6 h-6 text-slate-500" />,
  },
];

const defaultWatchlistStocks: Info[] = [
  {
    trading_symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
    instrument_key: "NSE_EQ|INE397D01024",
  },
  {
    trading_symbol: "MARUTI",
    name: "Maruti Suzuki India",
    instrument_key: "NSE_EQ|INE585B01010",
  },
  {
    trading_symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical",
    instrument_key: "NSE_EQ|INE044A01036",
  },
  {
    trading_symbol: "NESTLEIND",
    name: "Nestle India Limited",
    instrument_key: "NSE_EQ|INE239A01024",
  },
  {
    trading_symbol: "ASIANPAINT",
    name: "Asian Paints Limited",
    instrument_key: "NSE_EQ|INE021A01026",
  },
];

// Fetch and format all index LTP data
export async function getIndexLtpData(): Promise<FinalIndexData[]> {
  try {
    const keys = popIK.map((i) => i.instrument_key).join(",");
    const res = await axios.get(`/api/getLTP/${encodeURIComponent(keys)}`);

    const data: LtpResponse[] = res.data;
    return popIK.map((index) => {
      const match = data.find((d) => d.instrument_key === index.instrument_key);
      const ltp = match?.last_price ?? 0;
      const cp = match?.cp ?? 0;
      const percent_change = cp ? ((ltp - cp) / cp) * 100 : 0;

      return {
        name: index.name,
        instrument_key: index.instrument_key,
        icon: index.icon,
        ltp,
        cp,
        percent_change: parseFloat(percent_change.toFixed(2)),
      };
    });
    // const results = await Promise.all(requests);
    // return results;
  } catch (err) {
    console.error("❌ Failed to fetch LTP data:", err);
    return [];
  }
}

export async function getLtpData(FixInfo: Info[]): Promise<FinalData[]> {
  try {
    const keys = FixInfo.map((i) => i.instrument_key).join(",");
    const res = await axios.get(`/api/getLTP/${encodeURIComponent(keys)}`);
    console.log("rsss", res.data);
    const data: LtpResponse[] = res.data;
    return FixInfo.map((index) => {
      const match = data.find((d) => d.instrument_key === index.instrument_key);
      const ltp = match?.last_price ?? 0;
      const cp = match?.cp ?? 0;
      const percent_change = cp ? ((ltp - cp) / cp) * 100 : 0;

      return {
        name: index.name,
        instrument_key: index.instrument_key,
        trading_symbol: index.trading_symbol,
        ltp,
        cp,
        percent_change: parseFloat(percent_change.toFixed(2)),
      };
    });
    // const results = await Promise.all(requests);
    // return results;
  } catch (err) {
    console.error("❌ Failed to fetch LTP data:", err);
    return [];
  }
}
async function getInstruments(
  userId: string
): Promise<string[] | "noWatchlists"> {
  console.log("in instr", userId);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/watchlist/getWatchlists?userId=${userId}`
  );
  console.log("getwatchlist", response);
  const data: Watchlist[] = await response.json();
  console.log("ndex data", data);
  const stocksWatchlist = data.find(
    (w) => w.watchlistName === "defaultWatchlist"
  );

  const displayStocks = stocksWatchlist
    ? stocksWatchlist.instrumentKeys
    : "noWatchlists"; // fallback

  return displayStocks;
}
export async function getFixWatchlist(userId: string): Promise<FinalData[]> {
  const instruments = await getInstruments(userId);
  console.log("insssss", instruments);
  if (instruments === "noWatchlists") {
    const Info = await getLtpData(defaultWatchlistStocks);
    return Info;
  }

  const WatchlistStocksInLtpStruncture = EQ_Stock.filter((stock: Info) =>
    instruments.some((item) => item === stock.instrument_key)
  ).map((stock: Info) => ({
    name: stock.name,
    instrument_key: stock.instrument_key,
    trading_symbol: stock.trading_symbol,
  }));
  const info = await getLtpData(WatchlistStocksInLtpStruncture);
  return info;
}
