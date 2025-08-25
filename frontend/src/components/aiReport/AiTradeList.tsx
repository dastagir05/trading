"use client"
import React, { useState, useEffect } from 'react';
import axios from "axios"
import { 
  Search, 
  Filter, 
  SortAsc, 
  Eye, 
  Edit, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Target,
  Shield
} from 'lucide-react';

interface AiTrade {
  _id: string;
  aiTradeId: string;
  title: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  setup: {
    currentPrice: number;
    strategy: string;
    strike: string;
    expiry: string;
    symbol: string;
    instrumentKey: string;
  };
  tradePlan: {
    entry: string;
    target: string;
    stopLoss: string;
    timeFrame: string;
  };
  logic: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'suggested' | 'active' | 'target_hit' | 'stoploss_hit' | 'expired' | 'cancelled';
  entryPrice?: number;
  entryTime?: Date;
  quantity?: number;
  exitPrice?: number;
  exitTime?: Date;
  pnl?: number;
  percentPnL?: number;
  suggestedAt: Date;
  activatedAt?: Date;
  completedAt?: Date;
  tags: string[];
}

const AiTradeList: React.FC = () => {
  const [trades, setTrades] = useState<AiTrade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<AiTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('suggestedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    filterAndSortTrades();
  }, [trades, searchTerm, statusFilter, sentimentFilter, riskFilter, sortBy, sortOrder]);

  const fetchTrades = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai-trades?status=all`);
      setTrades(res.data.data);
    } catch (error) {
      console.error('Failed to fetch AI trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTrades = () => {
    let filtered = trades.filter(trade => {
      const matchesSearch = trade.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trade.setup.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;
      const matchesSentiment = sentimentFilter === 'all' || trade.sentiment === sentimentFilter;
      const matchesRisk = riskFilter === 'all' || trade.riskLevel === riskFilter;
      
      return matchesSearch && matchesStatus && matchesSentiment && matchesRisk;
    });

    // Sort trades
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'suggestedAt':
          aValue = new Date(a.suggestedAt);
          bValue = new Date(b.suggestedAt);
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'pnl':
          aValue = a.pnl || 0;
          bValue = b.pnl || 0;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        default:
          aValue = a[sortBy as keyof AiTrade];
          bValue = b[sortBy as keyof AiTrade];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTrades(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'suggested': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'active': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'target_hit': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'stoploss_hit': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'suggested': return 'bg-gray-100 text-gray-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'target_hit': return 'bg-green-100 text-green-700';
      case 'stoploss_hit': return 'bg-red-100 text-red-700';
      case 'expired': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'neutral': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">All AI Trades</h2>
          <p className="text-gray-600">Manage and monitor all AI-generated trade suggestions</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search trades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="suggested">Suggested</option>
            <option value="active">Active</option>
            <option value="target_hit">Target Hit</option>
            <option value="stoploss_hit">Stop Loss Hit</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Sentiment</option>
            <option value="bullish">Bullish</option>
            <option value="bearish">Bearish</option>
            <option value="neutral">Neutral</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Risk</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="suggestedAt">Date</option>
            <option value="confidence">Confidence</option>
            <option value="pnl">P&L</option>
            <option value="title">Title</option>
          </select>
        </div>

        {/* Sort Order Toggle */}
        <div className="mt-4 flex items-center space-x-2">
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <SortAsc className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredTrades.length} of {trades.length} trades
      </div>

      {/* Trades Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trade Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Setup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrades.map((trade) => (
                <tr key={trade._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getSentimentIcon(trade.sentiment)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {trade.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {trade.setup.symbol} • {trade.aiTradeId}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(trade.riskLevel)}`}>
                            {trade.riskLevel}
                          </span>
                          <span className="text-xs text-gray-500">
                            {trade.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <p><strong>Strategy:</strong> {trade.setup.strategy}</p>
                      <p><strong>Current:</strong> ₹{trade.setup.currentPrice}</p>
                      <p><strong>Strike:</strong> {trade.setup.strike}</p>
                      <p><strong>Expiry:</strong> {new Date(trade.setup.expiry).toLocaleDateString()}</p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <p><strong>Entry:</strong> {trade.tradePlan.entry}</p>
                      <p><strong>Target:</strong> {trade.tradePlan.target}</p>
                      <p><strong>Stop Loss:</strong> {trade.tradePlan.stopLoss}</p>
                      {/* <p><strong>Time Frame:</strong> {trade.tradePlan.timeFrame}</p> */}
                      <p><strong>Exit Price:</strong> {trade?.exitPrice || "-"}</p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(trade.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trade.status)}`}>
                        {trade.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(trade.suggestedAt).toLocaleDateString()}
                    </p>
                  </td>
                  
                  <td className="px-6 py-4">
                    {trade.pnl !== undefined ? (
                      <div className="text-sm">
                        <p className={`font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{trade.pnl.toLocaleString()}
                        </p>
                        {trade.percentPnL && (
                          <p className={`text-xs ${trade.percentPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trade.percentPnL}%
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredTrades.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trades found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
};

export default AiTradeList;
