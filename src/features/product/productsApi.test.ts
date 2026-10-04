import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getProduct, getProducts, ProductsApiError } from './productsApi';
import { headphones, products } from '../../test/products';

const fetchMock = vi.fn<typeof fetch>();
const signal = new AbortController().signal;

function respond(body: unknown, status = 200) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('VITE_PRODUCTS_API_URL', 'http://localhost:3000/');
});

describe('products API validation', () => {
  it('preserves the catalogue order, fields, euro prices and image paths', async () => {
    respond({ products });
    await expect(getProducts(signal)).resolves.toEqual(products);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/products', {
      method: 'GET',
      credentials: 'omit',
      signal,
    });
  });

  it('accepts an empty catalogue', async () => {
    respond({ products: [] });
    await expect(getProducts(signal)).resolves.toEqual([]);
  });

  it.each([
    { type: ['headphones'] },
    { type: 'unknown' },
    { price: '123.45' },
    { price: -1 },
    { inStock: 1.5 },
    { inStock: -1 },
    { images: { main: '/main.png', cover: '/cover.png', gallery: [42] } },
    { features: [42] },
    { inBox: [{ name: 'Headphones', quantity: '1' }] },
    { newProduct: 'true' },
    { popularProduct: 1 },
  ])('rejects malformed product fields: %j', async (fields) => {
    respond({ products: [{ ...headphones, ...fields }] });
    await expect(getProducts(signal)).rejects.toThrow(/invalid catalogue/i);
  });

  it('rejects duplicate IDs without silently dropping products', async () => {
    respond({ products: [headphones, headphones] });
    await expect(getProducts(signal)).rejects.toThrow(/invalid catalogue/i);
  });

  it('rejects a mismatched detail ID', async () => {
    respond({ ...headphones, id: 'another-id' });
    await expect(getProduct(headphones.id, signal)).rejects.toThrow(/invalid product/i);
  });

  it.each([
    [404, 'Product not found'],
    [500, 'Internal server error'],
  ])('preserves HTTP %i and the server error message', async (status, message) => {
    respond({ error: message }, status);
    await expect(getProduct(headphones.id, signal)).rejects.toMatchObject({
      name: 'ProductsApiError',
      status,
      message,
    });
  });

  it.each([
    'file:///products',
    'https://user:password@example.test',
    'https://example.test?token=value',
    'https://example.test#fragment',
  ])('rejects unsupported or credential-bearing base URLs: %s', async (url) => {
    vi.stubEnv('VITE_PRODUCTS_API_URL', url);
    await expect(getProducts(signal)).rejects.toBeInstanceOf(ProductsApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
