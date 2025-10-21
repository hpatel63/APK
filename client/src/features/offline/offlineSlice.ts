import { createSlice } from '@reduxjs/toolkit';

interface OfflineState {
  isOffline: boolean;
  queueLength: number;
}

const initialState: OfflineState = {
  isOffline: !navigator.onLine,
  queueLength: 0
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOffline(state, action) {
      state.isOffline = action.payload;
    },
    setQueueLength(state, action) {
      state.queueLength = action.payload;
    }
  }
});

export const { setOffline, setQueueLength } = offlineSlice.actions;
export default offlineSlice.reducer;
