import { CartProduct } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type functionParams = {
  id: string;
  size: string;
  color: string;
};

interface StoreState {
  productStore: CartProduct[];
  addItemToStore: (item: CartProduct) => void;
  removeItemFromStore: (index: functionParams) => void;
  increaseQuantity: (index: functionParams) => void;
  decreaseQuantity: (index: functionParams) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      productStore: [],

      addItemToStore: (item) => {
        const existingIndex = get().productStore.findIndex(
          (p) =>
            p.id === item.id && p.size === item.size && p.color === item.color
        );

        if (existingIndex !== -1) {
          const updatedProducts = [...get().productStore];
          updatedProducts[existingIndex].quantity += item.quantity;
          set({ productStore: updatedProducts });
        } else {
          set({ productStore: [...get().productStore, item] });
        }
      },

      removeItemFromStore: ({ id, size, color }: functionParams) =>
        set((state) => {
          const updated = state.productStore.filter(
            (item) =>
              item.id !== id || item.size !== size || item.color !== color
          );
          return { productStore: updated };
        }),

      increaseQuantity: ({ id, size, color }: functionParams) =>
        set((state) => {
          const updated = state.productStore.map((item) =>
            item.id === id && item.size === size && item.color === color
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          return { productStore: updated };
        }),

      decreaseQuantity: ({ id, size, color }: functionParams) =>
        set((state) => {
          const updated = state.productStore
            .map((item) =>
              item.id === id && item.size === size && item.color === color
                ? item.quantity > 1
                  ? { ...item, quantity: item.quantity - 1 }
                  : null // mark for removal
                : item
            )
            .filter((item) => item !== null) as typeof state.productStore;

          return { productStore: updated };
        }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
