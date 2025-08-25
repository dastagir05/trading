"use client"
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Globe,
  Lock,
  Key,
  Server,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  database: {
    backupFrequency: string;
    backupRetention: number;
    autoOptimization: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    adminAlerts: boolean;
  };
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/settings`);
      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
      } else {
        console.error('Failed to fetch settings:', result.message);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (section: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

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
          <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
          <p className="text-sm text-gray-600">Configure system preferences and security settings</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSettings}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`p-4 rounded-lg border ${
          saveStatus === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            {saveStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 mr-2" />
            )}
            {saveStatus === 'success' ? 'Settings saved successfully!' : 'Failed to save settings. Please try again.'}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'general' && settings && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <input
                    type="text"
                    value={settings.general.siteDescription}
                    onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Maintenance Mode</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.debugMode}
                    onChange={(e) => handleSettingChange('general', 'debugMode', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Debug Mode</label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && settings && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Enable Two-Factor Authentication</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
                  <select
                    value={settings.security.passwordPolicy}
                    onChange={(e) => handleSettingChange('security', 'passwordPolicy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="weak">Weak</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                    <option value="very-strong">Very Strong</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && settings && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.email.smtpHost}
                    onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => handleSettingChange('email', 'smtpPort', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                  <input
                    type="text"
                    value={settings.email.smtpUser}
                    onChange={(e) => handleSettingChange('email', 'smtpUser', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                  <input
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input
                    type="text"
                    value={settings.email.fromName}
                    onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && settings && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Database Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                  <select
                    value={settings.database.backupFrequency}
                    onChange={(e) => handleSettingChange('database', 'backupFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backup Retention (days)</label>
                  <input
                    type="number"
                    value={settings.database.backupRetention}
                    onChange={(e) => handleSettingChange('database', 'backupRetention', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.database.autoOptimization}
                    onChange={(e) => handleSettingChange('database', 'autoOptimization', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Auto Database Optimization</label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && settings && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Email Notifications</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Push Notifications</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.adminAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'adminAlerts', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Admin Alerts</label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
