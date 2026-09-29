import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import cartReducer from '../features/cart/cartSlice';
import productReducer from '../features/product/productSlice';
import snackbarReducer from '../features/snackbar/snackbarSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    cart: cartReducer,
    products: productReducer,
    snackbar: snackbarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
