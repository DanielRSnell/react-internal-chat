import { type ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginPage } from './LoginPage'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100"></div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return <>{children}</>
}
