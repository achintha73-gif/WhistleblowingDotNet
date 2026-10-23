import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Layout from '../components/Layout';
import { formatColomboDateTime } from '../utils/dateTime';

const Notifications = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionError, setActionError] = useState('');
  const [readingIds, setReadingIds] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/api/Notifications', { headers: { Authorization: `Bearer ${token}` } });
        setNotifications(res.data);
      } catch { setError(true); } finally { setLoading(false); }
    };
    fetchNotifications();
  }, [token]);

  const markAsRead = async (id) => {
    setActionError('');
    setReadingIds(current => [...current, id]);
    try {
      await api.put(`/api/Notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
    } catch (error) {
      setActionError(error.response?.data?.error || 'Could not mark this notification as read. Please try again.');
    } finally {
      setReadingIds(current => current.filter(readingId => readingId !== id));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Layout title="Notifications">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="mt-0.5 text-sm text-gray-600">
                {unreadCount > 0 ? `You have ${unreadCount} unread notifications.` : "You are all caught up."}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/60 px-3.5 py-2 shadow-sm">
            <span className="text-sm font-semibold text-gray-900">{notifications.length} total</span>
          </div>
        </div>

        {actionError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div>}

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">We could not load notifications. Refresh to try again.</div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white/60 p-12 text-center">
            <p className="mt-3 text-sm font-semibold text-gray-900">No notifications</p>
            <p className="mt-1 text-xs text-gray-500">You will see updates here when events happen.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notifications.map(n => (
              <li key={n.notificationId} className={`group relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 shadow-sm transition ${!n.isRead ? 'border-blue-200/60 bg-gradient-to-br from-blue-50/90 to-indigo-50/90' : 'border-white/60 bg-white/60'}`}>
                {!n.isRead && <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-600"></span>}
                
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/70">
                  <svg className={`h-4 w-4 ${!n.isRead ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-relaxed ${!n.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>{n.message}</p>
                  <p className="mt-1.5 text-xs text-gray-500">{formatColomboDateTime(n.createdAt)}</p>
                </div>

                {!n.isRead && (
                  <button onClick={() => markAsRead(n.notificationId)} disabled={readingIds.includes(n.notificationId)} className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-wait disabled:opacity-60">
                    {readingIds.includes(n.notificationId) ? 'Savingâ€¦' : 'Mark read'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};
export default Notifications;
