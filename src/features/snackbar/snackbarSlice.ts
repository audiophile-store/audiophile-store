import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface SnackbarState {
  isOpen: boolean;
  message: string;
}

const initialState: SnackbarState = {
  isOpen: false,
  message: '',
};

export const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    openSnackbar: (state, action: PayloadAction<string>) => {
      state.isOpen = true;
      state.message = action.payload;
    },
    closeSnackbar: (state) => {
      state.isOpen = false;
      state.message = '';
    },
  },
});

// Action creators are generated for each case reducer function
export const { openSnackbar, closeSnackbar } = snackbarSlice.actions;

export default snackbarSlice.reducer;
