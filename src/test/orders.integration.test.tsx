import { configureStore } from '@reduxjs/toolkit';
import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import cartReducer, { addToCart, clearCart, increaseCart } from '../features/cart/cartSlice';
import ordersReducer, { submitOrder } from '../features/orders/ordersSlice';
import Checkout from '../pages/Checkout/Checkout';
import OrderSuccess from '../pages/OrderSuccess/OrderSuccess';
import { ORDER_FIELD_LIMITS } from '../features/orders/ordersApi';
import { formatCurrency } from '../utils/utils';
import { headphones, speakers } from './products';
import { orderConfirmation, orderRequest } from './orders';

const fetchMock = vi.fn<typeof fetch>();

function NavigationControls() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate('/products')}>Leave checkout</button>
      <button onClick={() => navigate('/checkout')}>Return to checkout</button>
      <button onClick={() => navigate('/order-success')}>View saved confirmation</button>
    </>
  );
}

function renderCheckout(
  items = [{ ...headphones, quantity: 2 }],
  entry: { pathname: string; state?: unknown } = { pathname: '/checkout' }
) {
  const store = configureStore({ reducer: { cart: cartReducer, orders: ordersReducer } });
  items.forEach((item) => store.dispatch(addToCart({ ...item, image: item.images.cover })));
  render(
    <StrictMode>
      <Provider store={store}>
        <MemoryRouter initialEntries={[entry]}>
          <NavigationControls />
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/products" element={<div>Products</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    </StrictMode>
  );
  return store;
}

const fields = {
  name: 'Name',
  email: 'Email Address',
  phone: 'Phone Number',
  address: 'Address',
  zipCode: 'ZIP Code',
  city: 'City',
  country: 'Country',
} as const;

function fillForm() {
  const values = { ...orderRequest.customer, ...orderRequest.shippingAddress };
  for (const field of Object.keys(fields) as (keyof typeof fields)[]) {
    fireEvent.change(screen.getByRole('textbox', { name: fields[field] }), {
      target: { value: ` ${values[field]} ` },
    });
  }
}

function expectConfirmation(container: HTMLElement) {
  const details = within(container);
  expect(details.getByText(orderConfirmation.orderId)).toBeVisible();
  expect(details.getByText('Confirmed headphones × 2')).toBeVisible();
  for (const cents of [9998, 8332, 1666, 1000, 10998]) {
    expect(
      details.getByText(formatCurrency(cents / 100), { normalizer: (text) => text })
    ).toBeVisible();
  }
  expect(details.queryByText(formatCurrency(headphones.price * 2 + 10))).not.toBeInTheDocument();
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('VITE_ORDERS_API_URL', 'http://localhost:3001');
});

afterEach(() => {
  vi.useRealTimers();
});

