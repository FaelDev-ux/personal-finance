import { useDarkMode } from '../hooks/useDarkMode'

export function DarkModeToggle() {
  const { theme, toggle } = useDarkMode()

  return (
    <button
      type="button"
      onClick={toggle}
      className="group relative flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      <span className="flex items-center gap-2">
        <span className="text-lg">{theme === 'dark' ? '🌙' : '☀️'}</span>
        <span>
          {theme === 'dark' ? 'Tema Escuro' : 'Tema Claro'}
        </span>
      </span>
      <span className="inline-flex h-5 w-9 items-center rounded-full bg-slate-300 transition-colors duration-300 dark:bg-slate-600">
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
            theme === 'dark' ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}


