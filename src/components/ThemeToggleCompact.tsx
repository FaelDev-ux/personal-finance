import { useDarkMode } from '../hooks/useDarkMode'

export function ThemeToggleCompact() {
  const { theme, toggle } = useDarkMode()

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
      title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      aria-label={`Tema: ${theme === 'dark' ? 'Escuro' : 'Claro'}`}
    >
      <span className="text-lg">
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
