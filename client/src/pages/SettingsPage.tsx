import { Route, Routes, NavLink } from 'react-router-dom';
import BrandingSettings from '../features/settings/BrandingSettings';
import RoomSettings from '../features/settings/RoomSettings';
import UserSettings from '../features/settings/UserSettings';
import TaxSettings from '../features/settings/TaxSettings';

const tabs = [
  { path: 'branding', label: 'Branding' },
  { path: 'rooms', label: 'Rooms' },
  { path: 'taxes', label: 'Taxes' },
  { path: 'users', label: 'Users' }
];

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-white/70">Manage branding, rooms, taxes, templates, and RBAC.</p>
      </header>

      <nav className="flex space-x-4">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg border transition-colors ${
                isActive ? 'border-aurora-neon text-aurora-neon bg-aurora-neon/20' : 'border-white/10 text-white/60'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-2xl border border-white/10 bg-aurora-glass backdrop-blur-xl p-6">
        <Routes>
          <Route path="branding" element={<BrandingSettings />} />
          <Route path="rooms" element={<RoomSettings />} />
          <Route path="taxes" element={<TaxSettings />} />
          <Route path="users" element={<UserSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default SettingsPage;
