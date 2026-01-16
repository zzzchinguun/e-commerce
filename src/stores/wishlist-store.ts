import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface WishlistProduct {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  image: string
  seller: {
    id: string
    storeName: string
    storeSlug: string
  }
}

interface WishlistState {
  items: WishlistProduct[]

  addItem: (product: WishlistProduct) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  getItemCount: () => number
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().isInWishlist(product.id)) {
          set((state) => ({
            items: [...state.items, product],
          }))
        }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }))
      },

      isInWishlist: (productId) =>
        get().items.some((item) => item.id === productId),

      getItemCount: () => get().items.length,

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
