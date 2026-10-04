import type { Product } from '../../types/product';

export class ProductsApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ProductsApiError';
  }
}

function getBaseUrl(): string {
  const value = import.meta.env.VITE_PRODUCTS_API_URL?.trim();
  if (!value) {
    throw new ProductsApiError('VITE_PRODUCTS_API_URL is not configured.');
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ProductsApiError('VITE_PRODUCTS_API_URL must be a valid HTTP or HTTPS URL.');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new ProductsApiError('VITE_PRODUCTS_API_URL must be a valid HTTP or HTTPS base URL.');
  }
  return url.href.replace(/\/+$/, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isProduct(value: unknown): value is Product {
  if (!isRecord(value) || !isRecord(value.images)) return false;

  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.title === 'string' &&
    typeof value.shortName === 'string' &&
    typeof value.generalInfo === 'string' &&
    typeof value.type === 'string' &&
    ['headphones', 'speakers', 'earphones'].includes(value.type) &&
    (value.newProduct === undefined || typeof value.newProduct === 'boolean') &&
    (value.popularProduct === undefined || typeof value.popularProduct === 'boolean') &&
    typeof value.price === 'number' &&
    Number.isFinite(value.price) &&
    value.price >= 0 &&
    typeof value.inStock === 'number' &&
    Number.isSafeInteger(value.inStock) &&
    value.inStock >= 0 &&
    typeof value.images.cover === 'string' &&
    typeof value.images.main === 'string' &&
    isStringArray(value.images.gallery) &&
    isStringArray(value.features) &&
    Array.isArray(value.inBox) &&
    value.inBox.every(
      (item: unknown) =>
        isRecord(item) &&
        typeof item.name === 'string' &&
        typeof item.quantity === 'number' &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity >= 0
    )
  );
}

async function get(path: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'GET',
    credentials: 'omit',
    signal,
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ProductsApiError('Invalid JSON response from the products service.', response.status);
  }
  if (!response.ok) {
    const message =
      isRecord(body) && typeof body.error === 'string'
        ? body.error
        : `Unable to load products (HTTP ${response.status}).`;
    throw new ProductsApiError(message, response.status);
  }
  return body;
}

export async function getProducts(signal: AbortSignal): Promise<Product[]> {
  const body = await get('/products', signal);
  if (
    !isRecord(body) ||
    !Array.isArray(body.products) ||
    !body.products.every(isProduct) ||
    new Set(body.products.map((product) => product.id)).size !== body.products.length
  ) {
    throw new ProductsApiError('Invalid catalogue response from the products service.');
  }
  return body.products;
}

export async function getProduct(id: string, signal: AbortSignal): Promise<Product> {
  const body = await get(`/products/${encodeURIComponent(id)}`, signal);
  if (!isProduct(body) || body.id !== id) {
    throw new ProductsApiError('Invalid product response from the products service.');
  }
  return body;
}
