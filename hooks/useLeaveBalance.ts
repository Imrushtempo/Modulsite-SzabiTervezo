import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { LeaveBalance } from '../types'

interface UseLeaveBalanceResult {
  balance: LeaveBalance[] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useLeaveBalance(userId?: string, year?: number): UseLeaveBalanceResult {
  const [balance, setBalance] = useState<LeaveBalance[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = async () => {
    if (!userId || !year) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // LOCALHOST: Direct database query instead of Edge Function
      // In production with Clerk auth, we'll use the Edge Function
      const { data: balances, error: fetchError } = await supabase
        .from('leave_balance')
        .select(`
          *,
          leave_types (
            id,
            name,
            code,
            is_paid,
            color,
            requires_approval
          )
        `)
        .eq('user_id', userId)
        .eq('year', year)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      setBalance(balances || [])
    } catch (err) {
      console.error('Error fetching leave balance:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [userId, year])

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  }
}
