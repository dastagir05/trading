const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface AdminProfile {
  _id: string;
  adminId: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  permissions: string[];
  lastLogin: string;
  totalLogins: number;
  actionsPerformed: number;
  usersManaged: number;
  systemChanges: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminLog {
  _id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  description: string;
  details: any;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  ipAddress: string;
  userAgent?: string;
  location?: {
    city?: string;
    country?: string;
    region?: string;
  };
  status: 'success' | 'failed' | 'warning' | 'error';
  errorMessage?: string;
  responseTime?: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  isSuspicious: boolean;
  deviceInfo?: {
    platform?: string;
    browser?: string;
    os?: string;
    deviceType?: string;
  };
  sessionId?: string;
  requestId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminActivitySummary {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  highRiskActions: number;
  suspiciousActions: number;
  actionsByType: string[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalAdmins: number;
  activeAdmins: number;
  systemHealth: string;
  serverLoad: number;
  databaseConnections: number;
  apiRequests: number;
  errorRate: number;
  uptime: number;
  lastBackup: string;
  recentAdminActivity: AdminLog[];
}

class AdminApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Admin Authentication
  async adminLogin(loginData: {
    name: string;
    email: string;
    image?: string;
    provider: string;
    providerId: string;
  }) {
    return this.makeRequest<{
      success: boolean;
      message: string;
      admin: AdminProfile;
    }>('/api/admin-auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async adminLogout(adminId: string) {
    return this.makeRequest<{
      success: boolean;
      message: string;
    }>('/api/admin/logout', {
      method: 'POST',
      body: JSON.stringify({ adminId }),
    });
  }

  // Admin Profile
  async getAdminProfile(adminId: string) {
    return this.makeRequest<{
      success: boolean;
      admin: AdminProfile;
    }>(`/api/admin/profile/${adminId}`);
  }

  // Admin Logs
  async getAdminLogs(
    adminId: string,
    params: {
      page?: number;
      limit?: number;
      action?: string;
      status?: string;
      riskLevel?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/admin/logs/${adminId}${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<{
      success: boolean;
      logs: AdminLog[];
      pagination: {
        current: number;
        pages: number;
        total: number;
      };
    }>(endpoint);
  }

  // Admin Activity Summary
  async getAdminActivitySummary(adminId: string, days: number = 30) {
    return this.makeRequest<{
      success: boolean;
      summary: AdminActivitySummary;
    }>(`/api/admin/activity/${adminId}?days=${days}`);
  }

  // Admin Dashboard Stats
  async getAdminStats() {
    return this.makeRequest<{
      success: boolean;
      data: AdminStats;
    }>('/api/admin/stats');
  }

  // User Management
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/admin/users${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<{
      success: boolean;
      users: any[];
      pagination: {
        current: number;
        pages: number;
        total: number;
      };
    }>(endpoint);
  }

  // Helper method to check admin permissions
  hasPermission(permissions: string[], requiredPermission: string): boolean {
    return permissions.includes(requiredPermission) || permissions.includes('super_admin');
  }

  // Helper method to format risk level for display
  getRiskLevelColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Helper method to format status for display
  getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}

export const adminApiService = new AdminApiService();
export default adminApiService;

