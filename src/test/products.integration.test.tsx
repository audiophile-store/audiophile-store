import { configureStore } from '@reduxjs/toolkit';
import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import productReducer from '../features/product/productSlice';
import cartReducer from '../features/cart/cartSlice';
import snackbarReducer from '../features/snackbar/snackbarSlice';
import { earphones, headphones, products, speakers } from './products';
import type { Product } from '../types/product';

const fetchMock = vi.fn<typeof fetch>();
const apiUrl = 'http://localhost:3000';
const applicationSources = import.meta.glob(
  ['../**/*.{ts,tsx}', '!../**/*.test.{ts,tsx}', '!../test/**'],
  { eager: true, query: '?raw', import: 'default' }
);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function requestPath(input: Parameters<typeof fetch>[0]) {
  return new URL(input instanceof Request ? input.url : String(input)).pathname;
}

function mockCatalogue(catalogue: Product[] = products) {
  fetchMock.mockImplementation(async (input) => {
    const path = requestPath(input);
    if (path === '/products') return jsonResponse({ products: catalogue });
    const product = catalogue.find((item) => path === `/products/${item.id}`);
    return product ? jsonResponse(product) : jsonResponse({ error: 'Product not found' }, 404);
  });
}

function NavigationControl() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(`/article/${speakers.id}`)}>Open next service product</button>
  );
}

function renderStorefront(path = '/products') {
  const store = configureStore({
    reducer: {
      products: productReducer,
      cart: cartReducer,
      snackbar: snackbarReducer,
    },
  });

  render(
    <StrictMode>
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <SnackbarProvider>
            <NavigationControl />
            <App />
          </SnackbarProvider>
        </MemoryRouter>
      </Provider>
    </StrictMode>
  );
  return store;
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('VITE_PRODUCTS_API_URL', apiUrl);
  mockCatalogue();
});

