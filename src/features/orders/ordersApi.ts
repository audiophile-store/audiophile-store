export interface OrderRequest {
  customer: { name: string; email: string; phone: string };
  shippingAddress: { address: string; zipCode: string; city: string; country: string };
  paymentMethod: 'cash';
  items: { id: string; quantity: number }[];
}

export interface OrderConfirmation {
  orderId: string;
  createdAt: string;
  currency: 'EUR';
  paymentMethod: 'cash';
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }[];
  totals: {
    subtotalCents: number;
    netSubtotalCents: number;
    vatCents: number;
    shippingCents: number;
    totalCents: number;
  };
}

export const ORDER_FIELD_LIMITS = {
  name: 100,
  email: 254,
  phone: 32,
  address: 200,
  zipCode: 20,
  city: 100,
  country: 100,
} as const;

const UNCERTAIN_OUTCOME =
  'The order could not be confirmed. It may already have been saved. Check with the store before submitting again to avoid a duplicate order.';

export class OrdersApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'OrdersApiError';
  }
}

function getBaseUrl(): string {
  const value = import.meta.env.VITE_ORDERS_API_URL?.trim();
  if (!value) throw new OrdersApiError('VITE_ORDERS_API_URL is not configured.');

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new OrdersApiError('VITE_ORDERS_API_URL must be a valid HTTP or HTTPS URL.');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new OrdersApiError('VITE_ORDERS_API_URL must be a valid HTTP or HTTPS base URL.');
  }
  return url.href.replace(/\/+$/, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCents(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function isOrderConfirmation(value: unknown): value is OrderConfirmation {
  if (
    !isRecord(value) ||
    typeof value.orderId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.orderId) ||
    typeof value.createdAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.createdAt) ||
    !Number.isFinite(Date.parse(value.createdAt)) ||
    value.currency !== 'EUR' ||
    value.paymentMethod !== 'cash' ||
    !Array.isArray(value.items) ||
    value.items.length < 1 ||
    value.items.length > 50 ||
    !isRecord(value.totals)
  ) {
    return false;
  }

  let subtotal = 0;
  const ids = new Set<string>();
  for (const item of value.items) {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      !item.id.trim() ||
      item.id.length > 100 ||
      ids.has(item.id) ||
      typeof item.name !== 'string' ||
      !item.name.trim() ||
      typeof item.quantity !== 'number' ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99 ||
      !isCents(item.unitPriceCents) ||
      !isCents(item.lineTotalCents) ||
      item.unitPriceCents * item.quantity !== item.lineTotalCents
    ) {
      return false;
    }
    ids.add(item.id);
    subtotal += item.lineTotalCents;
    if (!Number.isSafeInteger(subtotal)) return false;
  }

  const totals = value.totals;
  return (
    isCents(totals.subtotalCents) &&
    isCents(totals.netSubtotalCents) &&
    isCents(totals.vatCents) &&
    isCents(totals.shippingCents) &&
    isCents(totals.totalCents) &&
    totals.subtotalCents === subtotal &&
    totals.netSubtotalCents + totals.vatCents === subtotal &&
    subtotal + totals.shippingCents === totals.totalCents
  );
}

const HTTP_ERRORS: Record<number, string> = {
  400: 'The order details are invalid. Check your form and cart before submitting again.',
  409: 'Some items no longer have enough stock. Review your cart before submitting again.',
  413: 'The order is too large. Reduce the number of items before submitting again.',
  422: 'Some products are no longer available. Review your cart before submitting again.',
  503: 'The products service is unavailable. Your order was not placed. Please try later.',
  500: 'The order service could not save your order. Please try later.',
};

export async function createOrder(request: OrderRequest): Promise<OrderConfirmation> {
  const url = `${getBaseUrl()}/orders`;
  const { name, email, phone } = request.customer;
  const { address, zipCode, city, country } = request.shippingAddress;
  const payload: OrderRequest = {
    customer: { name: name.trim(), email: email.trim(), phone: phone.trim() },
    shippingAddress: {
      address: address.trim(),
      zipCode: zipCode.trim(),
      city: city.trim(),
      country: country.trim(),
    },
    paymentMethod: 'cash',
    items: request.items.map(({ id, quantity }) => ({ id: id.trim(), quantity })),
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      body: JSON.stringify(payload),
    });
  } catch {
    throw new OrdersApiError(`Network error. ${UNCERTAIN_OUTCOME}`);
  }

  if (response.status !== 201) {
    throw new OrdersApiError(
      HTTP_ERRORS[response.status] ?? `Unexpected HTTP ${response.status}. ${UNCERTAIN_OUTCOME}`,
      response.status
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new OrdersApiError(`Invalid order response. ${UNCERTAIN_OUTCOME}`, response.status);
  }
  if (
    !isOrderConfirmation(body) ||
    body.items.length !== payload.items.length ||
    !payload.items.every((requested) =>
      body.items.some((item) => item.id === requested.id && item.quantity === requested.quantity)
    )
  ) {
    throw new OrdersApiError(`Invalid order response. ${UNCERTAIN_OUTCOME}`, response.status);
  }
  return body;
}
