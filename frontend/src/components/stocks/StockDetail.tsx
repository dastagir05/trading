"use client"
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Star, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Chart from '../chart/ClaudeBad';
import SummarySection from './Summary';
import StrategySection from './Strategy';
import StrategyBuilderPage from './StrategyBuilder';

// Mock stock data - this would come from your API
const stockData = {
  symbol: 'NIFTY 50',
  exchange: 'NSE',
  price: 24574.20,
  change: -75.35,
  changePercent: -0.31,
  dayData: {
    open: 24641.35,
    high: 24671.40,
    low: 24539.20,
    prevClose: 24649.55
  },
  yearRange: {
    low: 21743.65,
    high: 26277.35,
    current: 24574.20
  },
  constituents: {
    total: 50,
    sectors: 15,
    gainers: 13,
    losers: 37
  },
  topStocks: [
    {
      symbol: 'ICICIBANK',
      exchange: 'NSE',
      weightage: 9.41,
      price: 1443.60,
      change: -0.80,
      changePercent: -0.06
    },
    {
      symbol: 'INFY',
      exchange: 'NSE',
      weightage: 4.84,
      price: 1436.70,
      change: -23.60,
      changePercent: -1.62
    },
    {
      symbol: 'BHARTIARTL',
      exchange: 'NSE',
      weightage: 4.65,
      price: 1929.70,
      change: -2.10,
      changePercent: -0.11
    },
    {
      symbol: 'LT',
      exchange: 'NSE',
      weightage: 4.32,
      price: 3628.40,
      change: 15.20,
      changePercent: 0.42
    }
  ]
};

interface StockDetailPageProps {
  onBack?: () => void;
}

const StockDetailPage: React.FC<StockDetailPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isFollowing, setIsFollowing] = useState(false);

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'charts', label: 'Charts' },
    { id: 'options', label: 'Option chain' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'strategy builder', label: 'Strategy Builder'},
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <SummarySection stockData={stockData} />;
      case 'charts':
        return <Chart />;
      case 'strategy builder':
        return <StrategyBuilderPage />;
      case 'options':
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Options Chain</h3>
            <p className="text-gray-600">Options component will be integrated here</p>
          </div>
        );
      case 'strategy':
        return <StrategySection stockData={stockData} />;
      default:
        return <SummarySection stockData={stockData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{stockData.symbol}</h1>
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`p-2 rounded-lg transition-colors ${
                      isFollowing 
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${isFollowing ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <p className="text-gray-600">{stockData.exchange}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {stockData.price.toLocaleString()}
                </div>
                <div className={`flex items-center text-lg font-medium ${
                  stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stockData.change >= 0 ? (
                    <ArrowUpRight className="w-5 h-5 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 mr-1" />
                  )}
                  {stockData.change >= 0 ? '+' : ''}{stockData.change} ({stockData.changePercent}%)
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default StockDetailPage;