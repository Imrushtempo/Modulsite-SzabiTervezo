# Szabi Tervező - API Documentation

## Overview
Szabi Tervező backend API provides leave management functionality through 5 Supabase Edge Functions and 3 database tables.

**Base URL**: `https://stzjhrcvyzbazaaptzqy.supabase.co/functions/v1`

**Authentication**: All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <supabase_access_token>
```

---

## Database Schema

### Tables

#### 1. `leave_types`
Stores different types of leave (annual, unpaid, medical, etc.)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Foreign key to tenants |
| name | TEXT | Leave type name (e.g., "Éves szabadság") |
| code | TEXT | Unique code (e.g., "ANNUAL") |
| is_paid | BOOLEAN | Whether it's paid leave |
| color | TEXT | Color for UI display |
| requires_approval | BOOLEAN | Whether approval is needed |

#### 2. `leave_balance`
Tracks each user's leave balance per type per year

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Foreign key to tenants |
| user_id | UUID | Foreign key to profiles_new |
| leave_type_id | UUID | Foreign key to leave_types |
| year | INT | Year of the balance |
| total_days | NUMERIC(5,1) | Total allocated days |
| used_days | NUMERIC(5,1) | Days already used |
| pending_days | NUMERIC(5,1) | Days in pending requests |
| remaining_days | NUMERIC(5,1) | Auto-calculated: total - used - pending |

#### 3. `leave_requests`
Stores all leave requests

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Foreign key to tenants |
| user_id | UUID | Foreign key to profiles_new |
| leave_type_id | UUID | Foreign key to leave_types |
| start_date | DATE | Leave start date |
| end_date | DATE | Leave end date |
| days_count | NUMERIC(5,1) | Working days count |
| status | TEXT | pending, approved, rejected, cancelled |
| reason | TEXT | Optional reason |
| notes | TEXT | Optional notes |
| approved_by | UUID | Who approved (if approved) |
| approved_at | TIMESTAMPTZ | When approved |
| rejected_by | UUID | Who rejected (if rejected) |
| rejected_at | TIMESTAMPTZ | When rejected |
| rejection_reason | TEXT | Reason for rejection |

---

## Edge Functions

### 1. POST /request-leave

Creates a new leave request.

**Endpoint**: `POST https://stzjhrcvyzbazaaptzqy.supabase.co/functions/v1/request-leave`

**Request Body**:
```json
{
  "leave_type_id": "uuid",
  "start_date": "2025-02-01",
  "end_date": "2025-02-05",
  "reason": "Családi nyaralás",
  "notes": "Előre egyeztetett szabadság"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "user_id": "uuid",
    "leave_type_id": "uuid",
    "start_date": "2025-02-01",
    "end_date": "2025-02-05",
    "days_count": 5,
    "status": "pending",
    "reason": "Családi nyaralás",
    "created_at": "2025-01-25T12:00:00Z"
  },
  "conflicts": [
    {
      "conflict_date": "2025-02-03",
      "people_count": 2,
      "user_names": ["Nagy Péter", "Kovács Anna"]
    }
  ]
}
```

**Error Responses**:
- `400`: Invalid dates, insufficient balance
- `401`: Unauthorized
- `500`: Server error

**Features**:
- Automatically calculates working days (excludes weekends)
- Validates sufficient balance
- Creates balance record if doesn't exist
- Checks for conflicts with other approved leaves
- Updates `pending_days` in balance

---

### 2. POST /approve-leave

Approves a pending leave request (managers/admins only).

**Endpoint**: `POST https://stzjhrcvyzbazaaptzqy.supabase.co/functions/v1/approve-leave`

**Required Role**: `company_admin`, `platform_admin`, or `staff` (with manager permissions)

**Request Body**:
```json
{
  "request_id": "uuid",
  "notes": "Jóváhagyva, kellemes pihenést!"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "approved_by": "uuid",
    "approved_at": "2025-01-25T12:00:00Z",
    "notes": "Jóváhagyva, kellemes pihenést!"
  },
  "balance": {
    "total_days": 20,
    "used_days": 5,
    "pending_days": 0,
    "remaining_days": 15
  },
  "message": "Leave request approved successfully"
}
```

