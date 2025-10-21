import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import dayjs from 'dayjs';
import { persistReservationOffline } from '../../services/offlineQueue';

export interface ReservationGridCell {
  id: string;
  roomId: string;
  roomNumber: string;
  start: string;
  end: string;
  status: string;
  guestName: string;
}

interface ReservationState {
  rooms: any[];
  reservations: ReservationGridCell[];
  status: 'idle' | 'loading' | 'failed';
}

const initialState: ReservationState = {
  rooms: [],
  reservations: [],
  status: 'idle'
};

export const fetchRooms = createAsyncThunk('reservations/fetchRooms', async (propertyId: string) => {
  const { data } = await axios.get('/api/rooms', { params: { propertyId } });
  const resData = await axios.get('/api/reservations', { params: { propertyId } });
  return { rooms: data.rooms, reservations: resData.data.reservations };
});

export const createReservation = createAsyncThunk('reservations/create', async (payload: any, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/api/reservations', payload);
    return data;
  } catch (error: any) {
    if (!navigator.onLine) {
      await persistReservationOffline(payload);
      return { id: payload.clientId, offline: true };
    }
    return rejectWithValue(error.response?.data || { message: 'Failed to create reservation' });
  }
});

const reservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    setReservations(state, action) {
      state.reservations = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.status = 'idle';
        state.rooms = action.payload.rooms;
        state.reservations = action.payload.reservations.map((reservation: any) => ({
          id: reservation.id,
          roomId: reservation.roomId,
          roomNumber: reservation.roomNumber,
          start: reservation.checkIn,
          end: reservation.checkOut,
          status: reservation.status,
          guestName: `${reservation.firstName || ''} ${reservation.lastName || ''}`.trim()
        }));
      })
      .addCase(fetchRooms.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        if (action.payload.offline) {
          state.reservations.push({
            id: action.payload.id,
            roomId: action.meta.arg.roomId,
            roomNumber: action.meta.arg.roomNumber,
            start: action.meta.arg.checkIn,
            end: action.meta.arg.checkOut,
            status: 'pending_sync',
            guestName: `${action.meta.arg.guest.firstName} ${action.meta.arg.guest.lastName}`
          });
        }
      });
  }
});

export const { setReservations } = reservationSlice.actions;
export default reservationSlice.reducer;
