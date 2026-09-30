import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types/product';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isCartOpen: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const payload = action.payload;
      const existing = state.items.find((item) => item.id === payload.id);

      if (existing) {
        existing.quantity = Math.min(existing.quantity + payload.quantity, existing.inStock);
      } else {
        state.items.push({ ...payload, quantity: Math.min(payload.quantity, payload.inStock) });
      }
    },
    increaseCart: (state, action: PayloadAction<{ id: string }>) => {
      const item = state.items.find((entry) => entry.id === action.payload.id);
      if (item) {
        item.quantity = Math.min(item.quantity + 1, item.inStock);
      }
    },
    decreaseCart: (state, action: PayloadAction<{ id: string }>) => {
      const item = state.items.find((entry) => entry.id === action.payload.id);
      if (!item) {
        return;
      }
      if (item.quantity <= 1) {
        state.items = state.items.filter((entry) => entry.id !== action.payload.id);
      } else {
        item.quantity -= 1;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
  },
});

export const { addToCart, clearCart, openCart, closeCart, increaseCart, decreaseCart } =
  cartSlice.actions;

export default cartSlice.reducer;
