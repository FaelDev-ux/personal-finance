import { create } from 'zustand'

interface MobileMenuStore {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

export const useMobileMenu = create<MobileMenuStore>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}))
