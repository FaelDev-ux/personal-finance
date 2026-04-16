import { useDarkMode } from '../hooks/useDarkMode'

export function DarkModeToggle() {
  const { theme, toggle } = useDarkMode()

  return (
    <button
      type="button"
      onClick={toggle}
      className="w-full rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-left text-sm text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900"
    >
      Tema: {theme === 'dark' ? 'Escuro' : 'Claro'}
    </button>
  )
}

