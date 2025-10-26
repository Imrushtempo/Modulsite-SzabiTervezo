import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ConflictDay, LeaveRequest } from '../types'

interface ConflictCheckResult {
  conflicts: ConflictDay[]
  leave_requests: LeaveRequest[]
  summary: {
    max_people_on_leave: number
    total_conflict_days: number
    severity: 'none' | 'low' | 'medium' | 'high'
  }
  warnings: string[]
  suggestions: string[]
}

interface UseConflictsResult {
  checking: boolean
  error: string | null
  checkConflicts: (startDate: string, endDate: string) => Promise<ConflictCheckResult | null>
}

export function useConflicts(): UseConflictsResult {
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkConflicts = async (
    startDate: string,
    endDate: string
  ): Promise<ConflictCheckResult | null> => {
    try {
      setChecking(true)
      setError(null)

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      })

      const { data, error: fetchError } = await supabase.functions.invoke('check-conflicts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (fetchError) throw fetchError

      if (!data.success) {
        throw new Error(data.error || 'Failed to check conflicts')
      }

      return {
        conflicts: data.conflicts || [],
        leave_requests: data.leave_requests || [],
        summary: data.summary || {
          max_people_on_leave: 0,
          total_conflict_days: 0,
          severity: 'none',
        },
        warnings: data.warnings || [],
        suggestions: data.suggestions || [],
      }
    } catch (err) {
      console.error('Error checking conflicts:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      return null
    } finally {
      setChecking(false)
    }
  }

  return {
    checking,
    error,
    checkConflicts,
  }
}
