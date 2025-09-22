# Admin Documentation

## Overview

The admin system provides comprehensive management capabilities for users, content, and reporting. This document covers the available features and how to use them.

## 🔒 Security

All admin features are protected by:
- Role-based access control (RBAC)
- Row Level Security (RLS) policies
- API endpoint validation
- Input sanitization

### Access Control
Only users with the `admin` role can access these features. The role is checked at multiple levels:
1. Route middleware
2. API endpoints
3. Database queries

## 🗂️ Features

### User Management

#### Interface
- `/admin/users`
- Comprehensive user list with filtering and sorting
- Bulk actions (activate/deactivate/delete)
- Role management
- Activity tracking

#### API Endpoints
```typescript
// List users
GET /api/admin/users
Query params:
  page: number
  limit: number
  search: string
  role: "user" | "huissier" | "admin"
  status: "active" | "inactive" | "pending" | "suspended"
  sortBy: string
  sortOrder: "asc" | "desc"

// Update user role
PUT /api/admin/users
Body: {
  userId: string
  role: "user" | "huissier" | "admin"
}

// Bulk actions
POST /api/admin/users
Body: {
  userIds: string[]
  action: "activate" | "deactivate" | "delete"
}
```

### City/Region Management

#### Interface
- `/admin/cities`
- City list with PostGIS integration
- CRUD operations
- Search and filtering

#### API Endpoints
```typescript
// List cities
GET /api/admin/cities
Query params:
  search: string
  region: string
  coordinates: [number, number]
  radius: number

// Create city
POST /api/admin/cities
Body: {
  name: {
    ar: string
    fr: string
    en: string
  }
  coordinates: {
    lat: number
    lng: number
  }
  region: string
}

// Update city
PUT /api/admin/cities/:id
// Delete city
DELETE /api/admin/cities/:id
```

### Specialty Management

#### Interface
- `/admin/specialties`
- Specialty list with multilingual support
- CRUD operations
- Assignment interface

#### API Endpoints
```typescript
// List specialties
GET /api/admin/specialties
Query params:
  search: string
  locale: "ar" | "fr" | "en"

// Create specialty
POST /api/admin/specialties
Body: {
  name: {
    ar: string
    fr: string
    en: string
  }
  description: {
    ar: string
    fr: string
    en: string
  }
}

// Update specialty
PUT /api/admin/specialties/:id
// Delete specialty
DELETE /api/admin/specialties/:id
```

### Reporting System

#### Interface
- `/admin/reports`
- Interactive dashboard with charts
- Date range filtering
- Export capabilities

#### API Endpoints
```typescript
// Export report
POST /api/admin/reports/export
Body: {
  type: "users" | "requests" | "activity"
  format: "pdf" | "csv"
  dateRange: {
    from: string
    to: string
  }
}
```

## 📊 Data Models

### Profile
```typescript
interface Profile {
  id: string
  created_at: string
  updated_at: string
  email: string
  full_name: string
  phone: string | null
  role: "user" | "huissier" | "admin"
  status: "active" | "inactive" | "pending" | "suspended"
  metadata: Json | null
}
```

### ActivityLog
```typescript
interface ActivityLog {
  id: string
  created_at: string
  actor_id: string
  action: string
  entity_type: string
  entity_id: string
  metadata: Json | null
}
```

## 🔍 Error Handling

All API endpoints follow a consistent error handling pattern:

```typescript
{
  error: string
  status: number
  details?: unknown
}
```

Common error codes:
- 400: Invalid input
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Resource not found
- 500: Server error

## 🧪 Testing

### Running Tests
```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test user-management
pnpm test reporting
```

### Test Coverage
Coverage reports are generated in `coverage/` after running tests.

## 🚀 Deployment

The admin features are automatically deployed with the main application. No additional setup is required.

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🔧 Troubleshooting

Common issues and solutions:

1. **Permission Denied**
   - Verify user has admin role
   - Check RLS policies
   - Ensure valid JWT token

2. **Data Not Loading**
   - Check network requests
   - Verify API endpoint URLs
   - Check data format

3. **Export Failed**
   - Verify date range
   - Check file size limits
   - Ensure proper permissions

## 📱 Mobile Responsiveness

All admin interfaces are mobile-responsive with:
- Adaptive layouts
- Touch-friendly controls
- Optimized tables
- Responsive charts

## 🌍 Internationalization

Admin features support three languages:
- Arabic (RTL)
- French
- English

Language is determined by the URL path: `/[locale]/admin/...`
