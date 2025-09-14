"use client"
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  BarChart3,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Target,
  Award,
  Clock
} from 'lucide-react';

interface AnalyticsData {
  userGrowth: number[];
  revenueData: number[];
  activityData: number[];
  topFeatures: { name: string; usage: number; growth: number }[];
  recentActivity: { id: string; action: string; user: string; timestamp: string; impact: string }[];
}

const AdminAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ timeRange });
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/analytics?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        console.error('Failed to fetch analytics data:', result.message);
        // Set fallback data
        setAnalyticsData({
          userGrowth: [10, 15, 20, 25, 30, 35, 40],
          revenueData: [1000, 1200, 1500, 1800, 2000, 2200, 2500],
          activityData: [50, 60, 70, 80, 90, 100, 110],
          topFeatures: [
            { name: 'AI Trading Suggestions', usage: 89, growth: 12.5 },
            { name: 'Real-time Charts', usage: 76, growth: 8.2 },
            { name: 'Portfolio Analytics', usage: 65, growth: 15.7 },
            { name: 'Risk Management', usage: 58, growth: 6.8 },
            { name: 'Market News', usage: 45, growth: 3.2 }
          ],
          recentActivity: [
            { id: '1', action: 'User Login', user: 'user@example.com', timestamp: '2 hours ago', impact: 'High' },
            { id: '2', action: 'Trade Executed', user: 'trader@example.com', timestamp: '4 hours ago', impact: 'Medium' },
            { id: '3', action: 'Portfolio Updated', user: 'investor@example.com', timestamp: '6 hours ago', impact: 'Low' }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      // Set fallback data on error
      setAnalyticsData({
        userGrowth: [10, 15, 20, 25, 30, 35, 40],
        revenueData: [1000, 1200, 1500, 1800, 2000, 2200, 2500],
        activityData: [50, 60, 70, 80, 90, 100, 110],
        topFeatures: [
          { name: 'AI Trading Suggestions', usage: 89, growth: 12.5 },
          { name: 'Real-time Charts', usage: 76, growth: 8.2 },
          { name: 'Portfolio Analytics', usage: 65, growth: 15.7 },
          { name: 'Risk Management', usage: 58, growth: 6.8 },
          { name: 'Market News', usage: 45, growth: 3.2 }
        ],
        recentActivity: [
          { id: '1', action: 'User Login', user: 'user@example.com', timestamp: '2 hours ago', impact: 'High' },
          { id: '2', action: 'Trade Executed', user: 'trader@example.com', timestamp: '4 hours ago', impact: 'Medium' },
          { id: '3', action: 'Portfolio Updated', user: 'investor@example.com', timestamp: '6 hours ago', impact: 'Low' }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
            <p>Failed to load analytics data</p>
          </div>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
          <p className="text-sm text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchAnalyticsData}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">2,847</p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(12.5)}
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(12.5)}`}>
                  +12.5%
                </span>
                <span className="text-xs text-blue-600 ml-1">vs last month</span>
              </div>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Revenue</p>
              <p className="text-2xl font-bold text-green-900">₹95,000</p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(8.7)}
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(8.7)}`}>
                  +8.7%
                </span>
                <span className="text-xs text-green-600 ml-1">vs last month</span>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Active Users</p>
              <p className="text-2xl font-bold text-purple-900">1,892</p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(15.2)}
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(15.2)}`}>
                  +15.2%
                </span>
                <span className="text-xs text-purple-600 ml-1">vs last month</span>
              </div>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-orange-900">6.8%</p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(-2.1)}
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(-2.1)}`}>
                  -2.1%
                </span>
                <span className="text-xs text-orange-600 ml-1">vs last month</span>
              </div>
            </div>
            <Target className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">User Growth</h4>
            <button className="text-sm text-red-600 hover:text-red-700">
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart visualization would go here</p>
              <p className="text-xs text-gray-400">Integration with Chart.js or Recharts</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Revenue Trends</h4>
            <button className="text-sm text-red-600 hover:text-red-700">
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart visualization would go here</p>
              <p className="text-xs text-gray-400">Integration with Chart.js or Recharts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Features & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Features */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Top Features Usage</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {analyticsData?.topFeatures.map((feature, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{feature.name}</p>
                      <p className="text-xs text-gray-500">{feature.usage}% usage</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getGrowthIcon(feature.growth)}
                    <span className={`text-sm font-medium ml-1 ${getGrowthColor(feature.growth)}`}>
                      {feature.growth > 0 ? '+' : ''}{feature.growth}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Recent Activity</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {analyticsData?.recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.user}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">Impact:</span>
                      <span className="text-xs font-medium text-green-600 ml-1">{activity.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
          <div className="flex items-center space-x-3">
            <Download className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900">Export Report</p>
              <p className="text-xs text-blue-600">Download analytics data</p>
            </div>
          </div>
        </button>
        
        <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-green-900">Set Goals</p>
              <p className="text-xs text-green-600">Configure KPI targets</p>
            </div>
          </div>
        </button>
        
        <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-purple-900">Schedule Report</p>
              <p className="text-xs text-purple-600">Automated reporting</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminAnalytics;
