import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { LeaveType } from '../types'

interface UseLeaveTypesResult {
  leaveTypes: LeaveType[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useLeaveTypes(tenantId?: string): UseLeaveTypesResult {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('leave_types')
        .select('*')
        .order('code', { ascending: true })

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setLeaveTypes(data || [])
    } catch (err) {
      console.error('Error fetching leave types:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveTypes()
  }, [tenantId])

  return {
    leaveTypes,
    loading,
    error,
    refetch: fetchLeaveTypes,
  }
}
