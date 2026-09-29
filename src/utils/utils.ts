import type { Dispatch } from '@reduxjs/toolkit';
import { decreaseCart, increaseCart } from '../features/cart/cartSlice';

export const increase = (
  id: string,
  quantity: number,
  inStock: number,
  message: string,
  dispatch: Dispatch,
  snackbarSetter: (open: boolean) => void,
  messageSetter: (message: string) => void
): void => {
  dispatch(increaseCart({ id, quantity }));
  if (quantity + 1 === inStock) {
    snackbarSetter(true);
    messageSetter(message);
  }
};

export const decrease = (id: string, quantity: number, dispatch: Dispatch): void => {
  dispatch(decreaseCart({ id, quantity }));
};

export const formatCurrency = (number: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};
