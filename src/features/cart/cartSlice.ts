import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types/product';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  checkoutItems: { id: string; quantity: number }[] | null;
}

const initialState: CartState = {
  items: [],
  isCartOpen: false,
  checkoutItems: null,
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
      const submittedItem = state.checkoutItems?.find((entry) => entry.id === item.id);
      if (submittedItem) {
        submittedItem.quantity = Math.min(submittedItem.quantity, Math.max(0, item.quantity - 1));
      }
      if (item.quantity <= 1) {
        state.items = state.items.filter((entry) => entry.id !== action.payload.id);
      } else {
        item.quantity -= 1;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.checkoutItems?.forEach((item) => {
        item.quantity = 0;
      });
    },
    beginCheckout: (state, action: PayloadAction<{ id: string; quantity: number }[]>) => {
      state.checkoutItems = action.payload.map((item) => ({ ...item }));
    },
    cancelCheckout: (state) => {
      state.checkoutItems = null;
    },
    completeCheckout: (state) => {
      // Only consume submitted units still in the cart, not later additions or re-added items.
      for (const submittedItem of state.checkoutItems ?? []) {
        const item = state.items.find((entry) => entry.id === submittedItem.id);
        if (item) item.quantity -= Math.min(item.quantity, submittedItem.quantity);
      }
      state.items = state.items.filter((item) => item.quantity > 0);
      state.checkoutItems = null;
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
  },
});

export const {
  addToCart,
  clearCart,
  openCart,
  closeCart,
  increaseCart,
  decreaseCart,
  beginCheckout,
  cancelCheckout,
  completeCheckout,
} = cartSlice.actions;

export default cartSlice.reducer;