**Error Responses**:
- `400`: Request already processed
- `403`: Insufficient permissions
- `404`: Request not found
- `500`: Server error

**Features**:
- Permission check (managers/admins only)
- Automatic balance update via database trigger
- Moves days from `pending` to `used`

---

### 3. POST /reject-leave

Rejects a pending leave request (managers/admins only).

**Endpoint**: `POST https://stzjhrcvyzbazaaptzqy.supabase.co/functions/v1/reject-leave`

**Required Role**: `company_admin`, `platform_admin`, or `staff` (with manager permissions)

**Request Body**:
```json
{
  "request_id": "uuid",
  "rejection_reason": "Nincs elegendő fedezet ebben az időszakban"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "rejected",
    "rejected_by": "uuid",
    "rejected_at": "2025-01-25T12:00:00Z",
    "rejection_reason": "Nincs elegendő fedezet ebben az időszakban"
  },
  "balance": {
    "total_days": 20,
    "used_days": 0,
    "pending_days": 0,
    "remaining_days": 20
  },
  "message": "Leave request rejected"
}
```

**Error Responses**:
- `400`: Request already processed
- `403`: Insufficient permissions
- `404`: Request not found
- `500`: Server error

**Features**:
- Permission check (managers/admins only)
- Automatic balance update via database trigger
- Returns days from `pending` to `remaining`

---

### 4. GET /get-balance

Retrieves leave balance for a user.

**Endpoint**: `GET https://stzjhrcvyzbazaaptzqy.supabase.co/functions/v1/get-balance`

