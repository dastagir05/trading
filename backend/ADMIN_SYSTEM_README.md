# Admin System Documentation

## Overview
A comprehensive admin system with database collections, logging, and security features for the trading platform.

## Database Collections

### 1. Admin Collection (`admins`)
Stores admin user information and permissions.

**Schema Fields:**
- `name` - Admin's full name
- `email` - Admin's email (unique)
- `image` - Profile image URL
- `provider` - OAuth provider (google, github, local)
- `providerId` - Provider-specific ID
- `adminId` - Auto-generated admin ID (format: ADM_timestamp_random)
- `role` - Admin role (super_admin, admin, moderator)
- `permissions` - Array of permission strings
- `totalLogins` - Total login count
- `lastLogin` - Last login timestamp
- `lastLoginIP` - Last login IP address
- `lastActivity` - Last activity timestamp
- `isActive` - Account status
- `twoFactorEnabled` - 2FA status
- `loginAttempts` - Failed login attempts
- `lockUntil` - Account lock expiry
- `actionsPerformed` - Total actions performed
- `usersManaged` - Users managed count
- `systemChanges` - System changes count
- `lastLoginLocation` - Geographic location
- `deviceInfo` - Device information
- `createdBy` - Creator admin ID
- `notes` - Admin notes

### 2. AdminLog Collection (`admin_logs`)
Tracks all admin activities and system events.

**Schema Fields:**
- `adminId` - Reference to Admin
- `adminEmail` - Admin email
- `adminName` - Admin name
- `action` - Action type (login, logout, user_created, etc.)
- `description` - Action description
- `details` - Additional action details
- `targetType` - Target entity type
- `targetId` - Target entity ID
- `targetName` - Target entity name
- `ipAddress` - Request IP
- `userAgent` - Browser/device info
- `location` - Geographic location
- `status` - Action status (success, failed, warning, error)
- `errorMessage` - Error details
- `responseTime` - Response time in ms
- `riskLevel` - Risk assessment (low, medium, high, critical)
- `isSuspicious` - Suspicious activity flag
- `deviceInfo` - Device details
- `sessionId` - Session identifier
- `requestId` - Request identifier
- `tags` - Action tags

## API Endpoints

### Admin Authentication
- `POST /api/admin-auth/login` - Admin login
- `POST /api/admin-auth/logout` - Admin logout
- `GET /api/admin-auth/profile/:adminId` - Get admin profile
- `GET /api/admin-auth/logs/:adminId` - Get admin logs
- `GET /api/admin-auth/activity/:adminId` - Get activity summary

### Admin Dashboard
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get user management data

## Setup Instructions

### 1. Initialize Admin System
```bash
cd backend
npm run setup-admin
```

### 2. Create Admin Account Only
```bash
npm run init-admin
```

### 3. Environment Variables
Ensure these are set in your `.env` file:
```
MONGODB_URI=your_mongodb_connection_string
```

## Admin Account Details

### Super Admin Account
- **Email:** pinjaridastageer@gmail.com
- **Role:** super_admin
- **Permissions:** All permissions including system management
- **Status:** Active by default

### Permissions Available
- `read` - Read access
- `write` - Write access
- `delete` - Delete access
- `manage_users` - User management
- `view_logs` - View admin logs
- `manage_admins` - Admin management
- `system_settings` - System configuration
- `backup_restore` - Backup operations
- `api_management` - API key management
- `security_management` - Security settings

## Security Features

### 1. Account Lockout
- 5 failed login attempts locks account for 2 hours
- Automatic unlock after lock period

### 2. Activity Logging
- All admin actions are logged
- IP address tracking
- Device information capture
- Risk level assessment

### 3. Permission System
- Role-based access control
- Granular permission system
- Permission validation middleware

### 4. Suspicious Activity Detection
- Failed login tracking
- Unusual access pattern detection
- High-risk action flagging

## Logging System

### Action Types
- `login` - Admin login
- `logout` - Admin logout
- `user_created` - User creation
- `user_updated` - User modification
- `user_deleted` - User deletion
- `user_banned` - User ban
- `user_unbanned` - User unban
- `system_settings_changed` - System configuration
- `data_exported` - Data export
- `data_imported` - Data import
- `backup_created` - Backup creation
- `backup_restored` - Backup restoration
- `api_key_generated` - API key creation
- `api_key_revoked` - API key revocation
- `permissions_changed` - Permission changes
- `admin_created` - Admin creation
- `admin_updated` - Admin modification
- `admin_deleted` - Admin deletion
- `system_restart` - System restart
- `maintenance_mode` - Maintenance mode
- `security_alert` - Security alerts
- `other` - Other actions

### Risk Levels
- `low` - Normal operations
- `medium` - Moderate risk actions
- `high` - High risk actions
- `critical` - Critical security actions

## Usage Examples

### 1. Admin Login
```javascript
const response = await fetch('/api/admin-auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Pinjari Dastageer',
    email: 'pinjaridastageer@gmail.com',
    image: 'profile_image_url',
    provider: 'google',
    providerId: 'google_user_id'
  })
});
```

### 2. Get Admin Logs
```javascript
const response = await fetch('/api/admin-auth/logs/ADMIN_ID?page=1&limit=50');
const data = await response.json();
```

### 3. Get Activity Summary
```javascript
const response = await fetch('/api/admin-auth/activity/ADMIN_ID?days=30');
const summary = await response.json();
```

## Monitoring and Maintenance

### 1. Regular Monitoring
- Check admin logs for suspicious activities
- Monitor failed login attempts
- Review high-risk actions

### 2. Database Maintenance
- Regular cleanup of old logs
- Index optimization
- Performance monitoring

### 3. Security Updates
- Regular permission reviews
- Security audit logs
- Access pattern analysis

## Troubleshooting

### Common Issues
1. **Admin login fails** - Check email authorization
2. **Permission denied** - Verify admin permissions
3. **Logs not appearing** - Check database connection
4. **Account locked** - Wait for lock period or reset

### Debug Commands
```bash
# Check admin collection
npm run test-db

# View admin logs
# Access MongoDB and query admin_logs collection

# Reset admin account
# Delete admin record and run setup-admin again
```

## Security Best Practices

1. **Regular Audits** - Review admin logs weekly
2. **Permission Reviews** - Audit permissions monthly
3. **Access Monitoring** - Monitor unusual access patterns
4. **Backup Logs** - Regular backup of admin logs
5. **Incident Response** - Have procedures for security incidents

## Support

For issues or questions about the admin system:
1. Check the logs for error details
2. Review this documentation
3. Contact the system administrator
4. Check database connectivity and permissions
