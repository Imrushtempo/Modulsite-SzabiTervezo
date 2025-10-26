import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { LeaveRequest } from '../types'
import { useAuth } from '../contexts/AuthContext'

interface UseLeaveRequestsResult {
  requests: LeaveRequest[]
  loading: boolean
  error: string | null
  createRequest: (data: {
    leave_type_id: string
    start_date: string
    end_date: string
    reason?: string
    notes?: string
  }) => Promise<LeaveRequest>
  approveRequest: (requestId: string, notes?: string) => Promise<void>
  rejectRequest: (requestId: string, rejection_reason?: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useLeaveRequests(tenantId?: string): UseLeaveRequestsResult {
  const { user } = useAuth()
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          leave_types (*),
          users:profiles_new!leave_requests_user_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setRequests(data || [])
    } catch (err) {
      console.error('Error fetching leave requests:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [tenantId, refreshTrigger])

  const createRequest = async (requestData: {
    leave_type_id: string
    start_date: string
    end_date: string
    reason?: string
    notes?: string
  }): Promise<LeaveRequest> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // LOCALHOST: Direct database insert instead of Edge Function
      // Calculate days_count
      const start = new Date(requestData.start_date)
      const end = new Date(requestData.end_date)
      const days_count = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      const { data: newRequest, error: createError } = await supabase
        .from('leave_requests')
        .insert({
          tenant_id: user.tenant_id,
          user_id: user.id,
          leave_type_id: requestData.leave_type_id,
          start_date: requestData.start_date,
          end_date: requestData.end_date,
          days_count,
          status: 'pending',
          reason: requestData.reason,
          notes: requestData.notes,
        })
        .select(`
          *,
          leave_types (*),
          users:profiles_new!leave_requests_user_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .single()

      if (createError) throw createError

      // Update leave balance pending_days
      // First get current balance
      const { data: currentBalance } = await supabase
        .from('leave_balance')
        .select('pending_days')
        .eq('user_id', user.id)
        .eq('leave_type_id', requestData.leave_type_id)
        .eq('year', new Date(requestData.start_date).getFullYear())
        .single()

      if (currentBalance) {
        await supabase
          .from('leave_balance')
          .update({ pending_days: (currentBalance.pending_days || 0) + days_count })
          .eq('user_id', user.id)
          .eq('leave_type_id', requestData.leave_type_id)
          .eq('year', new Date(requestData.start_date).getFullYear())
      }

      // Trigger refresh
      setRefreshTrigger(prev => prev + 1)

      return newRequest
    } catch (err) {
      console.error('Error creating leave request:', err)
      throw err
    }
  }

  const approveRequest = async (requestId: string, notes?: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // LOCALHOST: Direct database update instead of Edge Function
      // Get the request details first
      const { data: request } = await supabase
        .from('leave_requests')
        .select('user_id, leave_type_id, start_date, days_count, status')
        .eq('id', requestId)
        .single()

      if (!request || request.status !== 'pending') {
        throw new Error('Request not found or already processed')
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Update leave balance: decrease pending_days, increase used_days
      const year = new Date(request.start_date).getFullYear()
      const { data: balance } = await supabase
        .from('leave_balance')
        .select('pending_days, used_days')
        .eq('user_id', request.user_id)
        .eq('leave_type_id', request.leave_type_id)
        .eq('year', year)
        .single()

      if (balance) {
        await supabase
          .from('leave_balance')
          .update({
            pending_days: Math.max(0, (balance.pending_days || 0) - request.days_count),
            used_days: (balance.used_days || 0) + request.days_count,
          })
          .eq('user_id', request.user_id)
          .eq('leave_type_id', request.leave_type_id)
          .eq('year', year)
      }

      // Trigger refresh
      setRefreshTrigger(prev => prev + 1)
    } catch (err) {
      console.error('Error approving leave request:', err)
      throw err
    }
  }

  const rejectRequest = async (requestId: string, rejection_reason?: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // LOCALHOST: Direct database update instead of Edge Function
      // Get the request details first
      const { data: request } = await supabase
        .from('leave_requests')
        .select('user_id, leave_type_id, start_date, days_count, status')
        .eq('id', requestId)
        .single()

      if (!request || request.status !== 'pending') {
        throw new Error('Request not found or already processed')
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: rejection_reason || null,
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Update leave balance: decrease pending_days only
      const year = new Date(request.start_date).getFullYear()
      const { data: balance } = await supabase
        .from('leave_balance')
        .select('pending_days')
        .eq('user_id', request.user_id)
        .eq('leave_type_id', request.leave_type_id)
        .eq('year', year)
        .single()

      if (balance) {
        await supabase
          .from('leave_balance')
          .update({
            pending_days: Math.max(0, (balance.pending_days || 0) - request.days_count),
          })
          .eq('user_id', request.user_id)
          .eq('leave_type_id', request.leave_type_id)
          .eq('year', year)
      }

      // Trigger refresh
      setRefreshTrigger(prev => prev + 1)
    } catch (err) {
      console.error('Error rejecting leave request:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  return {
    requests,
    loading,
    error,
    createRequest,
    approveRequest,
    rejectRequest,
    refetch: fetchRequests,
  }
}
