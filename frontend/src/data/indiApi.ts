// utils/topData.ts
import axios from "axios";
export type TrendingStockItem = {
  ticker_id: string;
  company_name: string;
  price: string; // or number if you parse it
  percent_change: string;
  net_change: string;
  bid: string;
  ask: string;
  high: string;
  low: string;
  open: string;
  low_circuit_limit: string;
  up_circuit_limit: string;
  volume: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM:SS"
  close: string;
  bid_size: string;
  ask_size: string;
  exchange_type: string;
  lot_size: string;
  overall_rating: string;
  short_term_trends: string;
  long_term_trends: string;
  year_low: string;
  year_high: string;
  ric: string;
};
export type WeekHighLowItem = {
  ticker: string;
  company: string;
  price: number;
  "52_week_high"?: number;
  "52_week_low"?: number;
};

export type TrendingStocks = {
  trending_stocks: {
    top_gainers: TrendingStockItem[];
    top_losers: TrendingStockItem[];
  };
};

export type FTWeekHighLow = {
  BSE_52WeekHighLow: {
    high52Week: WeekHighLowItem[];
    low52Week: WeekHighLowItem[];
  };
  NSE_52WeekHighLow: {
    high52Week: WeekHighLowItem[];
    low52Week: WeekHighLowItem[];
  };
};

export async function getGainersData() {
  try {
    const [indianApiRes, ftHighRes] = await Promise.all([
      axios.get("/api/indianApi"),
      axios.get("/api/ftHigh"),
    ]);

    const data: TrendingStocks = indianApiRes.data;
    const fthigh: FTWeekHighLow = ftHighRes.data;

    const TopGainers = data.trending_stocks.top_gainers || [];
    const BSEHigh52Week = fthigh.BSE_52WeekHighLow.high52Week || [];
    const NSEHigh52Week = fthigh.NSE_52WeekHighLow.high52Week || [];

    return {
      TopGainers,
      BSEHigh52Week,
      NSEHigh52Week,
    };
  } catch (error) {
    console.error("Failed to fetch top data:", error);
    return {
      TopGainers: [],
      NSEHigh52Week: [],
      BSEHigh52Week: [],
    };
  }
}

export async function getLosersData() {
  try {
    const [indianApiRes, ftHighRes] = await Promise.all([
      axios.get("/api/indianApi"),
      axios.get("/api/ftHigh"),
    ]);

    const data: TrendingStocks = indianApiRes.data;
    const fthigh: FTWeekHighLow = ftHighRes.data;

    const TopLosers = data.trending_stocks.top_losers || [];
    const BSELow52Week = fthigh.BSE_52WeekHighLow.low52Week || [];
    const NSELow52Week = fthigh.NSE_52WeekHighLow.low52Week || [];

    return {
      TopLosers,
      BSELow52Week,
      NSELow52Week,
    };
  } catch (error) {
    console.error("Failed to fetch top data:", error);
    return {
      TopLosers: [],
      BSELow52Week: [],
      NSELow52Week: [],
    };
  }
}

//working
// export async function getNSEActiveData(): Promise<{
//   NSEMostActive: Array<any>;
// }> {
//   const options = {
//     method: "GET",
//     url: "https://stock.indianapi.in/NSE_most_active",
//     headers: {
//       "X-Api-Key": "sk-live-wiTiSrnpP5HuLD7pgq3hAqblBitKKnp3NbPQU0YT",
//     },
//   };

//   try {
//     const { data } = await axios.request(options);

//     const res: Array<any> = data;
//     const NSEMostActive = res || [];

//     return {
//       NSEMostActive,
//     };
//   } catch (error) {
//     console.error("Failed to fetch top data:", error);
//     return {
//       NSEMostActive: [],
//     };
//   }
// }
