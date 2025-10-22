import axios from 'axios';
import { getOfflineReservations, clearReservation } from '../../services/offlineQueue';
import { store } from '../../store/store';
import { setQueueLength } from './offlineSlice';

export async function syncOfflineReservations() {
  const pending = await getOfflineReservations();
  store.dispatch(setQueueLength(pending.length));
  for (const reservation of pending) {
    try {
      await axios.post('/api/reservations', reservation);
      await clearReservation(reservation.id);
    } catch (error) {
      console.error('Failed to sync reservation', error);
    }
  }
  const remaining = await getOfflineReservations();
  store.dispatch(setQueueLength(remaining.length));
}
