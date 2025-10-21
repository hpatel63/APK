import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const OfflineIndicator = () => {
  const { isOffline, queueLength } = useSelector((state: RootState) => state.offline);
  return (
    <div className="text-xs text-white/60">
      {isOffline ? (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/40">
          <p className="font-semibold">Offline mode</p>
          <p>{queueLength} items waiting to sync</p>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-400/40">
          <p className="font-semibold">Online</p>
          <p>All changes synced</p>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
