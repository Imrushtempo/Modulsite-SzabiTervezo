import React, { useState } from 'react'
import type { LeaveType, LeaveBalance } from '../types'
import { getHoliday, isWeekend } from '../utils/dateUtils'

interface LeaveRequestFormProps {
  leaveTypes: LeaveType[]
  balance: LeaveBalance[]
  onSubmit: (leaveTypeId: string, startDate: string, endDate: string, reason?: string) => Promise<void>
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ leaveTypes, balance, onSubmit }) => {
  const [leaveTypeId, setLeaveTypeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedBalance = balance.find(b => b.leave_type_id === leaveTypeId)

  const calculateWorkingDays = (start: Date, end: Date): number => {
    let dayCount = 0
    const current = new Date(start)
    while (current <= end) {
      if (!isWeekend(current) && !getHoliday(current)) {
        dayCount++
      }
      current.setDate(current.getDate() + 1)
    }
    return dayCount
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!leaveTypeId) {
      setError('Kérlek válassz szabadság típust.')
      return
    }

    if (!startDate || !endDate) {
      setError('Kérlek add meg a kezdő és végdátumot.')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (start < today) {
      setError('A kezdő dátum nem lehet a múltban.')
      return
    }

    if (end < start) {
      setError('A végdátum nem lehet a kezdő dátum előtt.')
      return
    }

    const dayCount = calculateWorkingDays(start, end)

    if (dayCount === 0) {
      setError('A megadott időszak csak hétvégét vagy ünnepnapot tartalmaz.')
      return
    }

    if (selectedBalance && dayCount > selectedBalance.remaining_days) {
      setError(`Nincs elég fennmaradó szabadságod. Maradt: ${selectedBalance.remaining_days} nap`)
      return
    }

    try {
      setSubmitting(true)
      await onSubmit(leaveTypeId, startDate, endDate, reason)
      // Reset form on success
      setLeaveTypeId('')
      setStartDate('')
      setEndDate('')
      setReason('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">
        Új szabadság igénylése
      </h3>

      {/* Leave Type Select */}
      <div>
        <label htmlFor="leave-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Szabadság típusa
        </label>
        <select
          id="leave-type"
          value={leaveTypeId}
          onChange={(e) => setLeaveTypeId(e.target.value)}
          className="mt-1 block w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={submitting}
        >
          <option value="">Válassz típust...</option>
          {leaveTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name} {!type.is_paid && '(Fizetés nélküli)'}
            </option>
          ))}
        </select>
        {selectedBalance && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Maradt: {selectedBalance.remaining_days} nap
          </p>
        )}
      </div>

      {/* Start Date */}
      <div>
        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Kezdő dátum
        </label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 block w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={submitting}
        />
      </div>

      {/* End Date */}
      <div>
        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Végdátum
        </label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 block w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={submitting}
        />
      </div>

      {/* Reason (Optional) */}
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Indoklás (opcionális)
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="mt-1 block w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Pl: családi nyaralás..."
          disabled={submitting}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Küldés...' : 'Igénylés'}
      </button>
    </form>
  )
}

export default LeaveRequestForm