describe('checkout orders integration', () => {
  it('locks pending submission, posts once, clears only after confirmation and redirects with server data', async () => {
    vi.useFakeTimers();
    let resolveResponse!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve;
      })
    );
    const store = renderCheckout();
    fillForm();
    const submit = screen.getByRole('button', { name: 'Continue & Pay' });
    expect(submit).toBeEnabled();

    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(screen.getByRole('button', { name: 'Placing order...' })).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]?.body).toBe(JSON.stringify(orderRequest));
    expect(store.getState().cart.items).toHaveLength(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await act(async () => {
      resolveResponse(new Response(JSON.stringify(orderConfirmation), { status: 201 }));
    });
    expect(store.getState().cart.items).toEqual([]);
    expectConfirmation(screen.getByRole('dialog'));
    expect(screen.getByRole('button', { name: 'Continue & Pay', hidden: true })).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('heading', { name: 'Thank You for Your Order!' })).toBeVisible();
    expectConfirmation(screen.getByText('Order Details').closest('.MuiCardContent-root')!);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/confirmation email has been sent/i)).not.toBeInTheDocument();
  });

  it.each([
    [400, /order details are invalid/i],
    [409, /enough stock/i],
    [413, /order is too large/i],
    [422, /no longer available/i],
    [503, /products service is unavailable/i],
    [500, /could not save/i],
    [200, /could not be confirmed/i],
  ])('keeps form and cart on HTTP %i with an actionable message', async (status, message) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(orderConfirmation), { status }));
    const store = renderCheckout();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(store.getState().cart.items).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(' Demo Buyer ');
    expect(screen.getByRole('textbox', { name: 'Address' })).toHaveValue(' Demo Street 1 ');
    expect(screen.getByRole('button', { name: 'Continue & Pay' })).toBeEnabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(['network', 'json', 'shape'])(
    'preserves cart on %s failure without false success or retry',
    async (failure) => {
      if (failure === 'network') fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
      else
        fetchMock.mockResolvedValue(
          new Response(failure === 'json' ? 'broken' : '{}', { status: 201 })
        );
      const store = renderCheckout();
      fillForm();
      fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(/may already have been saved/i);
      expect(store.getState().cart.items).toHaveLength(1);
      expect(screen.getByRole('textbox', { name: 'Email Address' })).toHaveValue(
        'buyer@example.com'
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    }
  );

  it.each(Object.keys(ORDER_FIELD_LIMITS) as (keyof typeof ORDER_FIELD_LIMITS)[])(
    'accepts the %s length limit and rejects one character over it',
    (field) => {
      renderCheckout();
      fillForm();
      const input = screen.getByRole('textbox', { name: fields[field] });
      const limit = ORDER_FIELD_LIMITS[field];
      const value =
        field === 'email'
          ? `${'a'.repeat(limit - '@example.com'.length)}@example.com`
          : field === 'phone'
            ? '1'.repeat(limit)
            : 'a'.repeat(limit);
      fireEvent.change(input, { target: { value } });
      expect(screen.getByRole('button', { name: 'Continue & Pay' })).toBeEnabled();
      fireEvent.change(input, { target: { value: `a${value}` } });
      fireEvent.blur(input);
      expect(screen.getByText(`Use no more than ${limit} characters`)).toBeVisible();
      expect(screen.getByRole('button', { name: 'Continue & Pay' })).toBeDisabled();
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it.each(['Email Address', 'Phone Number'])('rejects invalid %s patterns', (label) => {
    renderCheckout();
    fillForm();
    fireEvent.change(screen.getByRole('textbox', { name: label }), {
      target: { value: 'invalid' },
    });
    fireEvent.blur(screen.getByRole('textbox', { name: label }));
    expect(screen.getByRole('button', { name: 'Continue & Pay' })).toBeDisabled();
  });

  it.each([0, 1.5, 100])('rejects quantity %s before sending', (quantity) => {
    renderCheckout([{ ...headphones, inStock: 200, quantity }]);
    fillForm();
    expect(screen.getByRole('alert')).toHaveTextContent(/quantity from 1 to 99/i);
    expect(screen.getByRole('button', { name: 'Continue & Pay' })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts 50 distinct products at quantity 99 but rejects 51', () => {
    const items = Array.from({ length: 50 }, (_, index) => ({
      ...headphones,
      id: `item-${index}`,
      inStock: 100,
      quantity: 99,
    }));
    const store = renderCheckout(items);
    fillForm();
    expect(screen.getByRole('button', { name: 'Continue & Pay' })).toBeEnabled();
    act(() => {
      store.dispatch(
        addToCart({ ...headphones, image: headphones.images.cover, id: 'item-50', quantity: 1 })
      );
    });
    expect(screen.getByRole('alert')).toHaveTextContent(/at most 50/i);
    expect(screen.getByRole('button', { name: 'Continue & Pay' })).toBeDisabled();
  });

  it('disables empty carts and supports cash only', () => {
    renderCheckout([]);
    fillForm();
    expect(screen.getByRole('button', { name: 'Continue & Pay' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Cash on Delivery' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'e-Money' })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([100, 101])('validates the product ID length boundary: %i', (length) => {
    renderCheckout([{ ...headphones, id: 'a'.repeat(length), quantity: 1 }]);
    fillForm();
    const submit = screen.getByRole('button', { name: 'Continue & Pay' });
    if (length === 100) expect(submit).toBeEnabled();
    else {
      expect(submit).toBeDisabled();
      expect(screen.getByRole('alert')).toHaveTextContent(/valid ID/i);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows a route-state confirmation with an already empty cart', () => {
    const store = renderCheckout([], {
      pathname: '/order-success',
      state: { confirmation: orderConfirmation },
    });
    expect(store.getState().cart.items).toEqual([]);
    expectConfirmation(screen.getByText('Order Details').closest('.MuiCardContent-root')!);
  });

  it.each([undefined, { orderId: 'fake', total: '€999' }, { confirmation: {} }])(
    'does not claim success without confirmed route data: %j',
    (state) => {
      renderCheckout([], { pathname: '/order-success', state });
      expect(screen.getByRole('alert')).toHaveTextContent(/no confirmed order/i);
      expect(screen.queryByText('Thank You for Your Order!')).not.toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it('allows an explicit manual submission after a definite failure', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('{"error":"Unavailable"}', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(orderConfirmation), { status: 201 }));
    const store = renderCheckout();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
    await screen.findByRole('alert');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
    await waitFor(() => expect(store.getState().cart.items).toEqual([]));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectConfirmation(screen.getByRole('dialog'));
  });

  it('preserves the global pending lock and form after leaving and returning to checkout', async () => {
    let resolveResponse!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve;
      })
    );
    const store = renderCheckout();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
    fireEvent.click(screen.getByRole('button', { name: 'Leave checkout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Return to checkout' }));
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(' Demo Buyer ');
    expect(screen.getByRole('button', { name: 'Placing order...' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Placing order...' }));
    await act(async () => {
      await store.dispatch(submitOrder());
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveResponse(new Response('{"error":"Insufficient stock"}', { status: 409 }));
    });
    expect(screen.getByRole('alert')).toHaveTextContent(/enough stock/i);
    expect(store.getState().cart.items[0].quantity).toBe(2);
  });

  it.each([409, 503])(
    'retains late HTTP %i errors and the full form across navigation',
    async (status) => {
      let resolveResponse!: (response: Response) => void;
      fetchMock.mockReturnValue(
        new Promise((resolve) => {
          resolveResponse = resolve;
        })
      );
      const store = renderCheckout();
      fillForm();
      const previousCart = store.getState().cart.items;
      const previousDraft = store.getState().orders.draft;
      fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
      fireEvent.click(screen.getByRole('button', { name: 'Leave checkout' }));
      await act(async () => {
        resolveResponse(new Response('{"error":"Order failed"}', { status }));
      });
      fireEvent.click(screen.getByRole('button', { name: 'Return to checkout' }));
      expect(screen.getByRole('alert')).toBeVisible();
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(' Demo Buyer ');
      expect(screen.getByRole('textbox', { name: 'Address' })).toHaveValue(' Demo Street 1 ');
      expect(store.getState().orders.draft).toEqual(previousDraft);
      expect(store.getState().cart.items).toEqual(previousCart);
      expect(screen.getByRole('button', { name: 'Continue & Pay' })).toBeEnabled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    }
  );

  it('keeps the ambiguous network outcome visible after checkout is reopened', async () => {
    let rejectResponse!: (reason: unknown) => void;
    fetchMock.mockReturnValue(
      new Promise((_, reject) => {
        rejectResponse = reject;
      })
    );
    const store = renderCheckout();
    fillForm();
    const previousCart = store.getState().cart.items;
    fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
    fireEvent.click(screen.getByRole('button', { name: 'Leave checkout' }));
    await act(async () => {
      rejectResponse(new TypeError('Failed to fetch'));
    });
    fireEvent.click(screen.getByRole('button', { name: 'Return to checkout' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/may already have been saved/i);
    expect(store.getState().cart.items).toEqual(previousCart);
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(' Demo Buyer ');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('saves a late success and preserves unsubmitted products while navigating', async () => {
    let resolveResponse!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve;
      })
    );
    const store = renderCheckout();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
    fireEvent.click(screen.getByRole('button', { name: 'Leave checkout' }));
    act(() => {
      store.dispatch(addToCart({ ...speakers, image: speakers.images.cover, quantity: 1 }));
    });
    await act(async () => {
      resolveResponse(new Response(JSON.stringify(orderConfirmation), { status: 201 }));
    });
    expect(store.getState().cart.items).toEqual([
      expect.objectContaining({ id: speakers.id, quantity: 1 }),
    ]);
    expect(store.getState().orders.confirmation).toEqual(orderConfirmation);
    expect(screen.getByText('Products')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Return to checkout' }));
    expectConfirmation(await screen.findByRole('dialog'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('makes the saved confirmation accessible directly after a late success', async () => {
    let resolveResponse!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve;
      })
    );
    const store = renderCheckout();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
    fireEvent.click(screen.getByRole('button', { name: 'Leave checkout' }));
    await act(async () => {
      resolveResponse(new Response(JSON.stringify(orderConfirmation), { status: 201 }));
    });
    fireEvent.click(screen.getByRole('button', { name: 'View saved confirmation' }));
    expectConfirmation(screen.getByText('Order Details').closest('.MuiCardContent-root')!);
    expect(store.getState().orders.status).toBe('idle');
    expect(store.getState().orders.draft.name).toBe('');
    expect(store.getState().orders.confirmation).toEqual(orderConfirmation);
  });

  it.each(['increase', 'clear-and-readd'])(
    'preserves unsubmitted quantities for the same ID on success: %s',
    async (edit) => {
      let resolveResponse!: (response: Response) => void;
      fetchMock.mockReturnValue(
        new Promise((resolve) => {
          resolveResponse = resolve;
        })
      );
      const store = renderCheckout([{ ...headphones, inStock: 10, quantity: 2 }]);
      fillForm();
      fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
      act(() => {
        if (edit === 'increase') store.dispatch(increaseCart({ id: headphones.id }));
        else {
          store.dispatch(clearCart());
          store.dispatch(addToCart({ ...headphones, image: headphones.images.cover, quantity: 1 }));
        }
      });
      await act(async () => {
        resolveResponse(new Response(JSON.stringify(orderConfirmation), { status: 201 }));
      });
      expect(store.getState().cart.items).toEqual([
        expect.objectContaining({ id: headphones.id, quantity: 1 }),
      ]);
      expectConfirmation(screen.getByRole('dialog'));
    }
  );

  it('retains user cart edits on failure and uses the new cart snapshot only for an explicit retry', async () => {
    let resolveResponse!: (response: Response) => void;
    fetchMock
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveResponse = resolve;
        })
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(orderConfirmation), { status: 201 }));
    const store = renderCheckout();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
    act(() => {
      store.dispatch(addToCart({ ...speakers, image: speakers.images.cover, quantity: 1 }));
      store.dispatch(increaseCart({ id: speakers.id }));
    });
    const editedCart = store.getState().cart.items;
    await act(async () => {
      resolveResponse(new Response('{"error":"Unavailable"}', { status: 503 }));
    });
    expect(store.getState().cart.items).toEqual(editedCart);
    expect(store.getState().cart.checkoutItems).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const body = fetchMock.mock.calls[1][1]?.body;
    expect(body).toBe(
      JSON.stringify({
        ...orderRequest,
        items: [...orderRequest.items, { id: speakers.id, quantity: 2 }],
      })
    );
    // The fixture intentionally omits the second requested product, so it must not clear the cart.
    await screen.findByText(/invalid order response/i);
    expect(store.getState().cart.items).toEqual(editedCart);
  });

  it('allows a new checkout after viewing confirmation without consuming later additions', async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(new Response(JSON.stringify(orderConfirmation), { status: 201 }));
    const store = renderCheckout();
    fillForm();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
    });
    act(() => {
      store.dispatch(addToCart({ ...speakers, image: speakers.images.cover, quantity: 1 }));
    });
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(store.getState().orders.status).toBe('idle');
    expect(store.getState().cart.items[0].id).toBe(speakers.id);
    fireEvent.click(screen.getByRole('button', { name: 'Return to checkout' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
    fillForm();
    expect(screen.getByRole('button', { name: 'Continue & Pay' })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['0012345678', '00123'],
    ['+381 (60) 123-4567', 'SW1A 1AA'],
  ])(
    'preserves phone %s and international ZIP %s as strings in the payload',
    async (phone, zipCode) => {
      fetchMock.mockResolvedValue(new Response('{"error":"Invalid request"}', { status: 400 }));
      renderCheckout();
      fillForm();
      const phoneInput = screen.getByRole('textbox', { name: 'Phone Number' });
      const zipInput = screen.getByRole('textbox', { name: 'ZIP Code' });
      expect(phoneInput).toHaveAttribute('type', 'tel');
      expect(phoneInput).toHaveAttribute('inputmode', 'tel');
      expect(phoneInput).toHaveAttribute('autocomplete', 'tel');
      expect(zipInput).toHaveAttribute('type', 'text');
      expect(zipInput).toHaveAttribute('inputmode', 'text');
      expect(zipInput).toHaveAttribute('autocomplete', 'shipping postal-code');
      fireEvent.change(phoneInput, { target: { value: phone } });
      fireEvent.change(zipInput, { target: { value: zipCode } });
      fireEvent.click(screen.getByRole('button', { name: 'Continue & Pay' }));
      await screen.findByRole('alert');
      expect(fetchMock.mock.calls[0][1]?.body).toBe(
        JSON.stringify({
          ...orderRequest,
          customer: { ...orderRequest.customer, phone },
          shippingAddress: { ...orderRequest.shippingAddress, zipCode },
        })
      );
      expect(phoneInput).toHaveValue(phone);
      expect(zipInput).toHaveValue(zipCode);
    }
  );
});
