import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'

import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { useMobileMenu } from '../hooks/useMobileMenu'
import { DarkModeToggle } from './DarkModeToggle'
import { ThemeToggleCompact } from './ThemeToggleCompact'
import { MobileMenuToggle } from './MobileMenuToggle'
import { Button } from './ui/Button'

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'w-full text-left rounded-lg bg-purple-100 px-4 py-2.5 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 transition-colors'
    : 'w-full text-left rounded-lg px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors'

export function Sidebar() {
  const { user, signOut } = useSupabaseAuth()
  const { isOpen, close } = useMobileMenu()

  // Fechar menu ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        close()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen, close])

  return (
    <>
      {/* Header Mobile */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/70 px-3 sm:px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
        <div className="flex-1">
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">Finanças</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggleCompact />
          <MobileMenuToggle />
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={close} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-40 md:z-auto
          top-0 left-0 h-screen md:h-auto
          w-64 md:w-64
          flex flex-col gap-4 md:gap-6
          border-r border-slate-200 bg-white/70 p-4 backdrop-blur
          dark:border-slate-800 dark:bg-slate-950/40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className="flex flex-col gap-2 pt-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Finanças Pessoais</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 break-all">{user?.email ?? '—'}</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          <NavLink
            to="/dashboard"
            className={linkClassName}
            onClick={close}
          >
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/transactions"
            className={linkClassName}
            onClick={close}
          >
            💸 Transações
          </NavLink>
          <NavLink
            to="/categories"
            className={linkClassName}
            onClick={close}
          >
            🏷️ Categorias
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-3">
          <div className="hidden md:block">
            <DarkModeToggle />
          </div>

          <Button
            variant="danger"
            size="md"
            className="w-full"
            onClick={() => {
              signOut()
              close()
            }}
          >
            Sair
          </Button>
        </div>
      </aside>
    </>
  )
}

