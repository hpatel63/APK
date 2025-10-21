import { PropsWithChildren, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setOffline, setQueueLength } from './offlineSlice';
import { AppDispatch } from '../../store/store';
import { syncOfflineReservations } from './syncAgent';
import { getOfflineReservations } from '../../services/offlineQueue';

const OfflineGate = ({ children }: PropsWithChildren) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    getOfflineReservations().then((items) => dispatch(setQueueLength(items.length)));
    const onOnline = () => {
      dispatch(setOffline(false));
      syncOfflineReservations();
    };
    const onOffline = () => dispatch(setOffline(true));

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [dispatch]);

  return <>{children}</>;
};

export default OfflineGate;
