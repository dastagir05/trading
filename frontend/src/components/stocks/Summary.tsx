import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Building2,
  Factory,
  Landmark,
  Cpu,
  Car,
  Fuel,
  Pill,
  Smartphone
} from 'lucide-react';

interface StockData {
  symbol: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  dayData: {
    open: number;
    high: number;
    low: number;
    prevClose: number;
  };
  yearRange: {
    low: number;
    high: number;
    current: number;
  };
  constituents: {
    total: number;
    sectors: number;
    gainers: number;
    losers: number;
  };
  topStocks: Array<{
    symbol: string;
    exchange: string;
    weightage: number;
    price: number;
    change: number;
    changePercent: number;
  }>;
}

interface SummarySectionProps {
  stockData: StockData;
}

const getStockIcon = (symbol: string) => {
  const iconMap: { [key: string]: JSX.Element } = {
    'ICICIBANK': <Landmark className="w-6 h-6 text-blue-600" />,
    'INFY': <Cpu className="w-6 h-6 text-blue-500" />,
    'BHARTIARTL': <Smartphone className="w-6 h-6 text-red-500" />,
    'LT': <Factory className="w-6 h-6 text-orange-600" />,
    'RELIANCE': <Fuel className="w-6 h-6 text-orange-600" />,
    'TCS': <Cpu className="w-6 h-6 text-blue-600" />,
    'HDFCBANK': <Landmark className="w-6 h-6 text-red-600" />
  };
  return iconMap[symbol] || <Building2 className="w-6 h-6 text-gray-600" />;
};

const SummarySection: React.FC<SummarySectionProps> = ({ stockData }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const filters = [
    { id: 'all', label: 'All', count: stockData.constituents.total },
    { id: 'gainers', label: 'Gainers', count: stockData.constituents.gainers },
    { id: 'losers', label: 'Losers', count: stockData.constituents.losers }
  ];

  const filteredStocks = stockData.topStocks.filter(stock => {
    if (activeFilter === 'gainers') return stock.change > 0;
    if (activeFilter === 'losers') return stock.change < 0;
    return true;
  });

  // Calculate 52-week range position
  const rangePosition = ((stockData.yearRange.current - stockData.yearRange.low) / 
    (stockData.yearRange.high - stockData.yearRange.low)) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Day Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Open</div>
            <div className="text-xl font-semibold text-gray-900">
              {stockData.dayData.open.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">High</div>
            <div className="text-xl font-semibold text-gray-900">
              {stockData.dayData.high.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Low</div>
            <div className="text-xl font-semibold text-gray-900">
              {stockData.dayData.low.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Prev. close</div>
            <div className="text-xl font-semibold text-gray-900">
              {stockData.dayData.prevClose.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 52-Week Range */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">52-week (Low-High)</h3>
        <div className="space-y-4">
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-green-500 h-2 rounded-full relative"
                style={{ width: `${rangePosition}%` }}
              >
                <div className="absolute right-0 top-0 w-4 h-4 bg-white border-2 border-green-500 rounded-full transform -translate-y-1"></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-900">
              {stockData.yearRange.low.toLocaleString()}
            </span>
            <span className="font-medium text-gray-900">
              {stockData.yearRange.high.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Constituents Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              CONSTITUENTS
              <span className="ml-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600">
                ?
              </span>
            </h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-6 mb-4">
            <button className="text-white bg-gray-900 px-4 py-2 rounded-lg font-medium">
              Companies ({stockData.constituents.total})
            </button>
            <button className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg font-medium">
              Sectors ({stockData.constituents.sectors})
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-3">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === filter.id
                    ? filter.id === 'gainers' 
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : filter.id === 'losers'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Stocks List */}
        <div className="p-6">
          <div className="space-y-4">
            {filteredStocks.map((stock, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div>{getStockIcon(stock.symbol)}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{stock.symbol}</div>
                    <div className="text-sm text-gray-600">
                      {stock.exchange} • {stock.weightage}% weightage
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {stock.price.toLocaleString()}
                  </div>
                  <div className={`text-sm font-medium flex items-center ${
                    stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.change >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;