**Query Parameters**:
- `user_id` (optional): UUID of user (if not provided, returns current user's balance)
- `year` (optional): Year (default: current year)

**Example Request**:
```
GET /get-balance?year=2025
GET /get-balance?user_id=uuid&year=2025  # Managers only
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "leave_type_id": "uuid",
      "year": 2025,
      "total_days": 20,
      "used_days": 5,
      "pending_days": 2,
      "remaining_days": 13,
      "leave_types": {
        "id": "uuid",
        "name": "Éves szabadság",
        "code": "ANNUAL",
        "is_paid": true,
        "color": "#3B82F6"
      }
    }
  ],
  "recent_requests": [
    {
      "id": "uuid",
      "start_date": "2025-02-01",
      "end_date": "2025-02-05",
      "days_count": 5,
      "status": "approved"
    }
  ],
  "year": 2025,
  "user_id": "uuid",
  "created_defaults": false
}
```

**Error Responses**:
- `403`: Insufficient permissions (when requesting another user's balance)
- `500`: Server error

**Features**:
- Users can view their own balance
- Managers can view any user's balance
- Auto-creates balance records if they don't exist
- Returns recent leave requests for context

---

### 5. GET /check-conflicts

Checks for leave conflicts in a date range.

**Endpoint**: `GET https://stzjhrcvyzbazaaptzqy.supabase.co/functions/v1/check-conflicts`

**Query Parameters** (required):
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD

**Example Request**:
```
GET /check-conflicts?start_date=2025-02-01&end_date=2025-02-28
```

**Success Response** (200):
```json
{
  "success": true,
  "date_range": {
    "start": "2025-02-01",
    "end": "2025-02-28"
  },
  "conflicts": [
    {
      "conflict_date": "2025-02-03",
      "people_count": 2,
      "user_names": ["Nagy Péter", "Kovács Anna"]
    },
    {
      "conflict_date": "2025-02-10",
      "people_count": 4,
      "user_names": ["Kiss János", "Szabó Éva", "Molnár Gábor", "Tóth Zsuzsanna"]
    }
  ],
  "leave_requests": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "start_date": "2025-02-03",
      "end_date": "2025-02-07",
      "status": "approved",
      "users": {
        "full_name": "Nagy Péter",
        "email": "nagy.peter@example.com"
      },
      "leave_types": {
        "name": "Éves szabadság",
        "color": "#3B82F6"
      }
    }
  ],
  "summary": {
    "max_people_on_leave": 4,
    "total_conflict_days": 15,
    "severity": "high"
  },
  "warnings": [
    "4 people will be on leave simultaneously",
    "Critical: Too many team members absent"
  ],
  "suggestions": [
    "Consider rescheduling some leave requests",
    "Ensure adequate coverage for critical tasks"
  ]
}
```

**Severity Levels**:
- `none`: No conflicts
- `low`: 1 person on leave
- `medium`: 2-3 people on leave
- `high`: 4+ people on leave

**Error Responses**:
- `400`: Missing or invalid dates
- `500`: Server error

**Features**:
- Checks entire tenant for overlapping leaves
- Calculates severity based on concurrent absences
- Provides actionable warnings and suggestions
- Used for Pro tier AI conflict detection

---

## Database Functions

### calculate_leave_days(start_date, end_date)

Calculates working days between two dates (excludes weekends).

**Example**:
```sql
SELECT calculate_leave_days('2025-02-01', '2025-02-07');
-- Returns: 5 (excludes Feb 1-2 which are Saturday-Sunday)
```

### check_leave_conflicts(tenant_id, start_date, end_date)

Returns conflicts for a date range.

**Example**:
```sql
SELECT * FROM check_leave_conflicts(
  'tenant-uuid',
  '2025-02-01',
  '2025-02-28'
);
```

---

## Database Trigger

### update_leave_balance_on_approval()

Automatically triggered when `leave_requests.status` changes:

**Behavior**:
- **Pending → Approved**: Moves days from `pending_days` to `used_days`
- **Any → Pending**: Adds days to `pending_days`
- **Pending → Rejected/Cancelled**: Removes days from `pending_days`
- Auto-creates balance record if doesn't exist

---

## Row Level Security (RLS)

All tables have RLS enabled:

### leave_types
- **SELECT**: All authenticated users in tenant
- **ALL**: Only `company_admin` and `platform_admin`

### leave_balance
- **SELECT**: Own balance OR managers/admins
- **ALL**: Only `company_admin` and `platform_admin`

### leave_requests
- **SELECT**: Own requests OR managers OR all users in tenant
- **INSERT**: Own requests only (must match auth.uid)
- **UPDATE (own)**: Only pending requests
- **UPDATE (manager)**: Managers can approve/reject any request

---

## Frontend Integration Example

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://stzjhrcvyzbazaaptzqy.supabase.co',
  'SUPABASE_ANON_KEY'
)

// Request leave
async function requestLeave(leaveData) {
  const { data, error } = await supabase.functions.invoke('request-leave', {
    body: leaveData
  })

  if (error) throw error
  return data
}

// Get balance
async function getBalance() {
  const { data, error } = await supabase.functions.invoke('get-balance', {
    method: 'GET'
  })

  if (error) throw error
  return data
}

// Approve leave (manager only)
async function approveLeave(requestId, notes) {
  const { data, error } = await supabase.functions.invoke('approve-leave', {
    body: { request_id: requestId, notes }
  })

  if (error) throw error
  return data
}
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200`: Success (GET)
- `201`: Created (POST)
- `400`: Bad request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Internal server error

---

## Next Steps

To complete the Szabi Tervező module:

1. ✅ Database schema deployed
2. ✅ Edge Functions deployed
3. ⏳ Frontend components (calendar UI, request form, approval dashboard)
4. ⏳ Email notifications (on approval/rejection)
5. ⏳ AI conflict detection integration (Pro tier)
6. ⏳ Testing with tenant data
7. ⏳ Documentation and GitHub publication

---

**Last Updated**: 2025-01-25
**API Version**: 1.0.0
**Supabase Project**: stzjhrcvyzbazaaptzqy
