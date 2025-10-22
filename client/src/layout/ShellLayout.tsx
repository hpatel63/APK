import { NavLink } from 'react-router-dom';
import { PropsWithChildren } from 'react';
import OfflineIndicator from '../features/offline/OfflineIndicator';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/rooms', label: 'Rooms', icon: '🛏️' },
  { path: '/reports', label: 'Reports', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
  { path: '/search', label: 'Search', icon: '🔍' }
];

const ShellLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-aurora-glass backdrop-blur-md border-r border-white/10 flex flex-col py-8 px-4 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-aurora-neon/20 border border-aurora-neon flex items-center justify-center text-aurora-neon font-bold">
            AU
          </div>
          <div>
            <p className="text-lg font-semibold">AuroraPOS</p>
            <p className="text-xs text-white/60">Multi-property POS</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-aurora-neon/10 hover:text-aurora-neon ${
                  isActive ? 'bg-aurora-neon/20 text-aurora-neon shadow-[0_0_10px_rgba(34,211,238,0.35)]' : 'text-white/80'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <OfflineIndicator />
      </aside>
      <main className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-br from-white/5 via-transparent to-white/5">
        {children}
      </main>
    </div>
  );
};

export default ShellLayout;
