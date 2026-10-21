import { useContext, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const paths = {
  dashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  plus: 'M12 5v14m-7-7h14',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0',
  user: 'M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m16-10a4 4 0 1 0-2-7.5M22 21v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  help: 'M9.1 9a3 3 0 1 1 5.8 1c-.8 1-2.9 1.5-2.9 3m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z',
  logout: 'M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  shield: 'M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11zm-3-11 2 2 4-4',
  settings: 'M12 3.5l1.35 1.74 2.18-.28.82 2.04 2.06.76-.28 2.18L20 11.5l-1.87 1.56.28 2.18-2.06.76-.82 2.04-2.18-.28L12 19.5l-1.35-1.74-2.18.28-.82-2.04-2.06-.76.28-2.18L4 11.5l1.87-1.56-.28-2.18 2.06-.76.82-2.04 2.18.28L12 3.5z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
};

const Icon = ({ name, className = 'h-5 w-5' }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={paths[name]} />
  </svg>
);

const Layout = ({ children, title = 'Whistleblowing', wide = false }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const role = user?.roleName;
  const userId = user?.userId;

  useEffect(() => {
    document.title = `${title} | Whistleblowing`;
  }, [location.pathname, title]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = event => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);
  useEffect(() => {
    if (!userId || !localStorage.getItem('token') && !sessionStorage.getItem('token')) return undefined;
    let active = true;
    const refreshUnread = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      try {
        const response = await axios.get('/api/Notifications', { headers: { Authorization: `Bearer ${token}` } });
        if (active) setUnreadCount((Array.isArray(response.data) ? response.data : []).filter(item => !item.isRead).length);
      } catch { if (active) setUnreadCount(0); }
    };
    refreshUnread();
    const interval = window.setInterval(refreshUnread, 30000);
    return () => { active = false; window.clearInterval(interval); };
  }, [userId]);
  const sections = [
    { title: 'Main', items: [
      ...(role === 'ADMIN' ? [{ label: 'Dashboard', to: '/admin', icon: 'dashboard' }] : []),
      ...(role === 'MANAGER' ? [{ label: 'Dashboard', to: '/manager', icon: 'dashboard' }] : []),
      ...(role === 'INVESTIGATOR' ? [{ label: 'Dashboard', to: '/investigator', icon: 'dashboard' }] : []),
      ...(role === 'USER' ? [
        { label: 'Dashboard', to: '/employee', icon: 'dashboard' },
        { label: 'Submit Concern', to: '/submit-complaint', icon: 'plus' },
        { label: 'My Concerns', to: '/my-complaints', icon: 'file' },
      ] : []),
      ...(['ADMIN', 'MANAGER'].includes(role) ? [{ label: 'Concerns', to: '/manage-complaints', icon: 'file' }] : []),
      ...(role !== 'USER' ? [{ label: 'Cases', to: '/manage-cases', icon: 'file' }] : []),
      { label: 'Notifications', to: '/notifications', icon: 'bell' },
    ] },
    ...(role === 'MANAGER' ? [{ title: 'Team', items: [
      { label: 'Team', to: '/manager/team', icon: 'users' },
    ] }] : []),
    ...(role === 'ADMIN' ? [{ title: 'People', items: [
      { label: 'Users', to: '/manage-users', icon: 'user' },
      { label: 'Departments', to: '/manage-departments', icon: 'file' },
    ] }] : []),
    { title: 'System', items: [
      ...(role === 'ADMIN' ? [{ label: 'Settings', to: '/settings', icon: 'settings' }] : []),
      ...(role === 'ADMIN' ? [{ label: 'Activity Logs', to: '/activity-logs', icon: 'file' }] : []),
      { label: 'Profile', to: '/profile', icon: 'user' },
    ] },
  ];
  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-[#f1f1ff] text-slate-800">
      <a href="#main-content" className="sr-only z-50 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:shadow-lg">Skip to main content</a>
      {menuOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={closeMenu} />}

      <header className="fixed inset-x-0 top-0 z-30 flex h-[60px] items-center gap-4 border-b border-white/80 bg-white/90 px-4 backdrop-blur sm:px-6">
        <button onClick={() => setMenuOpen(open => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="primary-navigation" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"><Icon name="menu" /></button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-md"><Icon name="shield" className="h-5 w-5" /></div>
          <span className="truncate text-base font-bold tracking-tight text-slate-800 sm:text-lg">Whistleblowing System</span>
        </div>
        <button onClick={() => navigate('/notifications')} aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'} className="relative grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/70 hover:bg-slate-50"><Icon name="bell" />{unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}</button>
        <div className="hidden max-w-[240px] items-center gap-2 truncate rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70 sm:flex"><Icon name="user" className="h-4 w-4 shrink-0" /><span className="truncate">{user?.email || user?.name || 'Account'}</span></div>
        <button onClick={handleLogout} aria-label="Sign out" title="Sign out" className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-rose-100 hover:bg-rose-50 hover:text-rose-600"><Icon name="logout" /></button>
      </header>

      <aside id="primary-navigation" aria-label="Primary navigation" className={`fixed bottom-0 left-0 top-[60px] z-40 flex w-[min(82vw,254px)] flex-col border-r border-indigo-100 bg-[#f7f8ff] transition-transform duration-200 lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-4 sm:space-y-5 sm:py-5">
          {sections.map(section => <section key={section.title}>
            <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-500">{section.title}</h2>
            <nav className="space-y-1" aria-label={section.title}>
              {section.items.map(item => <NavLink key={item.to} to={item.to} end onClick={closeMenu} className={({ isActive }) => `flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold transition ${isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${location.pathname === item.to ? 'bg-white/20' : 'bg-white/70 text-slate-600'}`}><Icon name={item.icon} className="h-4 w-4" /></span><span className="min-w-0 truncate">{item.label}</span>
              </NavLink>)}
            </nav>
          </section>)}
        </div>
        <div className="shrink-0 space-y-1 border-t border-indigo-100/80 p-3">
          <NavLink to="/support" onClick={closeMenu} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold ${isActive ? 'bg-white text-blue-700' : 'text-slate-600 hover:bg-white/80'}`}><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/70"><Icon name="help" className="h-4 w-4" /></span>Support</NavLink>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-slate-600 hover:bg-white/80 hover:text-rose-600"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/70"><Icon name="logout" className="h-4 w-4" /></span>Logout</button>
        </div>
      </aside>

      <main id="main-content" tabIndex={-1} className="min-h-screen bg-[radial-gradient(ellipse_at_10%_10%,#dfeaff_0%,transparent_40%),radial-gradient(ellipse_at_90%_15%,#f1d9ff_0%,transparent_38%),linear-gradient(145deg,#eef2ff_0%,#f5eaff_100%)] pb-10 pl-0 pt-[60px] lg:pl-[254px]">
        <div className={`mx-auto w-full ${wide ? 'max-w-[1600px]' : 'max-w-[1280px]'} px-4 py-6 sm:px-6 sm:py-7 lg:px-8`}>{children}</div>
      </main>
    </div>
  );
};

export default Layout;
