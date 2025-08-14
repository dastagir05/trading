"use client"
import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Target, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Settings,
  Bell,
  Download,
  Upload,
  RefreshCw,
  Zap,
  Brain,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  disabled?: boolean;
}

interface AiTradeQuickActionsProps {
  onAction: (action: string, data?: any) => void;
  isSystemActive?: boolean;
  isMonitoring?: boolean;
  hasActiveTrades?: boolean;
  hasPendingTrades?: boolean;
}

const AiTradeQuickActions: React.FC<AiTradeQuickActionsProps> = ({
  onAction,
  isSystemActive = true,
  isMonitoring = true,
  hasActiveTrades = false,
  hasPendingTrades = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: string, data?: any) => {
    setIsProcessing(true);
    try {
      await onAction(action, data);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'toggle-monitoring',
      label: isMonitoring ? 'Pause Monitoring' : 'Resume Monitoring',
      description: isMonitoring ? 'Pause real-time monitoring' : 'Resume real-time monitoring',
      icon: isMonitoring ? Pause : Play,
      color: isMonitoring ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600',
      action: () => handleAction('toggle-monitoring')
    },
    {
      id: 'force-process',
      label: 'Force Process',
      description: 'Manually process pending AI suggestions',
      icon: Zap,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => handleAction('force-process'),
      disabled: !hasPendingTrades
    },
    {
      id: 'activate-trades',
      label: 'Activate Trades',
      description: 'Activate suggested trades',
      icon: Play,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => handleAction('activate-trades'),
      disabled: !hasPendingTrades
    },
    {
      id: 'set-alerts',
      label: 'Set Alerts',
      description: 'Configure price and time alerts',
      icon: Bell,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => handleAction('set-alerts'),
      disabled: !hasActiveTrades
    },
    {
      id: 'modify-targets',
      label: 'Modify Targets',
      description: 'Update target and stop loss levels',
      icon: Target,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => handleAction('modify-targets'),
      disabled: !hasActiveTrades
    },
    {
      id: 'export-data',
      label: 'Export Data',
      description: 'Export trade data and reports',
      icon: Download,
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => handleAction('export-data')
    },
    {
      id: 'import-data',
      label: 'Import Data',
      description: 'Import external trade data',
      icon: Upload,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      action: () => handleAction('import-data')
    },
    {
      id: 'refresh-data',
      label: 'Refresh Data',
      description: 'Manually refresh all data',
      icon: RefreshCw,
      color: 'bg-teal-500 hover:bg-teal-600',
      action: () => handleAction('refresh-data')
    }
  ];

  const systemActions: QuickAction[] = [
    {
      id: 'system-settings',
      label: 'System Settings',
      description: 'Configure AI trade system parameters',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => handleAction('system-settings')
    },
    {
      id: 'ai-config',
      label: 'AI Configuration',
      description: 'Adjust AI model parameters',
      icon: Brain,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => handleAction('ai-config')
    },
    {
      id: 'performance-review',
      label: 'Performance Review',
      description: 'Review and analyze system performance',
      icon: TrendingUp,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => handleAction('performance-review')
    }
  ];

  const statusActions: QuickAction[] = [
    {
      id: 'target-hit',
      label: 'Mark Target Hit',
      description: 'Mark trade as target achieved',
      icon: CheckCircle,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => handleAction('target-hit'),
      disabled: !hasActiveTrades
    },
    {
      id: 'stop-loss-hit',
      label: 'Mark Stop Loss',
      description: 'Mark trade as stop loss hit',
      icon: Shield,
      color: 'bg-red-500 hover:bg-red-600',
      action: () => handleAction('stop-loss-hit'),
      disabled: !hasActiveTrades
    },
    {
      id: 'expire-trade',
      label: 'Expire Trade',
      description: 'Mark trade as expired',
      icon: Clock,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      action: () => handleAction('expire-trade'),
      disabled: !hasActiveTrades
    },
    {
      id: 'cancel-trade',
      label: 'Cancel Trade',
      description: 'Cancel pending or active trade',
      icon: XCircle,
      color: 'bg-red-500 hover:bg-red-600',
      action: () => handleAction('cancel-trade'),
      disabled: !hasActiveTrades && !hasPendingTrades
    }
  ];

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isSystemActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              System Status: {isSystemActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-gray-500">Monitoring</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${hasActiveTrades ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-gray-500">Active Trades</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${hasPendingTrades ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-gray-500">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            disabled={action.disabled || isProcessing}
            className={`p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 ${
              action.disabled 
                ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                : 'bg-white hover:border-gray-300'
            } ${isProcessing ? 'cursor-wait' : ''}`}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color} transition-colors`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">{action.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Trade Status Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Trade Status Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {statusActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              disabled={action.disabled || isProcessing}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                action.disabled 
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
                  : `${action.color} text-white hover:shadow-md`
              } ${isProcessing ? 'cursor-wait' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <action.icon className="w-4 h-4" />
                <span>{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* System Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-4">System Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {systemActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                action.color
              } text-white hover:shadow-md ${isProcessing ? 'cursor-wait' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <action.icon className="w-4 h-4" />
                <span>{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-gray-700">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiTradeQuickActions;
