import { create } from 'zustand'

interface UIState {
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
  isFilterOpen: boolean

  toggleMobileMenu: () => void
  toggleSearch: () => void
  toggleFilter: () => void
  closeMobileMenu: () => void
  closeSearch: () => void
  closeFilter: () => void
  closeAll: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isFilterOpen: false,

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleSearch: () =>
    set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  toggleFilter: () =>
    set((state) => ({ isFilterOpen: !state.isFilterOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
  closeFilter: () => set({ isFilterOpen: false }),
  closeAll: () =>
    set({
      isMobileMenuOpen: false,
      isSearchOpen: false,
      isFilterOpen: false,
    }),
}))
