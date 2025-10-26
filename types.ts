// Backend types matching Supabase schema

export interface LeaveType {
  id: string
  tenant_id: string
  name: string
  code: string
  is_paid: boolean
  color: string
  requires_approval: boolean
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  id: string
  tenant_id: string
  user_id: string
  leave_type_id: string
  year: number
  total_days: number
  used_days: number
  pending_days: number
  remaining_days: number
  created_at: string
  updated_at: string
  leave_types?: LeaveType
}

export interface LeaveRequest {
  id: string
  tenant_id: string
  user_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  days_count: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  reason?: string
  notes?: string
  approved_by?: string
  approved_at?: string
  rejected_by?: string
  rejected_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
  // Joined data
  leave_types?: LeaveType
  users?: {
    id: string
    full_name: string
    email: string
  }
}

export interface ConflictDay {
  conflict_date: string
  people_count: number
  user_names: string[]
}

// User/Profile types (from main platform)
export interface User {
  id: string
  tenant_id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'platform_admin' | 'company_admin' | 'staff' | 'client'
  is_active: boolean
  created_at: string
  updated_at: string
  last_login_at?: string
}

// Legacy types (for compatibility with existing components - to be removed)
export enum Role {
  Employee = 'employee',
  Manager = 'manager',
}

export enum LeaveStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export interface Employee {
  id: number
  name: string
  totalLeaveDays: number
  role: Role
}
