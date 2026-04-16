import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  // Verificar localStorage
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  }

  // Verificar preferência do sistema
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Inicializar tema ao montar
  useEffect(() => {
    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
    applyTheme(initialTheme)
    setMounted(true)
  }, [])

  // Atualizar DOM quando o tema muda
  useEffect(() => {
    if (!mounted) return
    applyTheme(theme)
  }, [theme, mounted])

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement
    
    if (newTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    
    // Salvar preferência
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', newTheme)
    }
  }

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggle, mounted }
}



