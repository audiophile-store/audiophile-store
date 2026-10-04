import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Product } from '../../types/product';
import type { RootState } from '../../app/store';
import { getProduct, getProducts, ProductsApiError } from './productsApi';

export type ProductRequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed' | 'not-found';

interface ProductFailure {
  message: string;
  status?: number;
}

interface ProductDetailState {
  data: Product | null;
  status: ProductRequestStatus;
  error: string | null;
  requestId: string;
}

interface ProductState {
  data: Product[];
  status: ProductRequestStatus;
  error: string | null;
  details: Record<string, ProductDetailState | undefined>;
}

const initialState: ProductState = {
  data: [],
  status: 'idle',
  error: null,
  details: Object.create(null) as ProductState['details'],
};

function describeFailure(error: unknown): ProductFailure {
  if (error instanceof ProductsApiError) {
    return { message: error.message, status: error.status };
  }
  return {
    message: `Unable to load products. ${error instanceof Error ? error.message : 'Unknown error.'}`,
  };
}

export const fetchProducts = createAsyncThunk<
  Product[],
  void,
  { state: RootState; rejectValue: ProductFailure }
>(
  'products/fetchProducts',
  async (_, { signal, rejectWithValue }) => {
    try {
      return await getProducts(signal);
    } catch (error) {
      return rejectWithValue(describeFailure(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const status = getState().products.status;
      return status === 'idle' || status === 'failed';
    },
  }
);

export const fetchProduct = createAsyncThunk<
  Product,
  string,
  { state: RootState; rejectValue: ProductFailure }
>(
  'products/fetchProduct',
  async (id, { signal, rejectWithValue }) => {
    try {
      return await getProduct(id, signal);
    } catch (error) {
      return rejectWithValue(describeFailure(error));
    }
  },
  {
    condition: (id, { getState }) => getState().products.details[id]?.status !== 'loading',
  }
);

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message ?? action.error.message ?? 'Unable to load products.';
      })
      .addCase(fetchProduct.pending, (state, action) => {
        state.details[action.meta.arg] = {
          data: null,
          status: 'loading',
          error: null,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        const detail = state.details[action.meta.arg];
        if (!detail || detail.requestId !== action.meta.requestId) return;
        detail.data = action.payload;
        detail.status = 'succeeded';
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        const detail = state.details[action.meta.arg];
        if (!detail || detail.requestId !== action.meta.requestId) return;
        detail.status = action.payload?.status === 404 ? 'not-found' : 'failed';
        detail.error = action.payload?.message ?? action.error.message ?? 'Unable to load product.';
      });
  },
});

export default productSlice.reducer;
