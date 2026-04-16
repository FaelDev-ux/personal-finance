import { Navigate } from 'react-router-dom'

import type { ReactElement } from 'react'

import { useSupabaseAuth } from '../hooks/useSupabaseAuth'

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { session, loading } = useSupabaseAuth()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 dark:text-slate-400">
        Carregando...
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return children
}

