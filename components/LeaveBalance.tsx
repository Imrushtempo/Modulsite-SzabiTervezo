import React from 'react'
import type { LeaveBalance as LeaveBalanceType } from '../types'

interface LeaveBalanceProps {
  balance: LeaveBalanceType[]
}

const LeaveBalance: React.FC<LeaveBalanceProps> = ({ balance }) => {
  if (!balance || balance.length === 0) {
    return (
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">
          Szabadság keret
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Nincs elérhető szabadság egyenleg
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">
        Szabadság keret
      </h3>

      {balance.map((bal) => {
        const percentageUsed = bal.total_days > 0 ? ((bal.used_days + bal.pending_days) / bal.total_days) * 100 : 0

        let progressBarColor = 'bg-green-500'
        if (percentageUsed > 80) {
          progressBarColor = 'bg-red-500'
        } else if (percentageUsed > 50) {
          progressBarColor = 'bg-yellow-500'
        }

        return (
          <div key={bal.id} className="space-y-3">
            {/* Leave Type Header */}
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: bal.leave_types?.color || '#3B82F6' }}
              />
              <h4 className="font-semibold text-sm">
                {bal.leave_types?.name || 'Szabadság'}
              </h4>
              {!bal.leave_types?.is_paid && (
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                  Fizetés nélküli
                </span>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
                  {bal.total_days}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Összes</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-500">{bal.used_days}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Használt</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-500">{bal.pending_days}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Függőben</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-500">{bal.remaining_days}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Maradt</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className={`${progressBarColor} h-2 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                title={`Felhasználva: ${bal.used_days + bal.pending_days} nap a ${bal.total_days}-ból`}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default LeaveBalance
