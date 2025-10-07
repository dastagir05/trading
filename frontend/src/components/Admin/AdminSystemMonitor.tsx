"use client";
import React, { useState, useEffect } from "react";
import {
  Activity,
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  TrendingUp,
  TrendingDown,
  Zap,
  Gauge,
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  icon: string;
  service?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "critical";
  message: string;
  service: string;
}

const AdminSystemMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    fetchSystemLogs();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSystemMetrics();
      fetchSystemLogs();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/system/metrics`
      );
      const result = await response.json();

      if (result.success) {
        setMetrics(result.data);
      } else {
        console.error("Failed to fetch system metrics:", result.message);
      }
    } catch (error) {
      console.error("Failed to fetch system metrics:", error);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/system/logs`
      );
      const result = await response.json();

      if (result.success) {
        setLogs(result.data);
      } else {
        console.error("Failed to fetch system logs:", result.message);
      }
    } catch (error) {
      console.error("Failed to fetch system logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case "stable":
        return (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent border-r-transparent border-l-transparent"></div>
        );
      default:
        return null;
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Cpu":
        return Cpu;
      case "HardDrive":
        return HardDrive;
      case "Database":
        return Database;
      case "Wifi":
        return Wifi;
      case "Globe":
        return Globe;
      case "Zap":
        return Zap;
      default:
        return Activity;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "info":
        return "text-blue-600 bg-blue-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "critical":
        return "text-red-800 bg-red-200";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            System Monitor
          </h3>
          <p className="text-sm text-gray-600">
            Real-time system health and performance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Activity
              className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-pulse" : ""}`}
            />
            {autoRefresh ? "Live" : "Paused"}
          </button>
          <button
            onClick={() => {
              fetchSystemMetrics();
              fetchSystemLogs();
            }}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {React.createElement(getIconComponent(metric.icon), {
                    className: "w-5 h-5 text-gray-600",
                  })}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {metric.name}
                  </h4>
                  <p className="text-xs text-gray-500">{metric.service}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(metric.trend)}
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    metric.status
                  )}`}
                >
                  {metric.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {metric.value}
                  {metric.unit}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metric.status === "normal"
                      ? "bg-green-500"
                      : metric.status === "warning"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(metric.value, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Logs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">System Logs</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      log.level === "info"
                        ? "bg-blue-500"
                        : log.level === "warning"
                        ? "bg-yellow-500"
                        : log.level === "error"
                        ? "bg-red-500"
                        : "bg-red-700"
                    }`}
                  ></div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getLogLevelColor(
                            log.level
                          )}`}
                        >
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {log.service}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{log.message}</p>
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
            <Server className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900">
                Restart Services
              </p>
              <p className="text-xs text-blue-600">
                Restart all system services
              </p>
            </div>
          </div>
        </button>

        <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-green-900">
                Backup Database
              </p>
              <p className="text-xs text-green-600">Create system backup</p>
            </div>
          </div>
        </button>

        <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
          <div className="flex items-center space-x-3">
            <Gauge className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-purple-900">
                Performance Test
              </p>
              <p className="text-xs text-purple-600">Run system diagnostics</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminSystemMonitor;
