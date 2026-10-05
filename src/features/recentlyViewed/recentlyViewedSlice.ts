import { createListenerMiddleware, createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { openSnackbar } from '../snackbar/snackbarSlice';

export const RECENTLY_VIEWED_KEY = 'audiophile:recently-viewed';
export const RECENTLY_VIEWED_LIMIT = 10;

interface RecentlyViewedState {
  ids: string[];
}

function loadHistory(): RecentlyViewedState {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (stored === null) return { ids: [] };
    const ids: unknown = JSON.parse(stored);
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string' && id.length > 0)) {
      throw new Error('Invalid recently viewed history.');
    }
    return { ids: [...new Set<string>(ids)].slice(0, RECENTLY_VIEWED_LIMIT) };
  } catch (error) {
    console.warn('Unable to load recently viewed history.', error);
    return { ids: [] };
  }
}

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState: loadHistory,
  reducers: {
    recordProductView: (state, action: PayloadAction<string>) => {
      state.ids = [action.payload, ...state.ids.filter((id) => id !== action.payload)].slice(
        0,
        RECENTLY_VIEWED_LIMIT
      );
    },
    clearRecentlyViewed: (state) => {
      state.ids = [];
    },
  },
});

export const { recordProductView, clearRecentlyViewed } = recentlyViewedSlice.actions;

export function createRecentlyViewedMiddleware() {
  const listener = createListenerMiddleware<{
    recentlyViewed: RecentlyViewedState;
  }>();
  listener.startListening({
    matcher: isAnyOf(recordProductView, clearRecentlyViewed),
    effect: (action, api) => {
      try {
        if (clearRecentlyViewed.match(action)) {
          localStorage.removeItem(RECENTLY_VIEWED_KEY);
        } else {
          localStorage.setItem(
            RECENTLY_VIEWED_KEY,
            JSON.stringify(api.getState().recentlyViewed.ids)
          );
        }
      } catch (error) {
        console.warn('Unable to save recently viewed history.', error);
        api.dispatch(openSnackbar('Recently viewed history could not be saved on this device.'));
      }
    },
  });
  return listener.middleware;
}

export default recentlyViewedSlice.reducer;
