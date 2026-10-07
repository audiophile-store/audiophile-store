import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { beginCheckout, cancelCheckout, completeCheckout } from '../cart/cartSlice';
import { createOrder, OrdersApiError } from './ordersApi';
import type { OrderConfirmation } from './ordersApi';
import { EMPTY_ORDER_DRAFT, getOrderItemsError, validateOrderDraft } from './ordersValidation';
import type { OrderDraft } from './ordersValidation';

interface OrdersState {
  draft: OrderDraft;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  confirmation: OrderConfirmation | null;
}

const initialState: OrdersState = {
  draft: EMPTY_ORDER_DRAFT,
  status: 'idle',
  error: null,
  confirmation: null,
};

export const submitOrder = createAsyncThunk<
  OrderConfirmation,
  void,
  { state: Pick<RootState, 'orders' | 'cart'>; rejectValue: string }
>(
  'orders/submitOrder',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const { orders, cart } = getState();
    const draft = orders.draft;
    const items = cart.items.map(({ id, quantity }) => ({ id, quantity }));
    const cartError = getOrderItemsError(items);
    if (cartError || Object.keys(validateOrderDraft(draft)).length > 0) {
      return rejectWithValue(cartError ?? 'Check your checkout form before submitting.');
    }
    dispatch(beginCheckout(items));
    try {
      const confirmation = await createOrder({
        customer: { name: draft.name, email: draft.email, phone: draft.phone },
        shippingAddress: {
          address: draft.address,
          zipCode: draft.zipCode,
          city: draft.city,
          country: draft.country,
        },
        paymentMethod: 'cash',
        items,
      });
      dispatch(completeCheckout());
      return confirmation;
    } catch (error) {
      dispatch(cancelCheckout());
      return rejectWithValue(
        error instanceof OrdersApiError
          ? error.message
          : 'An unexpected error prevented order confirmation. Check with the store before submitting again to avoid a duplicate order.'
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const status = getState().orders.status;
      return status === 'idle' || status === 'failed';
    },
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    updateOrderDraft: (
      state,
      action: PayloadAction<{ field: keyof OrderDraft; value: string }>
    ) => {
      if (state.status === 'loading' || state.status === 'succeeded') return;
      state.draft[action.payload.field] = action.payload.value;
    },
    acknowledgeOrder: (state) => {
      if (state.status !== 'succeeded') return;
      state.status = 'idle';
      state.draft = EMPTY_ORDER_DRAFT;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.confirmation = action.payload;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Unable to confirm the order.';
      });
  },
});

export const { updateOrderDraft, acknowledgeOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
