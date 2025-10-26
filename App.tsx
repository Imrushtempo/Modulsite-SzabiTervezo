import React, { useState, useMemo } from 'react'
import { AuthProvider, useAuth, MOCK_USERS } from './contexts/AuthContext'
import { useLeaveRequests } from './hooks/useLeaveRequests'
import { useLeaveBalance } from './hooks/useLeaveBalance'
import { useLeaveTypes } from './hooks/useLeaveTypes'
import Header from './components/Header'
import Calendar from './components/Calendar'
import LeaveBalance from './components/LeaveBalance'
import LeaveRequestForm from './components/LeaveRequestForm'
import PendingRequests from './components/PendingRequests'
import Toast from './components/Toast'

const AppContent: React.FC = () => {
  const { user, loading: authLoading, switchMockUser } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Fetch data using Supabase hooks
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    createRequest,
    approveRequest,
    rejectRequest,
    refetch: refetchRequests
  } = useLeaveRequests(user?.tenant_id)

  const {
    balance,
    loading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance
  } = useLeaveBalance(user?.id, currentDate.getFullYear())

  const {
    leaveTypes,
    loading: typesLoading,
    error: typesError
  } = useLeaveTypes(user?.tenant_id)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  const handleUserChange = (userId: string) => {
    switchMockUser(userId)
  }

  const handleCreateRequest = async (
    leaveTypeId: string,
    startDate: string,
    endDate: string,
    reason?: string
  ) => {
    try {
      await createRequest({
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        reason,
      })
      showToast('Szabadságkérelem sikeresen elküldve!', 'success')
      refetchBalance()
    } catch (error) {
      console.error('Failed to create request:', error)
      showToast(
        error instanceof Error ? error.message : 'Hiba történt a kérelem létrehozásakor',
        'error'
      )
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveRequest(requestId, 'Jóváhagyva')
      showToast('Kérelem jóváhagyva!', 'success')
      refetchBalance()
    } catch (error) {
      console.error('Failed to approve request:', error)
      showToast('Hiba történt a jóváhagyás során', 'error')
    }
  }

  const handleRejectRequest = async (requestId: string, reason?: string) => {
    try {
      await rejectRequest(requestId, reason || 'Elutasítva')
      showToast('Kérelem elutasítva', 'success')
      refetchBalance()
    } catch (error) {
      console.error('Failed to reject request:', error)
      showToast('Hiba történt az elutasítás során', 'error')
    }
  }

  const pendingRequests = useMemo(
    () => requests.filter(req => req.status === 'pending'),
    [requests]
  )

  const myPendingRequests = useMemo(
    () => requests.filter(req => req.user_id === user?.id && req.status === 'pending'),
    [requests, user?.id]
  )

  const myRejectedRequests = useMemo(
    () => requests.filter(req => req.user_id === user?.id && req.status === 'rejected'),
    [requests, user?.id]
  )

  const isManager = user?.role === 'company_admin' || user?.role === 'platform_admin'

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Betöltés...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Nincs bejelentkezve felhasználó</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Header
        currentUser={user}
        onUserChange={handleUserChange}
        mockUsers={MOCK_USERS}
      />

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {requestsLoading ? (
            <div className="text-center py-8">Naptár betöltése...</div>
          ) : requestsError ? (
            <div className="text-center py-8 text-red-600">
              Hiba: {requestsError}
            </div>
          ) : (
            <Calendar
              date={currentDate}
              setDate={setCurrentDate}
              requests={requests}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-8">
          {/* User Info & Balance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-primary dark:text-primary-300">
              {user.full_name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {isManager ? '👨‍💼 Manager' : '👤 Munkavállaló'}
            </p>

            {balanceLoading ? (
              <div className="text-center py-4">Egyenleg betöltése...</div>
            ) : balanceError ? (
              <div className="text-red-600 text-sm">{balanceError}</div>
            ) : (
              <LeaveBalance balance={balance || []} />
            )}

            {!isManager && (
              <div className="mt-6">
                {typesLoading ? (
                  <div className="text-center py-4">Betöltés...</div>
                ) : typesError ? (
                  <div className="text-red-600 text-sm">{typesError}</div>
                ) : (
                  <LeaveRequestForm
                    leaveTypes={leaveTypes}
                    balance={balance || []}
                    onSubmit={handleCreateRequest}
                  />
                )}
              </div>
            )}
          </div>

          {/* Pending Requests (Manager Only) */}
          {isManager && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              {pendingRequests.length > 0 ? (
                <PendingRequests
                  requests={pendingRequests}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              ) : (
                <div className="text-center text-gray-500">
                  Nincsenek függőben lévő szabadságkérelmek.
                </div>
              )}
            </div>
          )}

          {/* Employee: My Pending Requests */}
          {!isManager && myPendingRequests.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                Függőben lévő kérelmeim
              </h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {myPendingRequests.map((req) => (
                  <li key={req.id} className="py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-medium">
                          ⏳ Jóváhagyásra vár
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Employee: My Rejected Requests */}
          {!isManager && myRejectedRequests.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                Elutasított kérelmeim
              </h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {myRejectedRequests.map((req) => (
                  <li key={req.id} className="py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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
                        {req.rejection_reason && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            <strong>Elutasítva:</strong> {req.rejection_reason}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Elutasítva: {new Date(req.rejected_at || '').toLocaleDateString('hu-HU')}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
