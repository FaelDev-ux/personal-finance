import { useDarkMode } from '../hooks/useDarkMode'

// Garante que a classe `dark` seja aplicada mesmo fora do layout autenticado.
export function ThemeBootstrapper() {
  useDarkMode()
  return null
}

