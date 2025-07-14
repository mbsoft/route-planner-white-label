# Route Planner White Label - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Authentication System](#authentication-system)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Environment Variables](#environment-variables)
7. [Deployment](#deployment)
8. [Changelog](#changelog)

## Overview

The Route Planner White Label application is a Next.js-based web application that provides route optimization capabilities using the NextBillion.ai API. The application features user authentication, route optimization, result storage, and analysis capabilities.

### Key Features
- **User Authentication**: Admin and user role-based access
- **Route Optimization**: Integration with NextBillion.ai API
- **Result Storage**: Persistent storage of optimization results
- **Analysis Dashboard**: Comprehensive analytics and reporting
- **Shared URLs**: Ability to share optimization results via NextBillion console
- **White Label Support**: Customizable branding and configuration

## Database Schema

### Database: Turso (LibSQL)

The application uses Turso (LibSQL) as the database backend, accessed via the `@libsql/client` package.

### Tables

#### 1. `optimization_results`

Stores route optimization results and metadata.

```sql
CREATE TABLE optimization_results (
  id TEXT PRIMARY KEY,           -- Unique identifier for the optimization result
  job_id TEXT NOT NULL,          -- Job ID from the optimization request
  title TEXT NOT NULL,           -- User-defined title for the optimization
  response_data TEXT NOT NULL,   -- JSON string containing the full optimization response
  shared_url TEXT,               -- URL to view the result on NextBillion console
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Timestamp of creation
  status TEXT DEFAULT 'completed' -- Status of the optimization (completed, pending, etc.)
);
```

**Indexes:**
- Primary Key: `id`
- Secondary: `job_id` (for lookups)

**Data Types:**
- `response_data`: JSON string containing the complete optimization response from NextBillion.ai
- `shared_url`: Optional URL for viewing results on NextBillion console
- `status`: Text field indicating optimization status

#### 2. `map_configs`

Stores configuration data for map-related features.

```sql
CREATE TABLE map_configs (
  type TEXT PRIMARY KEY,         -- Configuration type identifier
  data TEXT                      -- JSON string containing configuration data
);
```

## Authentication System

### Session Management

The application uses HTTP-only cookies for session management with the following structure:

#### Session Token Format
```
Base64(username:role:timestamp)
```

#### Session Information Interface
```typescript
interface SessionInfo {
  username: string
  role: 'admin' | 'user'
  timestamp: number
}
```

### User Roles

1. **Admin Role**
   - Full access to all features
   - Can delete optimization results
   - Can view admin-specific UI elements
   - Configured via `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables

2. **User Role**
   - Standard user access
   - Can create and view optimization results
   - Cannot delete results
   - Configured via `USER_USERNAME` and `USER_PASSWORD` environment variables

### Authentication Flow

1. **Login**: POST `/api/auth/login`
   - Validates credentials against environment variables
   - Creates session token with role information
   - Sets HTTP-only cookie with 7-day expiration

2. **Session Validation**: GET `/api/auth/me`
   - Decodes session token
   - Returns current user information

3. **Logout**: POST `/api/auth/logout`
   - Clears session cookie
   - Redirects to login page

### Middleware Protection

The application uses Next.js middleware to protect routes:
- All routes except `/login` and `/api/auth/*` require authentication
- Unauthenticated requests are redirected to login page
- Session validation occurs on every request

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`
**Purpose**: Authenticate user and create session

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "role": "admin" | "user"
}
```

**Error Response:**
```json
{
  "error": "Invalid username or password"
}
```

#### GET `/api/auth/me`
**Purpose**: Get current session information

**Response:**
```json
{
  "sessionInfo": {
    "username": "string",
    "role": "admin" | "user",
    "timestamp": number
  },
  "success": true
}
```

#### POST `/api/auth/logout`
**Purpose**: Clear session and logout user

**Response:**
```json
{
  "success": true
}
```

### Optimization Results Endpoints

#### GET `/api/optimization-results`
**Purpose**: Retrieve optimization results

**Query Parameters:**
- `job_id` (optional): Get specific result by job ID

**Response (with job_id):**
```json
{
  "id": "string",
  "job_id": "string",
  "response_data": object,
  "shared_url": "string",
  "created_at": "string",
  "status": "string"
}
```

**Response (without job_id):**
```json
{
  "results": [
    {
      "id": "string",
      "job_id": "string",
      "title": "string",
      "shared_url": "string",
      "created_at": "string",
      "status": "string"
    }
  ]
}
```

#### POST `/api/optimization-results`
**Purpose**: Save new optimization result

**Request Body:**
```json
{
  "id": "string",
  "job_id": "string",
  "title": "string",
  "response_data": object,
  "shared_url": "string",
  "status": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Optimization result saved successfully"
}
```

#### PATCH `/api/optimization-results`
**Purpose**: Update optimization result

**Request Body:**
```json
{
  "id": "string",
  "title": "string",
  "shared_url": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Optimization result updated successfully"
}
```

#### DELETE `/api/optimization-results?id={id}`
**Purpose**: Delete optimization result

**Response:**
```json
{
  "success": true,
  "message": "Optimization result deleted successfully"
}
```

### Map Configuration Endpoints

#### GET `/api/map/[type]`
**Purpose**: Get map configuration by type

**Response:**
```json
{
  "value": object
}
```

#### POST `/api/map/[type]`
**Purpose**: Save map configuration by type

**Request Body:**
```json
{
  // Configuration data object
}
```

**Response:**
```json
{
  "ok": true
}
```

### Configuration Endpoints

#### GET `/api/config`
**Purpose**: Get application configuration

**Response:**
```json
{
  "NEXTBILLION_API_KEY": "string",
  "USE_CASE": "string"
}
```

## Frontend Components

### Core Components

#### RouteSummaryTable
**Location**: `components/common/route-summary-table.tsx`
**Purpose**: Displays route optimization results in a table format
**Features**:
- Expandable route details
- Step-by-step route information
- Capacity utilization metrics
- Interactive row selection

#### HamburgerMenu
**Location**: `components/common/hamburger-menu.tsx`
**Purpose**: Navigation menu component
**Features**:
- Responsive design
- Current page highlighting
- Role-based menu items

#### WhiteLabelLayout
**Location**: `app/white-label-layout.tsx`
**Purpose**: Main layout wrapper with white label branding
**Features**:
- Customizable logo
- Consistent styling
- Responsive design

### Pages

#### Main Page (`app/page.tsx`)
**Purpose**: Route optimization interface
**Features**:
- File upload for jobs and vehicles
- Optimization request handling
- Real-time status updates
- Navigation to analysis page

#### Analysis Page (`app/analysis/page.tsx`)
**Purpose**: Optimization results analysis and management
**Features**:
- Summary statistics dashboard
- Optimization history table
- Result details view
- Edit and delete capabilities
- Shared URL integration

#### Login Page (`app/login/page.tsx`)
**Purpose**: User authentication interface
**Features**:
- Username/password form
- Error handling
- Redirect after successful login

## Environment Variables

### Required Variables

```bash
# Database Configuration
TURSO_DATABASE_URL=libsql://your-database-url
TURSO_AUTH_TOKEN=your-auth-token

# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password
USER_USERNAME=user
USER_PASSWORD=secure-password

# NextBillion Integration
NEXTBILLION_API_KEY=your-api-key

# Application Configuration
USE_CASE=jobs
NODE_ENV=production
```

### Optional Variables

```bash
# Session Configuration
SESSION_SECRET=your-session-secret

# Application Branding
COMPANY_NAME=Your Company
COMPANY_LOGO=/path/to/logo.svg
```

## Deployment

### Prerequisites
- Node.js 18.17.0 or higher
- Turso database account
- NextBillion.ai API key

### Deployment Steps

1. **Database Setup**
   ```bash
   # Create Turso database
   turso db create route-planner
   
   # Get database URL and auth token
   turso db show route-planner
   turso db tokens create route-planner
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp env.example .env.local
   
   # Configure environment variables
   # See Environment Variables section above
   ```

3. **Application Deployment**
   ```bash
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Start production server
   npm start
   ```

### Netlify Deployment

The application includes `netlify.toml` for Netlify deployment:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Changelog

### Version 1.0.0 (Current)
- **Database Schema**: Initial optimization_results and map_configs tables
- **Authentication**: Role-based authentication system
- **API Endpoints**: Complete CRUD operations for optimization results
- **Frontend**: Route optimization and analysis interfaces
- **Features**:
  - Route optimization with NextBillion.ai
  - Result storage and management
  - Analysis dashboard with summary statistics
  - Shared URL integration
  - White label branding support

### Recent Updates
- Added summary statistics tiles (Average Speed, Total Routes, Avg Gallons/Route, Unassigned Jobs)
- Added additional metrics (Avg Stops/Route, Avg Distance/Route, Total Waiting Time, Avg Service Time/Route)
- Implemented duplicate detection for optimization results
- Added debugging and error handling for data calculations
- Enhanced UI with ID field display in result details

### Planned Features
- Advanced filtering and search capabilities
- Export functionality for optimization results
- Real-time optimization status updates
- Enhanced map visualization
- Multi-tenant support
- API rate limiting and caching

---

## Maintenance Notes

### Database Migrations
The application uses automatic table creation and column addition. When adding new columns:
1. Add the column check in the `ensureTable()` function
2. Use `ALTER TABLE` statements for existing databases
3. Update this documentation with schema changes

### API Versioning
Currently using unversioned API endpoints. Consider implementing versioning for future releases:
- `/api/v1/optimization-results`
- `/api/v2/optimization-results`

### Security Considerations
- All API endpoints are protected by authentication middleware
- Session tokens are HTTP-only and secure
- Environment variables should be properly secured in production
- Consider implementing rate limiting for API endpoints
- Regular security audits recommended

### Performance Optimization
- Database queries are optimized with proper indexing
- Frontend uses React hooks for efficient state management
- Consider implementing caching for frequently accessed data
- Monitor database performance as data grows 