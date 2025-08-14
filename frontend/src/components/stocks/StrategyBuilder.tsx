import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  Settings, 
  Target, 
  BarChart3, 
  PieChart, 
  Activity, 
  Calendar, 
  Clock, 
  Info, 
  ZoomOut, 
  Save, 
  Download, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp,
  X,
  Edit3
} from 'lucide-react';

// Strategy types and data
const strategyTypes = [
  { id: 'bullish', label: 'Bullish', color: 'bg-green-100 text-green-700' },
  { id: 'bearish', label: 'Bearish', color: 'bg-red-100 text-red-700' },
  { id: 'neutral', label: 'Neutral', color: 'bg-blue-100 text-blue-700' },
  { id: 'others', label: 'Others', color: 'bg-purple-100 text-purple-700' }
];

const readyMadeStrategies = [
  { id: 'buy-call', name: 'Buy Call', type: 'bullish', chart: '📈' },
  { id: 'sell-put', name: 'Sell Put', type: 'bullish', chart: '📊' },
  { id: 'bull-call-spread', name: 'Bull Call Spread', type: 'bullish', chart: '📈' },
  { id: 'bull-put-spread', name: 'Bull Put Spread', type: 'bullish', chart: '📊' },
  { id: 'call-ratio-back-spread', name: 'Call Ratio Back Spread', type: 'bullish', chart: '📈' },
  { id: 'long-calendar-calls', name: 'Long Calendar with Calls', type: 'neutral', chart: '📊' },
  { id: 'bull-condor', name: 'Bull Condor', type: 'neutral', chart: '📈' },
  { id: 'bull-butterfly', name: 'Bull Butterfly', type: 'neutral', chart: '📊' },
  { id: 'range-forward', name: 'Range Forward', type: 'neutral', chart: '📈' },
  { id: 'long-synthetic-future', name: 'Long Synthetic Future', type: 'bullish', chart: '📊' }
];

const StrategyBuilderPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('buy-call');
  const [activeTab, setActiveTab] = useState('ready-made');
  const [selectedStrategyType, setSelectedStrategyType] = useState('bullish');
  const [showPayoffGraph, setShowPayoffGraph] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(24585.05);
  const [targetPrice, setTargetPrice] = useState(24585);
  const [expiryDate, setExpiryDate] = useState('14 Aug');

  // Strategy leg data
  const [strategyLegs, setStrategyLegs] = useState([
    {
      id: 1,
      side: 'B', // Buy
      expiry: '14 Aug',
      strike: 24600,
      type: 'CE', // Call European
      lots: 1,
      price: 82.4,
      multiplier: 1
    }
  ]);

  const tabs = [
    { id: 'ready-made', label: 'Ready-made' },
    { id: 'positions', label: 'Positions' },
    { id: 'saved-strategies', label: 'Saved Strategies' },
    { id: 'draft-positions', label: 'Draft Positions' }
  ];

  const payoffTabs = [
    { id: 'payoff-graph', label: 'Payoff Graph' },
    { id: 'pl-table', label: 'P&L Table' },
    { id: 'greeks', label: 'Greeks' },
    { id: 'strategy-chart', label: 'Strategy Chart' }
  ];

  const addStrategyLeg = () => {
    const newLeg = {
      id: strategyLegs.length + 1,
      side: 'B',
      expiry: '14 Aug',
      strike: 24600,
      type: 'CE',
      lots: 1,
      price: 82.4,
      multiplier: 1
    };
    setStrategyLegs([...strategyLegs, newLeg]);
  };

  const removeStrategyLeg = (id: number) => {
    setStrategyLegs(strategyLegs.filter(leg => leg.id !== id));
  };

  const updateStrategyLeg = (id: number, field: string, value: any) => {
    setStrategyLegs(strategyLegs.map(leg => 
      leg.id === id ? { ...leg, [field]: value } : leg
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}


      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Strategy Builder */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stock Selection */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">NIFTY {currentPrice}</div>
                  <div className="text-green-600 text-sm">+0.9%</div>
                </div>
                <button className="ml-auto p-2 hover:bg-gray-100 rounded">
                  <Settings className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Strategy Legs */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-600 border-b pb-2">
                  <div>B/S</div>
                  <div>Expiry</div>
                  <div>Strike</div>
                  <div>Type</div>
                  <div>Lots</div>
                  <div>Price</div>
                  <div></div>
                </div>

                {/* Strategy Legs */}
                {strategyLegs.map((leg) => (
                  <div key={leg.id} className="grid grid-cols-7 gap-2 items-center">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-1" defaultChecked />
                      <select 
                        value={leg.side}
                        onChange={(e) => updateStrategyLeg(leg.id, 'side', e.target.value)}
                        className={`text-xs px-1 py-1 rounded ${
                          leg.side === 'B' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <option value="B">B</option>
                        <option value="S">S</option>
                      </select>
                    </div>
                    
                    <select 
                      value={leg.expiry}
                      onChange={(e) => updateStrategyLeg(leg.id, 'expiry', e.target.value)}
                      className="text-xs border rounded px-1 py-1"
                    >
                      <option value="14 Aug">14 Aug</option>
                      <option value="21 Aug">21 Aug</option>
                      <option value="28 Aug">28 Aug</option>
                    </select>
                    
                    <input 
                      type="number"
                      value={leg.strike}
                      onChange={(e) => updateStrategyLeg(leg.id, 'strike', parseInt(e.target.value))}
                      className="text-xs border rounded px-1 py-1 w-full"
                    />
                    
                    <select 
                      value={leg.type}
                      onChange={(e) => updateStrategyLeg(leg.id, 'type', e.target.value)}
                      className="text-xs border rounded px-1 py-1"
                    >
                      <option value="CE">CE</option>
                      <option value="PE">PE</option>
                    </select>
                    
                    <input 
                      type="number"
                      value={leg.lots}
                      onChange={(e) => updateStrategyLeg(leg.id, 'lots', parseInt(e.target.value))}
                      className="text-xs border rounded px-1 py-1 w-full"
                    />
                    
                    <input 
                      type="number"
                      value={leg.price}
                      onChange={(e) => updateStrategyLeg(leg.id, 'price', parseFloat(e.target.value))}
                      className="text-xs border rounded px-1 py-1 w-full"
                      step="0.1"
                    />
                    
                    <button 
                      onClick={() => removeStrategyLeg(leg.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Multiplier and Premium */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Multiplier</span>
                    <select className="text-sm border rounded px-2 py-1">
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Price Pay</span>
                    <span className="font-semibold ml-2">82.4</span>
                    <span className="text-gray-600 ml-2">Premium Pay</span>
                    <span className="font-semibold ml-2">6,180</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <button className="flex-1 px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition-colors">
                    Add/Edit
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                    Add to Drafts
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Buy
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    •••
                  </button>
                </div>

                {/* Manual P/L */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span className="text-sm text-gray-600">Manual P/L</span>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <button className="text-blue-500 text-sm hover:underline">
                    Add Manual P/L
                  </button>
                </div>
              </div>
            </div>

            {/* Ready-made Strategies */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <div className="flex space-x-6 mb-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'text-blue-600 border-blue-600'
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'ready-made' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Please click on a ready-made strategy to load it
                    </p>
                    <div className="flex items-center space-x-2 mb-4">
                      <button className="text-blue-500 hover:underline text-sm">
                        Learn Options Strategies
                      </button>
                    </div>

                    {/* Strategy Type Filters */}
                    <div className="flex space-x-2 mb-4">
                      {strategyTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedStrategyType(type.id)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedStrategyType === type.id
                              ? type.color
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>

                    {/* Expiry Selection */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-sm text-gray-600">Expiry</span>
                      <select 
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="14 Aug">14 Aug</option>
                        <option value="21 Aug">21 Aug</option>
                        <option value="28 Aug">28 Aug</option>
                      </select>
                    </div>

                    {/* Strategy Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {readyMadeStrategies
                        .filter(strategy => selectedStrategyType === 'others' || strategy.type === selectedStrategyType)
                        .map((strategy) => (
                        <button
                          key={strategy.id}
                          onClick={() => setSelectedStrategy(strategy.id)}
                          className={`p-3 border rounded-lg text-left hover:border-blue-300 transition-colors ${
                            selectedStrategy === strategy.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="text-2xl mb-2">{strategy.chart}</div>
                          <div className="text-sm font-medium text-gray-900">
                            {strategy.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Strategy Metrics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Max Profit</div>
                  <div className="text-lg font-semibold text-green-600">Unlimited</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1 flex items-center">
                    Max Loss
                    <Info className="w-4 h-4 ml-1 text-gray-400" />
                  </div>
                  <div className="text-lg font-semibold text-red-600">-6,180(-101%)</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1 flex items-center">
                    Reward / Risk
                    <Info className="w-4 h-4 ml-1 text-gray-400" />
                  </div>
                  <div className="text-lg font-semibold">1/x</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">NA</div>
                  <div className="text-lg font-semibold">Funds & Margins</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1 flex items-center">
                    POP
                    <Info className="w-4 h-4 ml-1 text-gray-400" />
                  </div>
                  <div className="text-lg font-semibold">32%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Standalone Funds</div>
                  <div className="text-lg font-semibold">6,135</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1 flex items-center">
                    Time Value
                    <Info className="w-4 h-4 ml-1 text-gray-400" />
                  </div>
                  <div className="text-lg font-semibold">6,180</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Standalone Margin</div>
                  <div className="text-lg font-semibold">6,135</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Breakeven</div>
                  <div className="text-lg font-semibold">24682 (+0.4%)</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Target</div>
                  <div className="text-lg font-semibold">-</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Expiry</div>
                  <div className="text-lg font-semibold">-</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm text-gray-600 mb-1 flex items-center">
                  Intrinsic Value
                  <Info className="w-4 h-4 ml-1 text-gray-400" />
                </div>
                <div className="text-lg font-semibold">0</div>
              </div>
            </div>

            {/* Payoff Analysis */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-6">
                    {payoffTabs.map((tab) => (
                      <button
                        key={tab.id}
                        className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                          tab.id === 'payoff-graph'
                            ? 'text-blue-600 border-blue-600'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Add Booked P&L</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                    Payoff Graph
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm">
                    Payoff Table
                  </button>
                  <div className="ml-auto flex items-center space-x-4">
                    <select className="text-sm border rounded px-2 py-1">
                      <option>SD Fixed</option>
                      <option>SD Variable</option>
                    </select>
                    <select className="text-sm border rounded px-2 py-1">
                      <option>Open Interest</option>
                      <option>Volume</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payoff Graph */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span>OI data at 24600</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                      <span>Call OI 1.17Cr</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span>Put OI 64.47L</span>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                      <div className="w-3 h-1 bg-green-500"></div>
                      <span className="text-xs">On Expiry</span>
                      <div className="w-3 h-1 bg-blue-500"></div>
                      <span className="text-xs">On Target Date</span>
                    </div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Payoff Graph</h3>
                    <p className="text-gray-600 mb-4">
                      Interactive payoff graph showing profit/loss at different price levels
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <div>Current price: 24585.05</div>
                      <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                        Projected profit: 0 (0%)
                      </div>
                      <button className="flex items-center text-blue-500 hover:text-blue-700">
                        <ZoomOut className="w-4 h-4 mr-1" />
                        Zoom Out
                      </button>
                    </div>
                  </div>
                </div>

                {/* Target Controls */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">NIFTY Target</span>
                      <button className="text-blue-500 text-sm hover:underline">Reset</button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">0.0%</span>
                      <button className="p-1 border rounded">
                        <Minus className="w-3 h-3" />
                      </button>
                      <input 
                        type="number" 
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(parseInt(e.target.value))}
                        className="flex-1 text-center border rounded px-2 py-1"
                      />
                      <button className="p-1 border rounded">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <input type="range" className="w-full mt-2" min="23000" max="26000" value={targetPrice} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Date: 3D to expiry</span>
                      <button className="text-blue-500 text-sm hover:underline">Reset</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">11 Aug</span>
                      <span className="text-sm">Mon, 11 Aug 3:30 PM</span>
                      <span className="text-sm">14 Aug</span>
                    </div>
                    <input type="range" className="w-full mt-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Greeks and Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Strikewise IVs</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reset IVs</span>
                    <span className="text-sm">Greeks</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm w-12">Offset</span>
                      <button className="p-1 border rounded">
                        <Minus className="w-3 h-3" />
                      </button>
                      <input type="number" value="0" className="w-16 text-center border rounded px-2 py-1" />
                      <button className="p-1 border rounded">
                        <Plus className="w-3 h-3" />
                      </button>
                      <div className="ml-auto flex items-center space-x-2">
                        <input type="checkbox" />
                        <span className="text-sm">Multiply by Lot Size</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600 mb-2">
                      <div>Strike</div>
                      <div>Expiry</div>
                      <div>IV</div>
                      <div>Chg</div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>24600</div>
                      <div>14 Aug</div>
                      <div>11.1</div>
                      <div className="text-green-600">(+0.1)</div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Delta</span>
                      <span>0.45</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Theta</span>
                      <span>-16</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Decay</span>
                      <span>-11</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Gamma</span>
                      <span>0.0016</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Vega</span>
                      <span>9</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Target Day Futures Prices</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">14 Aug FUT</span>
                    <span className="font-medium">24566.20</span>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Standard Deviation</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600">
                        <div>SD</div>
                        <div>Points</div>
                        <div>Price</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>1 SD</div>
                        <div>380.4 (1.5%)</div>
                        <div>24204.7<br />24965.4</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>2 SD</div>
                        <div>760.7 (3.1%)</div>
                        <div>23824.3<br />25345.8</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <input type="checkbox" />
                      <span className="text-sm">Multiply by Number of Lots</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyBuilderPage;