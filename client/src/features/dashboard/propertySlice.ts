import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

interface PropertySummary {
  id: string;
  name: string;
  occupancy: number;
  adr: number;
  revpar: number;
  revenueToday: number;
}

interface PropertyState {
  list: PropertySummary[];
  activePropertyId: string | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: PropertyState = {
  list: [],
  activePropertyId: null,
  status: 'idle'
};

export const fetchPropertySummary = createAsyncThunk('properties/fetchSummary', async () => {
  const { data } = await axios.get('/api/reports/daily/close');
  return data;
});

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setActiveProperty(state, action) {
      state.activePropertyId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertySummary.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPropertySummary.fulfilled, (state, action) => {
        state.status = 'idle';
        // For demo, create synthetic KPIs using payments and occupancy
        const occupancy = action.payload.occupancy?.occupied || 0;
        state.list = [
          {
            id: 'property-1',
            name: 'Aurora Downtown Inn',
            occupancy,
            adr: 189,
            revpar: Number((occupancy * 189 * 0.7).toFixed(2)),
            revenueToday: action.payload.payments?.reduce((acc: number, p: any) => acc + Number(p.total || 0), 0) || 0
          },
          {
            id: 'property-2',
            name: 'Aurora Seaside Lodge',
            occupancy: 14,
            adr: 215,
            revpar: 112,
            revenueToday: 4500
          }
        ];
        if (!state.activePropertyId && state.list.length) {
          state.activePropertyId = state.list[0].id;
        }
      })
      .addCase(fetchPropertySummary.rejected, (state) => {
        state.status = 'failed';
      });
  }
});

export const { setActiveProperty } = propertySlice.actions;
export default propertySlice.reducer;