describe('products service integration contract', () => {
  it('places the SKU at the bottom of the product card without empty title metadata', async () => {
    mockCatalogue([{ ...headphones, newProduct: false }]);
    renderStorefront(`/article/${headphones.id}`);

    const title = await screen.findByRole('heading', { name: headphones.title });
    const card = title.closest('.Article-Description');
    expect(card).not.toBeNull();
    expect(card?.lastElementChild).toBe(screen.getByText(`SKU ${headphones.id}`));
    expect(card?.querySelector('.Article-Metadata')).toBeNull();
    expect(screen.getByText('2-Year Warranty')).toBeVisible();
    expect(screen.getByText('Fast shipping')).toBeVisible();
    expect(screen.getByText('Secure payment')).toBeVisible();
  });

  it('keeps the product detail skeleton visible when development loading is forced', async () => {
    vi.stubEnv('VITE_FORCE_PRODUCTS_LOADING', 'true');
    const store = renderStorefront(`/article/${headphones.id}`);

    await waitFor(() =>
      expect(store.getState().products.details[headphones.id]?.status).toBe('succeeded')
    );
    expect(screen.getByRole('progressbar', { name: 'Loading products' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'ADD TO CART' })).not.toBeInTheDocument();
  });

  it('uses the existing toast when adding a catalogue product to the cart', async () => {
    const store = renderStorefront();

    const add = await screen.findByRole('button', {
      name: `Add to cart: ${headphones.title}`,
    });
    fireEvent.click(add);

    expect(await screen.findByText('The article has been added to your cart!')).toBeVisible();
    expect(store.getState().cart.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: headphones.id, quantity: 1 })])
    );
    expect(store.getState().snackbar.isOpen).toBe(false);
  });

  it('does not import the static catalogue in application code', () => {
    for (const [path, source] of Object.entries(applicationSources)) {
      expect(source, path).not.toMatch(
        /(?:from\s*|import\s*\(|require\s*\()\s*['"][^'"]*products\.json['"]/
      );
    }
  });

  it('starts without a bundled static catalogue', () => {
    expect(productReducer(undefined, { type: 'test/init' }).data).toEqual([]);
  });

  it('loads the response envelope and preserves server order and every product field', async () => {
    const store = renderStorefront();

    await screen.findByRole('heading', { name: headphones.title });
    expect(store.getState().products.data).toEqual(products);
    const headings = screen.getAllByRole('heading', { level: 4 });
    expect(headings.map((heading) => heading.textContent)).toEqual(
      products.map((product) => product.title)
    );
  });

  it('uses the configured base URL with a plain credential-free GET', async () => {
    renderStorefront();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const catalogueCall = fetchMock.mock.calls.find(
      ([input]) => requestPath(input) === '/products'
    );
    expect(
      fetchMock.mock.calls.filter(([input]) => requestPath(input) === '/products')
    ).toHaveLength(1);
    expect(catalogueCall).toBeDefined();
    const [input, init] = catalogueCall!;
    const request = new Request(input, init);
    expect(request.url).toBe(`${apiUrl}/products`);
    expect(request.method).toBe('GET');
    expect(request.credentials).toBe('omit');
    expect([...request.headers.entries()]).toEqual([]);
    expect(request.body).toBeNull();
    for (const [requestedInput, options] of fetchMock.mock.calls) {
      expect(new Request(requestedInput, options).method).toBe('GET');
    }
  });

  it('uses a different environment URL rather than a hardcoded service address', async () => {
    vi.stubEnv('VITE_PRODUCTS_API_URL', 'https://catalogue.example.test');
    renderStorefront();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(
      fetchMock.mock.calls.some(([input]) => {
        const url = new URL(input instanceof Request ? input.url : String(input));
        return url.href === 'https://catalogue.example.test/products';
      })
    ).toBe(true);
  });

  it('reports missing configuration instead of using a static or hardcoded fallback', async () => {
    vi.stubEnv('VITE_PRODUCTS_API_URL', '');
    const store = renderStorefront();

    await screen.findByText(/VITE_PRODUCTS_API_URL|configuration|configured/i);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(store.getState().products.data).toEqual([]);
  });

  it('reports an invalid API URL before attempting a request', async () => {
    vi.stubEnv('VITE_PRODUCTS_API_URL', 'not-a-url');
    const store = renderStorefront();

    await screen.findByText(/VITE_PRODUCTS_API_URL|configuration|invalid.*url/i);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(store.getState().products.data).toEqual([]);
  });

  it('shows loading until the catalogue request completes', async () => {
    let resolveResponse!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveResponse = resolve;
      })
    );
    renderStorefront();

    await screen.findByRole('progressbar');
    expect(screen.queryByRole('heading', { name: headphones.title })).not.toBeInTheDocument();
    await act(async () => resolveResponse(jsonResponse({ products })));
    await screen.findByRole('heading', { name: headphones.title });
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders an empty catalogue as an empty result, not endless loading', async () => {
    mockCatalogue([]);
    const store = renderStorefront();

    await screen.findByText(/no products|no items|catalogue is empty|catalog is empty/i);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(store.getState().products.data).toEqual([]);
  });

  it.each([
    ['server error', () => Promise.resolve(jsonResponse({ error: 'Internal server error' }, 500))],
    ['network error', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['invalid envelope', () => Promise.resolve(jsonResponse(products))],
    ['invalid product', () => Promise.resolve(jsonResponse({ products: [{ id: 'broken' }] }))],
    ['invalid JSON', () => Promise.resolve(new Response('not JSON', { status: 200 }))],
  ])('surfaces a %s with retry and no static catalogue fallback', async (_name, respond) => {
    fetchMock.mockImplementation(respond);
    const store = renderStorefront();

    const retry = await screen.findByRole('button', { name: /retry|try again/i });
    expect(screen.getByRole('alert')).toHaveTextContent(/error|failed|unable|invalid/i);
    expect(store.getState().products.data).toEqual([]);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    mockCatalogue();
    fireEvent.click(retry);
    await screen.findByRole('heading', { name: headphones.title });
    expect(store.getState().products.data).toEqual(products);
  });

  it.each([
    ['/headphones', headphones],
    ['/speakers', speakers],
    ['/earphones', earphones],
  ])('filters the service catalogue on %s', async (path, expectedProduct) => {
    renderStorefront(path);

    await screen.findByRole('heading', { name: expectedProduct.title });
    for (const other of products.filter((product) => product.id !== expectedProduct.id)) {
      expect(screen.queryByRole('heading', { name: other.title })).not.toBeInTheDocument();
    }
  });

  it('renders only popular service products on the home page', async () => {
    renderStorefront('/');

    await screen.findByText(headphones.title);
    expect(screen.queryByText(speakers.title)).not.toBeInTheDocument();
    expect(screen.queryByText(earphones.title)).not.toBeInTheDocument();
  });

  it('shows service products in the existing admin without sending write requests', async () => {
    renderStorefront('/admin');

    await screen.findByText(headphones.shortName);
    expect(screen.getByText(speakers.shortName)).toBeInTheDocument();
    expect(screen.getByText(earphones.shortName)).toBeInTheDocument();
    for (const [input, init] of fetchMock.mock.calls) {
      expect(new Request(input, init).method).toBe('GET');
    }
  });

  it('opens a product directly using the detail endpoint, euro price and frontend images', async () => {
    fetchMock.mockImplementation(async (input) =>
      requestPath(input) === '/products'
        ? jsonResponse({
            products: [{ ...headphones, title: 'Outdated list title', price: 999, inStock: 10 }],
          })
        : jsonResponse(headphones)
    );
    renderStorefront(`/article/${headphones.id}`);

    await screen.findByRole('heading', { name: headphones.title });
    expect(fetchMock.mock.calls.some(([input]) => requestPath(input) === '/products/h-01')).toBe(
      true
    );
    expect(screen.getByText(/123,45\s*\u20ac/)).toBeInTheDocument();
    expect(screen.getByText(/In stock/)).toHaveTextContent('2');
    const images = screen.getAllByRole('img', { name: `${headphones.title}, view 1` });
    expect(images[0]).toHaveAttribute('src', expect.stringContaining('xx99II/main.png'));
    expect(images[0].getAttribute('src')).not.toContain(apiUrl);
  });

  it('uses a credential-free plain GET for product details too', async () => {
    renderStorefront(`/article/${headphones.id}`);

    await screen.findByRole('heading', { name: headphones.title });
    const detailCall = fetchMock.mock.calls.find(
      ([input]) => requestPath(input) === `/products/${headphones.id}`
    );
    expect(detailCall).toBeDefined();
    const [input, init] = detailCall!;
    const request = new Request(input, init);
    expect(request.url).toBe(`${apiUrl}/products/${headphones.id}`);
    expect(request.method).toBe('GET');
    expect(request.credentials).toBe('omit');
    expect([...request.headers.entries()]).toEqual([]);
    expect(request.body).toBeNull();
  });

  it('loads detail independently when the catalogue endpoint fails', async () => {
    fetchMock.mockImplementation(async (input) =>
      requestPath(input) === '/products'
        ? jsonResponse({ error: 'Internal server error' }, 500)
        : jsonResponse(headphones)
    );
    renderStorefront(`/article/${headphones.id}`);

    await screen.findByRole('heading', { name: headphones.title });
    expect(screen.getByRole('button', { name: 'ADD TO CART' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables buying when the service reports zero stock', async () => {
    mockCatalogue([{ ...headphones, inStock: 0 }]);
    const store = renderStorefront(`/article/${headphones.id}`);

    const add = await screen.findByRole('button', { name: 'ADD TO CART' });
    expect(add).toBeDisabled();
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    fireEvent.click(add);
    expect(store.getState().cart.items).toEqual([]);
  });

  it('adds the fetched product to the cart and respects service stock', async () => {
    const store = renderStorefront(`/article/${headphones.id}`);

    const add = await screen.findByRole('button', { name: 'ADD TO CART' });
    fireEvent.click(add);
    fireEvent.click(add);

    expect(store.getState().cart.items).toEqual([
      {
        id: headphones.id,
        title: headphones.shortName,
        price: 123.45,
        image: '/xx99II/main.png',
        inStock: 2,
        quantity: 2,
      },
    ]);
    expect(add).toBeDisabled();
  });

  it.each(['missing-id', '__proto__', 'constructor', 'toString'])(
    'distinguishes missing product %s from a server failure',
    async (id) => {
      renderStorefront(`/article/${id}`);

      await screen.findByText(/product not found/i);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'ADD TO CART' })).not.toBeInTheDocument();
      expect(fetchMock.mock.calls.some(([input]) => requestPath(input) === `/products/${id}`)).toBe(
        true
      );
    }
  );

  it('honors detail 404 even when the list still contains that product', async () => {
    fetchMock.mockImplementation(async (input) =>
      requestPath(input) === '/products'
        ? jsonResponse({ products })
        : jsonResponse({ error: 'Product not found' }, 404)
    );
    renderStorefront(`/article/${headphones.id}`);

    await screen.findByText(/product not found/i);
    expect(
      fetchMock.mock.calls.some(([input]) => requestPath(input) === `/products/${headphones.id}`)
    ).toBe(true);
    expect(screen.queryByRole('heading', { name: headphones.title })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ADD TO CART' })).not.toBeInTheDocument();
  });

  it('shows a retryable detail server error rather than product not found', async () => {
    fetchMock.mockImplementation(async (input) =>
      requestPath(input) === '/products'
        ? jsonResponse({ products })
        : jsonResponse({ error: 'Internal server error' }, 500)
    );
    renderStorefront(`/article/${headphones.id}`);

    const retry = await screen.findByRole('button', { name: /retry|try again/i });
    expect(screen.getByRole('alert')).toHaveTextContent(/error|failed|unable/i);
    expect(screen.queryByText(/product not found/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ADD TO CART' })).not.toBeInTheDocument();

    mockCatalogue();
    fireEvent.click(retry);
    await screen.findByRole('heading', { name: headphones.title });
  });

  it('does not let a late detail response replace the newly selected product', async () => {
    let resolveFirst!: (response: Response) => void;
    fetchMock.mockImplementation(async (input) => {
      const path = requestPath(input);
      if (path === '/products') return jsonResponse({ products });
      if (path === `/products/${headphones.id}`) {
        return new Promise<Response>((resolve) => {
          resolveFirst = resolve;
        });
      }
      return jsonResponse(speakers);
    });
    renderStorefront(`/article/${headphones.id}`);

    await waitFor(() => expect(resolveFirst).toBeTypeOf('function'));
    fireEvent.click(screen.getByRole('button', { name: 'Open next service product' }));
    await screen.findByRole('heading', { name: speakers.title });
    await act(async () => resolveFirst(jsonResponse(headphones)));

    expect(screen.getByRole('heading', { name: speakers.title })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: headphones.title })).not.toBeInTheDocument();
  });
});
