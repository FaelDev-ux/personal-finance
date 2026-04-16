import { useEffect } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'

// Aplicar tema imediatamente antes da renderização para evitar flash
if (typeof window !== 'undefined') {
  const stored = window.localStorage.getItem('theme')
  const theme = stored === 'dark' || 
    (stored !== 'light' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
    ? 'dark'
    : 'light'
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function ThemeBootstrapper() {
  const { mounted } = useDarkMode()

  // Sincronizar com mudanças do sistema
  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = window.localStorage.getItem('theme')
      // Só mudar automaticamente se não houver preferência salva
      if (!stored) {
        const html = document.documentElement
        if (e.matches) {
          html.classList.add('dark')
        } else {
          html.classList.remove('dark')
        }
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mounted])

  return null
}



