import { useMobileMenu } from '../hooks/useMobileMenu'

export function MobileMenuToggle() {
  const { isOpen, toggle } = useMobileMenu()

  return (
    <button
      onClick={toggle}
      className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
    >
      <div className="flex flex-col gap-1.5">
        <span className={`h-0.5 w-5 bg-slate-900 dark:bg-slate-100 transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`h-0.5 w-5 bg-slate-900 dark:bg-slate-100 transition-all ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`h-0.5 w-5 bg-slate-900 dark:bg-slate-100 transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </div>
    </button>
  )
}
