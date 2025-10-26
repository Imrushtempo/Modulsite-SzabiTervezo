import React, { useState } from 'react'
import type { LeaveRequest } from '../types'

interface PendingRequestsProps {
  requests: LeaveRequest[]
  onApprove: (requestId: string) => Promise<void>
  onReject: (requestId: string, reason?: string) => Promise<void>
}

const PendingRequests: React.FC<PendingRequestsProps> = ({ requests, onApprove, onReject }) => {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId)
      await onApprove(requestId)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      setProcessingId(requestId)
      await onReject(requestId, rejectionReason)
      setShowRejectModal(null)
      setRejectionReason('')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">
        Függőben lévő kérelmek
      </h3>

      <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {requests.map((req) => (
          <li key={req.id} className="py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {req.users?.full_name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(req.start_date).toLocaleDateString('hu-HU')} -{' '}
                  {new Date(req.end_date).toLocaleDateString('hu-HU')} ({req.days_count} nap)
                </p>
                {req.leave_types && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: req.leave_types.color }}
                    />
                    {req.leave_types.name}
                  </p>
                )}
                {req.reason && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                    "{req.reason}"
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(req.id)}
                  disabled={processingId === req.id}
                  className="p-1.5 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Jóváhagyás"
                  title="Jóváhagyás"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => setShowRejectModal(req.id)}
                  disabled={processingId === req.id}
                  className="p-1.5 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Elutasítás"
                  title="Elutasítás"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal === req.id && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Elutasítás indoka:
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm p-2"
                  placeholder="Pl: Nincs elegendő fedezet ebben az időszakban..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={processingId === req.id}
                    className="flex-1 bg-red-600 text-white py-1.5 px-3 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    {processingId === req.id ? 'Elutasítás...' : 'Elutasít'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(null)
                      setRejectionReason('')
                    }}
                    disabled={processingId === req.id}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-1.5 px-3 rounded-md text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Mégse
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PendingRequests
