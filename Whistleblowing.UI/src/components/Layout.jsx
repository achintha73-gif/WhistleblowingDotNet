import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Layout = ({ children, title }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Notification Count එක API එකෙන් ගන්නවා
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      try {
        const res = await axios.get('/api/Notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const unread = res.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Notification fetch error", err);
      }
    };
    
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // හැම තත්පර 30කට වරක් Update වෙනවා
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 flex relative">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">Whistleblowing</h1>
              <p className="text-[10px] text-gray-500 font-medium">Management System</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Main</div>
          <div className="space-y-1">
            <Link to={user?.roleName === 'ADMIN' ? '/admin' : user?.roleName === 'MANAGER' ? '/manager' : user?.roleName === 'INVESTIGATOR' ? '/investigator' : '/employee'} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/admin') || isActive('/manager') || isActive('/investigator') || isActive('/employee') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 3.75h6.5v6.5h-6.5zM13.75 3.75h6.5v6.5h-6.5zM3.75 13.75h6.5v6.5h-6.5zM13.75 13.75h6.5v6.5h-6.5z" /></svg>
              Dashboard
            </Link>
            {user?.roleName !== 'USER' && (
              <Link to="/manage-cases" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/manage-cases') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                Cases
              </Link>
            )}
            {user?.roleName === 'USER' && (
              <Link to="/my-complaints" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/my-complaints') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                My Concerns
              </Link>
            )}
            {user?.roleName === 'ADMIN' && (
              <>
                <Link to="/manage-users" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/manage-users') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Users
                </Link>
                <Link to="/manage-departments" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/manage-departments') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  Departments
                </Link>
                <Link to="/activity-logs" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/activity-logs') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Activity Logs
                </Link>
              </>
            )}
          </div>

          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">System</div>
          <div className="space-y-1">
             <Link to="/support" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/support') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.6 9a2.4 2.4 0 114.3 1.45c-.9 1.05-1.9 1.3-1.9 2.55M12 16.5h.01"/></svg>
              Support
            </Link>
            <Link to="/profile" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/profile') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              My Profile
            </Link>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2.5 shadow-sm sm:gap-4 sm:px-6 sm:py-3">
          
          {/* Left: Mobile Menu & Title */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation menu" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-blue-600 lg:hidden">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="min-w-0 truncate text-sm font-bold text-gray-800 sm:text-xl">{title}</h2>
          </div>

          {/* Right: Notifications, Profile, Logout */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
            
            {/* 🌟 අලුත් Notification Bell (පින්තූරෙට 100%ක්ම සමානයි) */}
            <Link 
              to="/notifications" 
              title="Notifications"
              className="group relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f7fc] text-[#334155] shadow-sm ring-1 ring-slate-200/60 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:text-blue-600 hover:shadow-md sm:h-10 sm:w-10 sm:rounded-2xl"
            >
              <svg 
                className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
              
              {/* රතු පාට Notification Count එක (Unread > 0 නම් විතරක් පේනවා) */}
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="hidden h-6 w-px bg-gray-200 sm:block"></div>

            {/* Profile Avatar */}
            <Link to="/profile" aria-label="Open profile" className="flex shrink-0 items-center gap-2.5 rounded-xl p-0.5 transition hover:bg-gray-50 sm:p-1 sm:pr-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-md ring-2 ring-white sm:h-9 sm:w-9">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden flex-col items-start sm:flex">
                <span className="text-sm font-bold text-gray-800 leading-tight">{user?.name}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500">{user?.roleName}</span>
              </div>
            </Link>

            <div className="hidden h-6 w-px bg-gray-200 sm:block"></div>

            {/* Logout Icon Button */}
            <button 
              onClick={handleLogout} 
              title="Logout"
              aria-label="Logout"
              className="group inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-500 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-100 hover:text-rose-600 hover:shadow-md sm:h-10 sm:w-10"
            >
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-8 flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;