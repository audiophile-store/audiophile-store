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
      const { id, quantity, title, price, image, inStock } = action.payload;
      if (state.items.length === 0) {
        state.items.push({
          id,
          quantity,
          title,
          price,
          image,
          inStock,
        });
      } else {
        const alreadyInCart = state.items.find((item) => item.id === id);
        if (alreadyInCart) {
          const updatedCart = state.items.map((item) => {
            if (item.id === id) {
              return { ...item, quantity: item.quantity + quantity };
            } else {
              return item;
            }
          });

          state.items = updatedCart;
        } else {
          state.items.push({
            id,
            quantity,
            title,
            price,
            image,
            inStock,
          });
        }
      }
    },
    increaseCart: (state, action: PayloadAction<{ id: string; quantity?: number }>) => {
      const { id } = action.payload;
      const updated = state.items.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + 1 };
        } else {
          return { ...item };
        }
      });
      state.items = updated;
    },
    decreaseCart: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      let updated: CartItem[];
      if (quantity === 1) {
        updated = state.items.filter((item) => item.id !== id);
      } else {
        updated = state.items.map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity - 1 };
          } else {
            return { ...item };
          }
        });
      }
      state.items = updated;
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

// Action creators are generated for each case reducer function
export const { addToCart, clearCart, openCart, closeCart, increaseCart, decreaseCart } =
  cartSlice.actions;

export default cartSlice.reducer;
