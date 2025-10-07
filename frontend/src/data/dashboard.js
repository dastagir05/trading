import {
  Activity,
  Factory,
  Car,
  Pill,
  Smartphone,
  Home,
  ShoppingCart,
} from "lucide-react";

// Stocks in News Data
const stocksInNews = [
  {
    symbol: "NARAYANHRD",
    name: "Narayana Hrudayalaya",
    price: "₹2,007.00",
    change: "36.90",
    changePercent: "1.87%",
    positive: true,
    icon: <Activity className="w-8 h-8 text-red-500" />,
    news: "Q3 results beat estimates with 15% revenue growth",
  },
  {
    symbol: "ADANIPORTS",
    name: "Adani Ports &Special",
    price: "₹1,431.70",
    change: "-11.40",
    changePercent: "-0.79%",
    positive: false,
    icon: <Factory className="w-8 h-8 text-blue-600" />,
    news: "Announces new port acquisition in Gujarat",
  },
  {
    symbol: "PAYTM",
    name: "Paytm",
    price: "₹951.15",
    change: "10.60",
    changePercent: "1.13%",
    positive: true,
    icon: <Smartphone className="w-8 h-8 text-blue-500" />,
    news: "RBI approves new payment gateway license",
  },
  {
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever",
    price: "₹2,519.60",
    change: "111.20",
    changePercent: "4.62%",
    positive: true,
    icon: <ShoppingCart className="w-8 h-8 text-blue-600" />,
    news: "Launches new sustainable product line",
  },
];

// Watchlist Data
const watchlistStocks = [
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
    ltp: 1234,
    change: 45.67,
    changePercent: 3.84,
    icon: <Smartphone className="w-6 h-6 text-red-500" />,
  },
  {
    symbol: "MARUTI",
    name: "Maruti Suzuki India",
    ltp: 9876,
    change: -123.45,
    changePercent: -1.23,
    icon: <Car className="w-6 h-6 text-blue-600" />,
  },
  {
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical",
    ltp: 1456,
    change: 23.45,
    changePercent: 1.64,
    icon: <Pill className="w-6 h-6 text-orange-500" />,
  },
  {
    symbol: "NESTLEIND",
    name: "Nestle India Limited",
    ltp: 2345,
    change: -34.56,
    changePercent: -1.45,
    icon: <ShoppingCart className="w-6 h-6 text-red-600" />,
  },
  {
    symbol: "ASIANPAINT",
    name: "Asian Paints Limited",
    ltp: 3456,
    change: 67.89,
    changePercent: 2.0,
    icon: <Home className="w-6 h-6 text-yellow-600" />,
  },
];

// Market News Data
const marketNews = [
  {
    title: "RBI keeps repo rate unchanged at 6.5% for 6th consecutive time",
    summary:
      "The central bank maintains its stance on monetary policy amid inflation concerns",
    time: "2 hours ago",
    source: "Economic Times",
    category: "Policy",
  },
  {
    title: "Nifty 50 hits fresh all-time high, crosses 19,700 mark",
    summary:
      "Strong buying in banking and IT stocks drives the benchmark index higher",
    time: "4 hours ago",
    source: "Business Standard",
    category: "Markets",
  },
  {
    title: "Foreign investors turn net buyers after 3 months of selling",
    summary: "FIIs invest ₹2,847 crore in Indian equities this week",
    time: "6 hours ago",
    source: "Mint",
    category: "Investment",
  },
  {
    title: "IT sector outlook remains positive despite global headwinds",
    summary: "Analysts expect strong Q3 results from major IT companies",
    time: "8 hours ago",
    source: "Moneycontrol",
    category: "Sector",
  },
];

export { stocksInNews, watchlistStocks, marketNews };
