import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  bootstrapped: boolean;
  uiDense: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('portal_plus1_token'),
  bootstrapped: false,
  uiDense: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('portal_plus1_token', action.payload.token);
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    setBootstrapped(state, action: PayloadAction<boolean>) {
      state.bootstrapped = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('portal_plus1_token');
    },
    toggleDense(state) {
      state.uiDense = !state.uiDense;
    },
  },
});

export const { setCredentials, setUser, setBootstrapped, logout, toggleDense } = authSlice.actions;
export default authSlice.reducer;
