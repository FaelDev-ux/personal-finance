import { NavLink } from 'react-router-dom'

import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { DarkModeToggle } from './DarkModeToggle'

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'rounded-lg bg-slate-200 px-3 py-2 text-slate-900 dark:bg-slate-800 dark:text-white'
    : 'rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'

export function Sidebar() {
  const { user, signOut } = useSupabaseAuth()

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
      <div>
        <div className="text-lg font-semibold text-slate-900 dark:text-white">Finanças Pessoais</div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user?.email ?? '—'}</div>
      </div>

      <nav className="flex flex-col gap-1">
        <NavLink to="/dashboard" className={linkClassName}>
          Dashboard
        </NavLink>
        <NavLink to="/transactions" className={linkClassName}>
          Transações
        </NavLink>
        <NavLink to="/categories" className={linkClassName}>
          Categorias
        </NavLink>
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <DarkModeToggle />

        <button
          type="button"
          onClick={() => signOut()}
          className="w-full rounded-md border border-rose-200 bg-white/70 px-3 py-2 text-sm text-rose-700 hover:bg-white dark:border-rose-900/50 dark:bg-slate-900/40 dark:text-rose-200 dark:hover:bg-slate-900"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}

