import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date | string;
  token: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoggedIn: false,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: AuthUser; session: AuthSession }>) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.isLoggedIn = true;
      state.isInitialized = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.isLoggedIn = false;
      state.isInitialized = true;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
