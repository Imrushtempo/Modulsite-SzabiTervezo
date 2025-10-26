import React from 'react'
import type { User } from '../types'

interface HeaderProps {
  currentUser: User
  onUserChange: (userId: string) => void
  mockUsers: User[]
}

const Header: React.FC<HeaderProps> = ({ currentUser, onUserChange, mockUsers }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            🏖️ Szabi Tervező
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="user-select" className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Nézet:
          </label>
          <select
            id="user-select"
            value={currentUser.id}
            onChange={(e) => onUserChange(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            data-testid="user-switcher"
            aria-label="Felhasználó váltás"
          >
            {mockUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.role === 'company_admin' || user.role === 'platform_admin' ? 'Manager' : 'Munkavállaló'})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}

export default Header
