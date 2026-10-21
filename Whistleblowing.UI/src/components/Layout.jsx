import { useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Layout = ({ children, title }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Role එක අනුව ලින්ක් එක Active ද නැද්ද යන්න බලන Function එක
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">Whistleblowing</h1>
            <p className="text-[10px] text-gray-500 font-medium">Management System</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          
          {/* Main Section */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Main</div>
            <div className="space-y-1">
              {user?.roleName === 'ADMIN' && (
                <Link to="/admin" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/admin') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 3.75h6.5v6.5h-6.5zM13.75 3.75h6.5v6.5h-6.5zM3.75 13.75h6.5v6.5h-6.5zM13.75 13.75h6.5v6.5h-6.5z" /></svg>
                  Dashboard
                </Link>
              )}
              {user?.roleName === 'MANAGER' && (
                <Link to="/manager" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/manager') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 3.75h6.5v6.5h-6.5zM13.75 3.75h6.5v6.5h-6.5zM3.75 13.75h6.5v6.5h-6.5zM13.75 13.75h6.5v6.5h-6.5z" /></svg>
                  Dashboard
                </Link>
              )}
              {user?.roleName === 'INVESTIGATOR' && (
                <Link to="/investigator" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/investigator') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 3.75h6.5v6.5h-6.5zM13.75 3.75h6.5v6.5h-6.5zM3.75 13.75h6.5v6.5h-6.5zM13.75 13.75h6.5v6.5h-6.5z" /></svg>
                  Dashboard
                </Link>
              )}
              {user?.roleName === 'USER' && (
                <Link to="/employee" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/employee') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 3.75h6.5v6.5h-6.5zM13.75 3.75h6.5v6.5h-6.5zM3.75 13.75h6.5v6.5h-6.5zM13.75 13.75h6.5v6.5h-6.5z" /></svg>
                  Dashboard
                </Link>
              )}

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
            </div>
          </div>

          {/* People Section (Admin Only) */}
          {user?.roleName === 'ADMIN' && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">People</div>
              <div className="space-y-1">
                <Link to="/manage-users" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/manage-users') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  Users
                </Link>
                <Link to="/manage-departments" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/manage-departments') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  Departments
                </Link>
              </div>
            </div>
          )}

          {/* System Section */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">System</div>
            <div className="space-y-1">
              {user?.roleName === 'ADMIN' && (
                <Link to="/activity-logs" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/activity-logs') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Activity Logs
                </Link>
              )}
              <Link to="/notifications" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/notifications') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                Notifications
              </Link>
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

        {/* Bottom Logout Area */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 8.25V5.5A1.5 1.5 0 0014.25 4h-8.5a1.5 1.5 0 00-1.5 1.5v13A1.5 1.5 0 005.75 20h8.5a1.5 1.5 0 001.5-1.5v-2.75M10 12h10m0 0-3.5-3.5M20 12l-3.5 3.5"/></svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex justify-between items-center z-10 sticky top-0">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
              <span className="text-xs text-blue-600 font-medium">{user?.roleName}</span>
            </div>
          </div>
        </header>
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