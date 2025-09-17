# Admin Frontend Integration Guide

## Overview
This guide explains how the frontend admin system is connected to the backend admin database and API endpoints.

## Frontend-Backend Integration

### 1. Authentication Flow
- **NextAuth Configuration**: Updated to use backend admin endpoints
- **Admin Login**: Uses `/api/admin-auth/login` endpoint
- **Session Management**: Stores admin data in NextAuth session
- **Logout**: Calls backend logout endpoint before NextAuth logout

### 2. API Service Layer
- **Location**: `src/services/adminApi.ts`
- **Purpose**: Centralized API calls to backend admin endpoints
- **Features**: Type-safe API calls, error handling, response formatting

### 3. Admin Components
- **AdminLogin**: Login interface with backend integration
- **AdminDashboard**: Main dashboard with real data from backend
- **AdminProfile**: Admin profile management
- **AdminActivity**: Activity logs and monitoring

## Setup Instructions

### 1. Environment Variables
Ensure these are set in your `.env.local` file:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. Backend Setup
First, set up the backend admin system:
```bash
cd backend
npm run setup-admin
```

### 3. Frontend Setup
The frontend is already configured. Just start the development server:
```bash
cd frontend
npm run dev
```

## API Endpoints Used

### Admin Authentication
- `POST /api/admin-auth/login` - Admin login
- `POST /api/admin-auth/logout` - Admin logout
- `GET /api/admin-auth/profile/:adminId` - Get admin profile
- `GET /api/admin-auth/logs/:adminId` - Get admin logs
- `GET /api/admin-auth/activity/:adminId` - Get activity summary

### Admin Dashboard
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get user management data

## Data Flow

### 1. Admin Login Process
1. User clicks "Sign in with Google" on `/admin/login`
2. Google OAuth flow completes
3. NextAuth calls backend `/api/admin-auth/login`
4. Backend creates/updates admin record
5. Backend returns admin data with permissions
6. NextAuth stores admin data in session
7. User redirected to `/admin` dashboard

### 2. Admin Dashboard Data
1. Dashboard loads and calls `/api/admin/stats`
2. Backend returns real-time statistics
3. Frontend displays data with charts and metrics
4. All admin actions are logged to backend

### 3. Activity Monitoring
1. Admin actions are logged to backend
2. Frontend fetches logs from `/api/admin-auth/logs/:adminId`
3. Real-time activity monitoring with filters
4. Risk level assessment and suspicious activity detection

## Features Implemented

### 1. Real-time Data
- Live statistics from backend database
- Real admin activity logs
- System health monitoring
- User management data

### 2. Security Features
- Email restriction (only pinjaridastageer@gmail.com)
- Permission-based access control
- Activity logging and monitoring
- Suspicious activity detection

### 3. Admin Management
- Profile management with backend data
- Activity logs with filtering
- Real-time statistics
- System monitoring

## Component Structure

```
src/components/Admin/
├── AdminLogin.tsx          # Login interface
├── AdminDashboard.tsx      # Main dashboard
├── AdminProfile.tsx        # Profile management
├── AdminActivity.tsx       # Activity monitoring
├── AdminUserManagement.tsx # User management
├── AdminSystemMonitor.tsx  # System monitoring
├── AdminAnalytics.tsx      # Analytics
└── AdminSettings.tsx       # Settings
```

## Type Safety

### Admin Types
```typescript
interface AdminProfile {
  _id: string;
  adminId: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  // ... more fields
}

interface AdminLog {
  _id: string;
  action: string;
  description: string;
  status: 'success' | 'failed' | 'warning' | 'error';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  // ... more fields
}
```

## Error Handling

### 1. API Errors
- Network errors are caught and displayed
- Backend errors are logged and shown to user
- Graceful fallbacks for failed requests

### 2. Authentication Errors
- Invalid email access is blocked
- Session validation on page load
- Automatic redirect to login on auth failure

### 3. Data Loading
- Loading states for all async operations
- Error states with retry options
- Empty states for no data

## Testing the Integration

### 1. Admin Login Test
1. Navigate to `/admin/login`
2. Click "Sign in with Google"
3. Use pinjaridastageer@gmail.com
4. Should redirect to admin dashboard

### 2. Dashboard Data Test
1. Check if statistics load from backend
2. Verify admin profile data
3. Check activity logs are populated

### 3. Activity Logging Test
1. Perform admin actions
2. Check activity logs update
3. Verify risk level assessment

## Troubleshooting

### Common Issues

1. **Admin login fails**
   - Check backend is running
   - Verify environment variables
   - Check Google OAuth configuration

2. **Dashboard data not loading**
   - Check backend API endpoints
   - Verify database connection
   - Check network requests in browser

3. **Activity logs empty**
   - Ensure admin actions are being logged
   - Check backend logging configuration
   - Verify admin ID in session

### Debug Steps

1. Check browser console for errors
2. Verify network requests in DevTools
3. Check backend logs for API errors
4. Verify database collections exist

## Security Considerations

1. **Email Validation**: Only authorized email can access admin
2. **Session Security**: Admin data stored securely in NextAuth
3. **API Security**: All admin endpoints require authentication
4. **Activity Logging**: All actions are logged for security audit

## Performance Optimization

1. **API Caching**: Consider implementing API response caching
2. **Pagination**: Activity logs use pagination for large datasets
3. **Lazy Loading**: Components load data only when needed
4. **Error Boundaries**: Graceful error handling throughout

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live updates
2. **Advanced Filtering**: More sophisticated log filtering
3. **Export Features**: Export admin logs and reports
4. **Mobile Responsiveness**: Better mobile admin interface
5. **Multi-admin Support**: Support for multiple admin users

## Support

For issues with the admin frontend integration:
1. Check this documentation
2. Review browser console errors
3. Check backend API responses
4. Verify environment configuration


