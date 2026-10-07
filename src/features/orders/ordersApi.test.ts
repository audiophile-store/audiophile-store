import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOrder, OrdersApiError } from './ordersApi';
import { orderConfirmation, orderRequest } from '../../test/orders';
import { headphones } from '../../test/products';

const fetchMock = vi.fn<typeof fetch>();

function respond(body: unknown, status = 201) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('VITE_ORDERS_API_URL', 'http://localhost:3001/');
});

describe('orders API contract', () => {
  it('posts only trimmed customer/address, cash, IDs and quantities without prices or totals', async () => {
    respond(orderConfirmation);
    await expect(
      createOrder({
        ...orderRequest,
        customer: { ...orderRequest.customer, name: ' Demo Buyer ' },
        shippingAddress: { ...orderRequest.shippingAddress, city: ' Belgrade ' },
        items: [{ ...headphones, quantity: 2 }],
      })
    ).resolves.toEqual(orderConfirmation);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('http://localhost:3001/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      body: JSON.stringify(orderRequest),
    });
  });

  it.each([400, 409, 413, 422, 503, 500])('reports HTTP %i with no retry', async (status) => {
    respond({ error: 'Backend error' }, status);
    await expect(createOrder(orderRequest)).rejects.toMatchObject({
      name: 'OrdersApiError',
      status,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([200, 202, 204, 404])('does not accept HTTP %i as confirmed success', async (status) => {
    fetchMock.mockResolvedValue(
      new Response(status === 204 ? null : JSON.stringify(orderConfirmation), { status })
    );
    await expect(createOrder(orderRequest)).rejects.toThrow(/could not be confirmed/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('warns about possible persistence on a network failure and does not retry', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(createOrder(orderRequest)).rejects.toThrow(/may already have been saved/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid JSON with an uncertain-outcome warning', async () => {
    fetchMock.mockResolvedValue(new Response('not json', { status: 201 }));
    await expect(createOrder(orderRequest)).rejects.toThrow(/invalid order response/i);
  });

  it.each([
    null,
    {},
    { ...orderConfirmation, orderId: '' },
    { ...orderConfirmation, orderId: 'ORD-123' },
    { ...orderConfirmation, createdAt: '1' },
    { ...orderConfirmation, currency: 'USD' },
    { ...orderConfirmation, paymentMethod: 'e-money' },
    { ...orderConfirmation, items: [] },
    { ...orderConfirmation, items: [orderConfirmation.items[0], orderConfirmation.items[0]] },
    { ...orderConfirmation, items: [{ ...orderConfirmation.items[0], quantity: 1 }] },
    { ...orderConfirmation, items: [{ ...orderConfirmation.items[0], id: 'wrong-id' }] },
    { ...orderConfirmation, items: [{ ...orderConfirmation.items[0], unitPriceCents: 49.99 }] },
    { ...orderConfirmation, items: [{ ...orderConfirmation.items[0], lineTotalCents: -1 }] },
    { ...orderConfirmation, totals: { ...orderConfirmation.totals, totalCents: '10998' } },
    { ...orderConfirmation, totals: { ...orderConfirmation.totals, totalCents: 10999 } },
    { ...orderConfirmation, totals: { ...orderConfirmation.totals, netSubtotalCents: 8331 } },
    { ...orderConfirmation, totals: { ...orderConfirmation.totals, vatCents: null } },
    {
      ...orderConfirmation,
      totals: { ...orderConfirmation.totals, totalCents: Number.MAX_SAFE_INTEGER + 1 },
    },
  ])('rejects invalid or mismatched confirmations: %j', async (body) => {
    respond(body);
    await expect(createOrder(orderRequest)).rejects.toThrow(/invalid order response/i);
  });

  it.each([
    '',
    'not-a-url',
    'file:///orders',
    'https://user:password@example.test',
    'https://example.test?token=value',
    'https://example.test#fragment',
  ])('rejects invalid configuration before sending: %s', async (url) => {
    vi.stubEnv('VITE_ORDERS_API_URL', url);
    await expect(createOrder(orderRequest)).rejects.toBeInstanceOf(OrdersApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
