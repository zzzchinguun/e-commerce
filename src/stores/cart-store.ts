import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartProduct {
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

export interface CartItem {
  id: string
  product: CartProduct
  variantId?: string
  variantOptions?: Record<string, string>
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (product: CartProduct, quantity?: number, variantId?: string, variantOptions?: Record<string, string>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void

  // Computed
  getItemCount: () => number
  getSubtotal: () => number
  getItem: (productId: string, variantId?: string) => CartItem | undefined
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, variantId, variantOptions) => {
        set((state) => {
          // Check if item already exists
          const existingItem = state.items.find(
            (item) =>
              item.product.id === product.id &&
              item.variantId === variantId
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === existingItem.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }

          // Add new item
          return {
            items: [
              ...state.items,
              {
                id: crypto.randomUUID(),
                product,
                variantId,
                variantOptions,
                quantity,
              },
            ],
          }
        })
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }))
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity }
              : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getItemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ),

      getItem: (productId, variantId) =>
        get().items.find(
          (item) =>
            item.product.id === productId &&
            item.variantId === variantId
        ),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
