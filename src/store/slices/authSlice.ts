import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'administrator' | 'visualizer' | 'supervisor' | 'hunter';

export interface AuthState {
  token: string | null;
  username: string | null;
  role: UserRole | null;
  authorized: boolean;
  id: string | number | null;
}

interface LoginPayload {
  token: string;
  id: string | number;
  username: string;
  role: UserRole;
}

const initialState: AuthState = {
  token: null,
  username: null,
  role: null,
  authorized: false,
  id: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<LoginPayload>) {
      const { token, id, username, role } = action.payload;
      state.token = token;
      state.username = username;
      state.role = role;
      state.id = id;
      state.authorized = true;
    },
    logout(state) {
      state.id = null;
      state.token = null;
      state.username = null;
      state.role = null;
      state.authorized = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
