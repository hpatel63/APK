import { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardPage from './DashboardPage';
import RoomsPage from './RoomsPage';
import ReportsPage from './ReportsPage';
import SettingsPage from './SettingsPage';
import SearchPage from './SearchPage';
import OfflineGate from '../features/offline/OfflineGate';
import ShellLayout from '../layout/ShellLayout';
import { hydrate } from '../features/settings/authSlice';
import { AppDispatch, RootState } from '../store/store';
import LoginForm from '../features/settings/LoginForm';

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    dispatch(hydrate());
  }, [dispatch]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aurora-base text-white">
        <LoginForm />
      </div>
    );
  }

  return (
    <OfflineGate>
      <ShellLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings/*" element={<SettingsPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </ShellLayout>
    </OfflineGate>
  );
};

export default App;
