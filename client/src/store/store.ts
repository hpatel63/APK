import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/settings/authSlice';
import propertyReducer from '../features/dashboard/propertySlice';
import reservationReducer from '../features/rooms/reservationSlice';
import offlineReducer from '../features/offline/offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertyReducer,
    reservations: reservationReducer,
    offline: offlineReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
