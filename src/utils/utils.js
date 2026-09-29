import { decreaseCart, increaseCart } from '../features/cart/cartSlice';


export const increase = (id, quantity, inStock, message, dispatch, snackbarSetter, messageSetter) => {
  dispatch(increaseCart({ id, quantity }));
  if (quantity + 1 === inStock) {
    snackbarSetter(true);
    messageSetter(message)
  }
}

export const decrease = (id, quantity, dispatch) => {
    dispatch(decreaseCart({ id, quantity }));
  }


export const formatCurrency = (number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}