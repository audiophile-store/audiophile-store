import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import cartReducer from '../features/cart/cartSlice'
import productReducer from '../features/product/productSlice'
import snackbarReducer from '../features/snackbar/snackbarSlice'
import authReducer from '../features/auth/authSlice'

export default configureStore({
  reducer: {
    counter: counterReducer,
    cart: cartReducer,
    products: productReducer,
    snackbar: snackbarReducer,
    auth: authReducer,
  },
})