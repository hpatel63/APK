import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

interface AuthState {
  token: string | null;
  role: string | null;
  permissions: string[];
  status: 'idle' | 'loading' | 'failed';
}

const initialState: AuthState = {
  token: null,
  role: null,
  permissions: [],
  status: 'idle',
};

export const login = createAsyncThunk('auth/login', async (credentials: { username: string; password: string }) => {
  const { data } = await axios.post('/api/auth/login', credentials);
  return data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.role = null;
      state.permissions = [];
      localStorage.removeItem('aurora.auth');
    },
    hydrate(state) {
      const persisted = localStorage.getItem('aurora.auth');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        state.token = parsed.token;
        state.role = parsed.role;
        state.permissions = parsed.permissions;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.permissions = action.payload.permissions;
        localStorage.setItem('aurora.auth', JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state) => {
        state.status = 'failed';
      });
  }
});

export const { logout, hydrate } = authSlice.actions;
export default authSlice.reducer;
