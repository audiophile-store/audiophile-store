import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import recentlyViewedReducer, {
  clearRecentlyViewed,
  createRecentlyViewedMiddleware,
  recordProductView,
  RECENTLY_VIEWED_KEY,
} from './recentlyViewedSlice';
import snackbarReducer from '../snackbar/snackbarSlice';

function createStore() {
  return configureStore({
    reducer: { recentlyViewed: recentlyViewedReducer, snackbar: snackbarReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(createRecentlyViewedMiddleware()),
  });
}

beforeEach(() => localStorage.clear());

describe('recently viewed history', () => {
  it('keeps exactly the last 10 unique IDs with revisits first', () => {
    const store = createStore();
    for (let index = 0; index < 12; index++) store.dispatch(recordProductView(`product-${index}`));
    expect(store.getState().recentlyViewed.ids).toEqual([
      'product-11',
      'product-10',
      'product-9',
      'product-8',
      'product-7',
      'product-6',
      'product-5',
      'product-4',
      'product-3',
      'product-2',
    ]);
    store.dispatch(recordProductView('product-5'));
    store.dispatch(recordProductView('product-5'));
    expect(store.getState().recentlyViewed.ids[0]).toBe('product-5');
    expect(store.getState().recentlyViewed.ids).toHaveLength(10);
    expect(new Set(store.getState().recentlyViewed.ids).size).toBe(10);
  });

  it('persists IDs only and restores them in a new store', () => {
    const store = createStore();
    store.dispatch(recordProductView('first'));
    store.dispatch(recordProductView('second'));
    expect(localStorage.getItem(RECENTLY_VIEWED_KEY)).toBe('["second","first"]');
    expect(createStore().getState().recentlyViewed.ids).toEqual(['second', 'first']);
    store.dispatch(clearRecentlyViewed());
    expect(createStore().getState().recentlyViewed.ids).toEqual([]);
  });

  it('deduplicates and caps stored history on load', () => {
    const ids = Array.from({ length: 12 }, (_, index) => `product-${index}`);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([ids[0], ...ids]));
    expect(createStore().getState().recentlyViewed.ids).toEqual(ids.slice(0, 10));
  });

  it.each(['not JSON', '{}', '[1]', '[""]', '["valid",null]'])(
    'reports invalid saved history (%s) and starts with an empty list',
    (value) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem(RECENTLY_VIEWED_KEY, value);
      expect(createStore().getState().recentlyViewed.ids).toEqual([]);
      expect(warn).toHaveBeenCalledWith(
        'Unable to load recently viewed history.',
        expect.any(Error)
      );
    }
  );

  it('reports unavailable storage on load', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    expect(createStore().getState().recentlyViewed.ids).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });

  it.each(['save', 'clear'])('notifies the user when storage cannot %s history', (operation) => {
    const store = createStore();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, operation === 'save' ? 'setItem' : 'removeItem').mockImplementation(
      () => {
        throw new Error('Storage unavailable');
      }
    );
    store.dispatch(operation === 'save' ? recordProductView('first') : clearRecentlyViewed());
    expect(store.getState().recentlyViewed.ids).toEqual(operation === 'save' ? ['first'] : []);
    expect(store.getState().snackbar.message).toBe(
      'Recently viewed history could not be saved on this device.'
    );
    expect(store.getState().snackbar.isOpen).toBe(true);
    expect(warn).toHaveBeenCalled();
  });
});
