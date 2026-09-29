import { createSlice } from '@reduxjs/toolkit';
import JSONData from '../../db/products.json';
import type { Product } from '../../types/product';

interface ProductState {
  data: Product[];
  promoted: Product | null;
}

const initialState: ProductState = {
  data: [],
  promoted: null,
};

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchProducts: (state) => {
      state.data = JSONData.products as Product[];
    },
    setPromotedProduct: (state) => {
      state.promoted = state.data.filter((item) => item.promoted)[0] ?? null;
    },
  },
});

// Action creators are generated for each case reducer function
export const { fetchProducts, setPromotedProduct } = productSlice.actions;

export default productSlice.reducer;
