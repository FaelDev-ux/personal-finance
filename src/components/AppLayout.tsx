import { Outlet } from 'react-router-dom'

import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-auto px-3 py-4 sm:px-4 md:px-6 md:py-6">
        <Outlet />
      </main>
    </div>
  )
}

