import type { OrderConfirmation, OrderRequest } from '../features/orders/ordersApi';
import { headphones } from './products';

export const orderRequest: OrderRequest = {
  customer: { name: 'Demo Buyer', email: 'buyer@example.com', phone: '+381601234567' },
  shippingAddress: {
    address: 'Demo Street 1',
    zipCode: '11000',
    city: 'Belgrade',
    country: 'Serbia',
  },
  paymentMethod: 'cash',
  items: [{ id: headphones.id, quantity: 2 }],
};

// Deliberately different from the cart's catalogue price to prove server authority.
export const orderConfirmation: OrderConfirmation = {
  orderId: '7b62b419-4a9b-42f5-a4ce-30dc59f92dd9',
  createdAt: '2026-10-06T00:00:00.000Z',
  currency: 'EUR',
  paymentMethod: 'cash',
  items: [
    {
      id: headphones.id,
      name: 'Confirmed headphones',
      quantity: 2,
      unitPriceCents: 4999,
      lineTotalCents: 9998,
    },
  ],
  totals: {
    subtotalCents: 9998,
    netSubtotalCents: 8332,
    vatCents: 1666,
    shippingCents: 1000,
    totalCents: 10998,
  },
};
