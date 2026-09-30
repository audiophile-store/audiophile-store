import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import catalogue from '../../db/products.json';
import type { Product } from '../../types/product';

interface ProductState {
  data: Product[];
}

// The catalogue is a static JSON file, so it can be loaded synchronously.
// Swap this for a thunk once the products come from a real API.
const initialState: ProductState = {
  data: catalogue.products as Product[],
};

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.data = action.payload;
    },
  },
});

export const { setProducts } = productSlice.actions;

export default productSlice.reducer;
