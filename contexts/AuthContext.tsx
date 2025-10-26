import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  switchMockUser: (userId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

// MOCK USERS FOR LOCAL DEVELOPMENT
// Production: Clerk authentication will provide real user data
const MOCK_USERS: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    tenant_id: '00000000-0000-0000-0000-000000000099',
    email: 'manager@example.com',
    full_name: 'Nagy Péter',
    role: 'company_admin',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    tenant_id: '00000000-0000-0000-0000-000000000099',
    email: 'employee@example.com',
    full_name: 'Kovács Anna',
    role: 'staff',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    tenant_id: '00000000-0000-0000-0000-000000000099',
    email: 'employee2@example.com',
    full_name: 'Szabó Gábor',
    role: 'staff',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Localhost: Use mock user from localStorage
    const storedMockUserId = localStorage.getItem('szabi_mock_user_id')
    const mockUser = MOCK_USERS.find(u => u.id === storedMockUserId) || MOCK_USERS[1]
    setUser(mockUser)
    setLoading(false)

    // Production: Clerk will handle authentication
    // The parent ModulSite app will pass user data via props or context
  }, [])

  const switchMockUser = (userId: string) => {
    const mockUser = MOCK_USERS.find(u => u.id === userId)
    if (mockUser) {
      setUser(mockUser)
      localStorage.setItem('szabi_mock_user_id', userId)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, switchMockUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Export mock users for UI switcher
export { MOCK_USERS }
