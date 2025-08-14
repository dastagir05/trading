"use client"
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Activity,
  MessageSquare,
  Plus,
  Trash2
} from 'lucide-react';

interface AiTradeDetail {
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
  marginUsed?: number;
  exitPrice?: number;
  exitTime?: Date;
  exitReason?: string;
  pnl?: number;
  netPnL?: number;
  percentPnL?: number;
  charges?: {
    brokerage: number;
    stt: number;
    gst: number;
    sebi: number;
    total: number;
  };
  aiVersion: string;
  modelUsed: string;
  suggestedAt: Date;
  activatedAt?: Date;
  completedAt?: Date;
  isValid: boolean;
  expiryDate?: Date;
  tags: string[];
  notes: {
    timestamp: Date;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }[];
}

interface AiTradeDetailProps {
  tradeId: string;
  onBack: () => void;
}

const AiTradeDetail: React.FC<AiTradeDetailProps> = ({ tradeId, onBack }) => {
  const [trade, setTrade] = useState<AiTradeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<AiTradeDetail>>({});
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'info' | 'warning' | 'error' | 'success'>('info');

  useEffect(() => {
    fetchTradeDetail();
  }, [tradeId]);

  const fetchTradeDetail = async () => {
    try {
      const response = await fetch(`/api/ai-trades/${tradeId}`);
      const data = await response.json();
      setTrade(data);
      setEditData(data);
    } catch (error) {
      console.error('Failed to fetch trade detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/ai-trades/${tradeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedTrade = await response.json();
        setTrade(updatedTrade);
        setEditData(updatedTrade);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update trade:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await fetch(`/api/ai-trades/${tradeId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newNote,
          type: noteType,
        }),
      });

      if (response.ok) {
        const updatedTrade = await response.json();
        setTrade(updatedTrade);
        setNewNote('');
        setNoteType('info');
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'suggested': return <Clock className="w-5 h-5 text-gray-500" />;
      case 'active': return <Activity className="w-5 h-5 text-blue-500" />;
      case 'target_hit': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'stoploss_hit': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'expired': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-gray-500" />;
      default: return <Minus className="w-5 h-5 text-gray-500" />;
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
      case 'bullish': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'bearish': return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'neutral': return <Minus className="w-5 h-5 text-gray-500" />;
      default: return <Minus className="w-5 h-5 text-gray-500" />;
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

  if (!trade) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Trade Not Found</h3>
        <p className="text-gray-500">The requested trade could not be found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{trade.title}</h2>
            <p className="text-gray-600">{trade.aiTradeId}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData(trade);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Status and Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            {getStatusIcon(trade.status)}
            <div>
              <h3 className="font-medium text-gray-900">Status</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trade.status)}`}>
                {trade.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Suggested:</span>
              <span className="font-medium">{new Date(trade.suggestedAt).toLocaleDateString()}</span>
            </div>
            {trade.activatedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Activated:</span>
                <span className="font-medium">{new Date(trade.activatedAt).toLocaleDateString()}</span>
              </div>
            )}
            {trade.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium">{new Date(trade.completedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            {getSentimentIcon(trade.sentiment)}
            <div>
              <h3 className="font-medium text-gray-900">Sentiment</h3>
              <span className="text-sm text-gray-600 capitalize">{trade.sentiment}</span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Confidence:</span>
              <span className="font-medium">{trade.confidence}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Risk Level:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(trade.riskLevel)}`}>
                {trade.riskLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="w-5 h-5 text-green-500" />
            <div>
              <h3 className="font-medium text-gray-900">Performance</h3>
              <span className="text-sm text-gray-600">P&L Details</span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            {trade.pnl !== undefined ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">P&L:</span>
                  <span className={`font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{trade.pnl.toLocaleString()}
                  </span>
                </div>
                {trade.percentPnL && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">% P&L:</span>
                    <span className={`font-medium ${trade.percentPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.percentPnL}%
                    </span>
                  </div>
                )}
              </>
            ) : (
              <span className="text-gray-500">No P&L data available</span>
            )}
          </div>
        </div>
      </div>

      {/* Trade Setup and Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Trade Setup</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Symbol:</span>
              <span className="font-medium">{trade.setup.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Strategy:</span>
              <span className="font-medium">{trade.setup.strategy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Price:</span>
              <span className="font-medium">₹{trade.setup.currentPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Strike:</span>
              <span className="font-medium">{trade.setup.strike}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expiry:</span>
              <span className="font-medium">{new Date(trade.setup.expiry).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Trade Plan</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Entry:</span>
              <span className="font-medium">₹{trade.tradePlan.entry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Target:</span>
              <span className="font-medium text-green-600">₹{trade.tradePlan.target}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stop Loss:</span>
              <span className="font-medium text-red-600">₹{trade.tradePlan.stopLoss}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Frame:</span>
              <span className="font-medium">{trade.tradePlan.timeFrame}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Logic */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Trade Logic</h3>
        <p className="text-gray-700 leading-relaxed">{trade.logic}</p>
      </div>

      {/* Execution Details */}
      {(trade.entryPrice || trade.exitPrice) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Execution Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trade.entryPrice && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Entry</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">₹{trade.entryPrice}</span>
                  </div>
                  {trade.entryTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{new Date(trade.entryTime).toLocaleString()}</span>
                    </div>
                  )}
                  {trade.quantity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{trade.quantity}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {trade.exitPrice && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Exit</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">₹{trade.exitPrice}</span>
                  </div>
                  {trade.exitTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{new Date(trade.exitTime).toLocaleString()}</span>
                    </div>
                  )}
                  {trade.exitReason && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium">{trade.exitReason}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Notes & Updates</h3>
          <div className="flex items-center space-x-2">
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </select>
            <input
              type="text"
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleAddNote}
              className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {trade.notes.map((note, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                note.type === 'info' ? 'bg-blue-500' :
                note.type === 'warning' ? 'bg-yellow-500' :
                note.type === 'error' ? 'bg-red-500' :
                'bg-green-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{note.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(note.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          
          {trade.notes.length === 0 && (
            <p className="text-gray-500 text-center py-4">No notes yet. Add your first note above.</p>
          )}
        </div>
      </div>

      {/* Tags */}
      {trade.tags.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {trade.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiTradeDetail;
