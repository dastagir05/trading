import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  Plus, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
  Zap,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

interface StockData {
  symbol: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StrategySectionProps {
  stockData: StockData;
}

// Mock strategy data
const strategies = [
  {
    id: 1,
    name: 'Bull Call Spread',
    type: 'Bullish',
    description: 'Limited risk, limited reward strategy for moderately bullish outlook',
    maxProfit: 2500,
    maxLoss: 1200,
    breakeven: 24650,
    probability: 68,
    premium: 850,
    legs: [
      { action: 'Buy', type: 'Call', strike: 24600, premium: 180 },
      { action: 'Sell', type: 'Call', strike: 24700, premium: 95 }
    ],
    riskLevel: 'Medium',
    timeDecay: 'Neutral',
    volatility: 'Benefits from low volatility'
  },
  {
    id: 2,
    name: 'Iron Condor',
    type: 'Neutral',
    description: 'Profit from low volatility and sideways movement',
    maxProfit: 1800,
    maxLoss: 800,
    breakeven: 24550,
    probability: 72,
    premium: 650,
    legs: [
      { action: 'Sell', type: 'Put', strike: 24500, premium: 120 },
      { action: 'Buy', type: 'Put', strike: 24450, premium: 85 },
      { action: 'Sell', type: 'Call', strike: 24650, premium: 110 },
      { action: 'Buy', type: 'Call', strike: 24700, premium: 75 }
    ],
    riskLevel: 'Low',
    timeDecay: 'Benefits',
    volatility: 'Benefits from low volatility'
  },
  {
    id: 3,
    name: 'Long Straddle',
    type: 'Volatile',
    description: 'Profit from large price movements in either direction',
    maxProfit: 'Unlimited',
    maxLoss: 2200,
    breakeven: 24400,
    probability: 45,
    premium: 2200,
    legs: [
      { action: 'Buy', type: 'Call', strike: 24600, premium: 180 },
      { action: 'Buy', type: 'Put', strike: 24600, premium: 165 }
    ],
    riskLevel: 'High',
    timeDecay: 'Hurts',
    volatility: 'Benefits from high volatility'
  }
];

const alerts = [
  {
    id: 1,
    type: 'Price Alert',
    condition: 'Above 25,000',
    status: 'Active',
    created: '2 days ago'
  },
  {
    id: 2,
    type: 'Volume Alert',
    condition: 'Volume > 1M',
    status: 'Triggered',
    created: '1 hour ago'
  }
];

const StrategySection: React.FC<StrategySectionProps> = ({ stockData }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [showCreateStrategy, setShowCreateStrategy] = useState(false);

  const getStrategyTypeColor = (type: string) => {
    switch (type) {
      case 'Bullish':
        return 'bg-green-100 text-green-700';
      case 'Bearish':
        return 'bg-red-100 text-red-700';
      case 'Neutral':
        return 'bg-blue-100 text-blue-700';
      case 'Volatile':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'High':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Strategy Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Options Strategies</h2>
            <p className="text-gray-600">Discover and create strategies for {stockData.symbol}</p>
          </div>
          
          <div className="flex space-x-3">
            <button className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              <Target className="w-5 h-5 mr-2" />
              Pick strategy
            </button>
            <button 
              onClick={() => setShowCreateStrategy(true)}
              className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Strategy
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Strategies */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recommended Strategies</h3>
          <p className="text-gray-600 mt-1">Based on current market conditions and volatility</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <div 
                key={strategy.id}
                className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                  selectedStrategy === strategy.id 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedStrategy(strategy.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">{strategy.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrategyTypeColor(strategy.type)}`}>
                    {strategy.type}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{strategy.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Profit:</span>
                    <span className="font-medium text-green-600">
                      {typeof strategy.maxProfit === 'number' 
                        ? `₹${strategy.maxProfit.toLocaleString()}` 
                        : strategy.maxProfit
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Loss:</span>
                    <span className="font-medium text-red-600">₹{strategy.maxLoss.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Breakeven:</span>
                    <span className="font-medium text-gray-900">{strategy.breakeven.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Probability:</span>
                    <span className="font-medium text-blue-600">{strategy.probability}%</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className={`font-medium ${getRiskLevelColor(strategy.riskLevel)}`}>
                      {strategy.riskLevel}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Time Decay: {strategy.timeDecay}</div>
                    <div>Volatility: {strategy.volatility}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategy Details */}
      {selectedStrategy && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Strategy Details</h3>
          </div>
          
          <div className="p-6">
            {(() => {
              const strategy = strategies.find(s => s.id === selectedStrategy);
              if (!strategy) return null;
              
              return (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{strategy.name} Legs</h4>
                    <div className="space-y-2">
                      {strategy.legs.map((leg, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              leg.action === 'Buy' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {leg.action}
                            </span>
                            <span className="font-medium">{leg.type}</span>
                            <span className="text-gray-600">Strike: {leg.strike}</span>
                          </div>
                          <span className="font-medium">₹{leg.premium}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Execute Strategy
                    </button>
                    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Save to Watchlist
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Price Alerts</h3>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                + Add Alert
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{alert.type}</div>
                      <div className="text-sm text-gray-600">{alert.condition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      alert.status === 'Active' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {alert.status}
                    </div>
                    <div className="text-xs text-gray-500">{alert.created}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Bell className="w-5 h-5 mr-2 text-gray-600" />
                <span className="font-medium">Alerts</span>
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Plus className="w-5 h-5 mr-2 text-gray-600" />
                <span className="font-medium">Follow</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategySection;