import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { XPBar, LevelBadge } from './UI';
import { DataIcon } from '../utils/icons';
import { Home, BookOpen, Trophy, Zap, User, Volume2, VolumeX, Sun, Moon, Award, Brain } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',   icon: Home,     label: 'Dashboard'   },
  { to: '/learn',       icon: BookOpen, label: 'Learn'       },
  { to: '/quiz',        icon: Brain,    label: 'Quiz'        },
  { to: '/challenges',  icon: Zap,      label: 'Challenges'  },
  { to: '/badges',      icon: Award,    label: 'Badges'      },
  { to: '/leaderboard', icon: Trophy,   label: 'Leaderboard' },
  { to: '/profile',     icon: User,     label: 'Profile'     },
];

export const Sidebar = () => {
  const { user, toggleSound, toggleLightMode, lightMode } = useApp();
  if (!user) return null;

  return (
    <aside className="sidebar fixed left-0 top-0 h-screen w-64 forest-bg border-r border-lime-400/10 flex flex-col z-40 p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <DataIcon name="globe" size={32} className="text-lime-400 shrink-0" />
        <div>
          <h1 className="font-nunito font-black text-xl text-lime-400 leading-none">EcoQuest</h1>
          <p className="text-xs text-white/40">Save the Planet. Level Up.</p>
        </div>
      </div>

      {/* User mini-card */}
      <div className="glass-card p-3 mb-6 flex items-center gap-3">
        <DataIcon name={user.avatar} size={28} className="text-lime-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-nunito font-bold text-sm text-white truncate">{user.name}</p>
          <p className="text-xs text-white/40 truncate">{user.school}</p>
        </div>
        <LevelBadge xp={user.xp} size="sm" />
      </div>

      {/* XP Bar */}
      <div className="px-1 mb-6">
        <XPBar xp={user.xp} />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1" role="navigation" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            aria-label={label}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="flex gap-2 mt-4">
        <button onClick={toggleSound} className="flex-1 nav-item justify-center text-xs" aria-label="Toggle sound"
          title={user.soundEnabled ? 'Sound On' : 'Sound Off'}>
          {user.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
    </aside>
  );
};

export const BottomNav = () => {
  const location = useLocation();
  const MOBILE_NAV = [
    NAV_ITEMS[0], // Dashboard
    NAV_ITEMS[1], // Learn
    NAV_ITEMS[2], // Quiz
    NAV_ITEMS[3], // Challenges
    NAV_ITEMS[6], // Profile
  ];
  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40"
      role="navigation" aria-label="Mobile navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="mx-auto w-full max-w-lg px-3 py-2">
        <div className="flex justify-around items-center bg-forest-900/95 backdrop-blur-xl border border-lime-400/10 rounded-2xl px-1 py-2 shadow-lg"
          style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.5), 0 0 15px rgba(163,230,53,0.05)' }}>
          {MOBILE_NAV.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
            return (
              <NavLink key={to} to={to} aria-label={label}
                className={`flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-all duration-200 ${active ? 'text-lime-400 bg-lime-400/10' : 'text-white/40 hover:text-white/60'}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-[10px] leading-none ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
