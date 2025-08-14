import React from "react";
import { ChevronRight, Fuel, Cpu, Landmark } from "lucide-react";

// My Holdings Data
const myHoldings = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    qty: 50,
    avgPrice: 2650,
    ltp: 2847,
    change: 197,
    changePercent: 7.44,
    value: 142350,
    icon: <Fuel className="w-6 h-6 text-orange-600" />,
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    qty: 25,
    avgPrice: 3950,
    ltp: 4156,
    change: 206,
    changePercent: 5.22,
    value: 103900,
    icon: <Cpu className="w-6 h-6 text-blue-600" />,
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Limited",
    qty: 40,
    avgPrice: 1620,
    ltp: 1687,
    change: 67,
    changePercent: 4.14,
    value: 67480,
    icon: <Landmark className="w-6 h-6 text-red-600" />,
  },
  {
    symbol: "INFY",
    name: "Infosys Limited",
    qty: 30,
    avgPrice: 1750,
    ltp: 1834,
    change: 84,
    changePercent: 4.8,
    value: 55020,
    icon: <Cpu className="w-6 h-6 text-blue-500" />,
  },
];
const Watchlist = () => {
  return (
    <div>
      {" "}
      {/* My Holdings */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">My Holdings</h3>
            <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {myHoldings.map((stock, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div>{stock.icon}</div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {stock.symbol}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stock.qty} shares
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">₹{stock.ltp}</div>
                  <div className="text-green-600 text-sm font-medium">
                    +{stock.changePercent}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-green-600 hover:text-green-700 font-medium text-sm py-2">
            View all holdings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Watchlist;
