# API Documentation

## Overview

The Allo Mofawid API provides endpoints for managing users, content, and generating reports. This document describes the available endpoints, their parameters, and expected responses.

## Authentication

All API endpoints require authentication using a JWT token. Include the token in the Authorization header:

```http
Authorization: Bearer your-jwt-token
```

## Base URL

```
https://api.allomofawid.com
```

## Endpoints

### User Management

#### List Users
```http
GET /api/admin/users
```

Query Parameters:
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string
- `role`: "user" | "huissier" | "admin"
- `status`: "active" | "inactive" | "pending" | "suspended"
- `sortBy`: string
- `sortOrder`: "asc" | "desc"

Response:
```json
{
  "data": [
    {
      "id": "string",
      "email": "string",
      "full_name": "string",
      "role": "user" | "huissier" | "admin",
      "status": "active" | "inactive" | "pending" | "suspended",
      "created_at": "string",
      "activity_logs": [
        {
          "action": "string",
          "entity_type": "string",
          "created_at": "string"
        }
      ]
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### Update User Role
```http
PUT /api/admin/users
```

Request Body:
```json
{
  "userId": "string",
  "role": "user" | "huissier" | "admin"
}
```

Response:
```json
{
  "id": "string",
  "role": "string",
  "updated_at": "string"
}
```

#### Bulk Actions
```http
POST /api/admin/users
```

Request Body:
```json
{
  "userIds": ["string"],
  "action": "activate" | "deactivate" | "delete"
}
```

Response:
```json
{
  "success": true
}
```

### City Management

#### List Cities
```http
GET /api/admin/cities
```

Query Parameters:
- `search`: string
- `region`: string
- `coordinates`: [number, number]
- `radius`: number

Response:
```json
{
  "data": [
    {
      "id": "string",
      "name": {
        "ar": "string",
        "fr": "string",
        "en": "string"
      },
      "coordinates": {
        "lat": "number",
        "lng": "number"
      },
      "region": "string"
    }
  ]
}
```

#### Create City
```http
POST /api/admin/cities
```

Request Body:
```json
{
  "name": {
    "ar": "string",
    "fr": "string",
    "en": "string"
  },
  "coordinates": {
    "lat": "number",
    "lng": "number"
  },
  "region": "string"
}
```

### Specialty Management

#### List Specialties
```http
GET /api/admin/specialties
```

Query Parameters:
- `search`: string
- `locale`: "ar" | "fr" | "en"

Response:
```json
{
  "data": [
    {
      "id": "string",
      "name": {
        "ar": "string",
        "fr": "string",
        "en": "string"
      },
      "description": {
        "ar": "string",
        "fr": "string",
        "en": "string"
      }
    }
  ]
}
```

### Reporting

#### Export Report
```http
POST /api/admin/reports/export
```

Request Body:
```json
{
  "type": "users" | "requests" | "activity",
  "format": "pdf" | "csv",
  "dateRange": {
    "from": "string",
    "to": "string"
  }
}
```

Response:
- Content-Type: "application/pdf" or "text/csv"
- Content-Disposition: attachment

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "string",
  "status": "number",
  "details": "optional additional information"
}
```

HTTP Status Codes:
- 200: Success
- 400: Invalid input
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

## Rate Limiting

API requests are limited to:
- 100 requests per minute per IP
- 1000 requests per hour per API key

## Pagination

List endpoints support pagination with:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Response includes metadata:
```json
{
  "data": [...],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

## CORS

API endpoints are CORS-enabled for:
- https://allomofawid.com
- https://*.allomofawid.com

## Versioning

The API is versioned through the URL:
- Current version: No prefix (default)
- Future versions: /v2/, /v3/, etc.

## Development

### Local Setup
1. Clone repository
2. Install dependencies: `pnpm install`
3. Set up environment: Copy `.env.example` to `.env.local`
4. Run development server: `pnpm dev`

### Testing
```bash
# Run API tests
pnpm test:api

# Test specific endpoint
pnpm test:api users
```
