import { createSlice } from '@reduxjs/toolkit';
import usersData from '../../db/users.json';

const initialState = {
  user: null,
  isLoggedIn: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      const { email, password } = action.payload;
      const found = usersData.users.find(
        (u) => u.email === email && u.password === password
      );

      if (found) {
        const { password: _, ...userWithoutPassword } = found;
        state.user = userWithoutPassword;
        state.isLoggedIn = true;
        state.error = null;
      } else {
        state.user = null;
        state.isLoggedIn = false;
        state.error = 'Invalid email or password';
      }
    },
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { login, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
