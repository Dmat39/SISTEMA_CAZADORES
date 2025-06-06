import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  username: null,
  role: null,
  authorized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      const { token, username, role } = action.payload;
      state.token = token;
      state.username = username;
      state.role = role;
      state.authorized = true;
    },
    logout(state) {
      state.token = null;
      state.username = null;
      state.role = null;
      state.authorized = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
