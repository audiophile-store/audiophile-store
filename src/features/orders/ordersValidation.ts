import { ORDER_FIELD_LIMITS } from './ordersApi';
import type { OrderRequest } from './ordersApi';

export interface OrderDraft {
  name: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;
  city: string;
  country: string;
}

export const EMPTY_ORDER_DRAFT: OrderDraft = {
  name: '',
  email: '',
  phone: '',
  address: '',
  zipCode: '',
  city: '',
  country: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{6,}$/;

export function validateOrderDraft(draft: OrderDraft): Partial<Record<keyof OrderDraft, string>> {
  const errors: Partial<Record<keyof OrderDraft, string>> = {};
  const requiredMessages: Record<keyof OrderDraft, string> = {
    name: 'Name is required',
    email: 'Email is required',
    phone: 'Phone number is required',
    address: 'Address is required',
    zipCode: 'ZIP code is required',
    city: 'City is required',
    country: 'Country is required',
  };
  for (const field of Object.keys(ORDER_FIELD_LIMITS) as (keyof OrderDraft)[]) {
    const value = draft[field].trim();
    if (!value) errors[field] = requiredMessages[field];
    else if (value.length > ORDER_FIELD_LIMITS[field]) {
      errors[field] = `Use no more than ${ORDER_FIELD_LIMITS[field]} characters`;
    } else if (field === 'email' && !EMAIL_PATTERN.test(value)) {
      errors.email = 'Enter a valid email address';
    } else if (field === 'phone' && !PHONE_PATTERN.test(value)) {
      errors.phone = 'Enter a valid phone number';
    }
  }
  return errors;
}

export function getOrderItemsError(items: OrderRequest['items']): string | null {
  if (items.length < 1) return 'Add at least one item to your cart.';
  if (items.length > 50) return 'An order can contain at most 50 different products.';
  if (
    new Set(items.map((item) => item.id.trim())).size !== items.length ||
    items.some(
      (item) =>
        !item.id.trim() ||
        item.id.trim().length > 100 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
    )
  ) {
    return 'Each product must have a valid ID and a quantity from 1 to 99.';
  }
  return null;
}
