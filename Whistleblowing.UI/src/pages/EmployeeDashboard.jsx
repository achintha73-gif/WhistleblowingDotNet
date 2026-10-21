import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { formatColomboDate, getColomboGreeting } from '../utils/dateTime';

const iconPaths = {
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5',
  clock: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  check: 'M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3',
  arrow: 'M5 12h14m-7-7 7 7-7 7',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0',
};

const Icon = ({ name, className = 'h-5 w-5' }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[name]} /></svg>
);

const statusStyles = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  UNDER_REVIEW: 'border-blue-200 bg-blue-50 text-blue-700',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
  CONVERTED_TO_CASE: 'border-violet-200 bg-violet-50 text-violet-700',
};

const getStatusLabel = (status) => ({
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under review',
  APPROVED: 'Approved',
  REJECTED: 'Not approved',
  CONVERTED_TO_CASE: 'In investigation',
}[status] || (status || 'Unknown').replace(/_/g, ' '));

const formatDate = value => formatColomboDate(value, { year: 'numeric', month: 'short', day: 'numeric' }) || 'Date unavailable';

const EmployeeDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [complaintsError, setComplaintsError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    setComplaintsError(false);
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    const [complaintsResult, notificationsResult] = await Promise.allSettled([
      axios.get('/api/Complaints', headers), axios.get('/api/Notifications', headers),
    ]);
    if (complaintsResult.status === 'fulfilled') setComplaints(Array.isArray(complaintsResult.value.data) ? complaintsResult.value.data : []);
    else setComplaintsError(true);
    if (notificationsResult.status === 'fulfilled') setNotifications(Array.isArray(notificationsResult.value.data) ? notificationsResult.value.data : []);
    setLoading(false);
    setRefreshing(false);
  }, [token]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  useEffect(() => {
    const refreshNotifications = async () => {
      try {
        const response = await axios.get('/api/Notifications', { headers: { Authorization: `Bearer ${token}` } });
        setNotifications(Array.isArray(response.data) ? response.data : []);
      } catch { /* The dashboard keeps the last successfully loaded notifications. */ }
    };
    const interval = window.setInterval(refreshNotifications, 30000);
    return () => window.clearInterval(interval);
  }, [token]);

  const total = complaints.length;
  const pending = complaints.filter(item => item.status === 'PENDING').length;
  const underReview = complaints.filter(item => item.status === 'UNDER_REVIEW').length;
  const investigating = complaints.filter(item => item.status === 'CONVERTED_TO_CASE').length;
  const approved = complaints.filter(item => item.status === 'APPROVED').length;
  const rejected = complaints.filter(item => item.status === 'REJECTED').length;
  const decided = approved + rejected;
  const latestComplaints = [...complaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const latestNotifications = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  const statCards = [
    { label: 'All my concerns', value: total, footer: 'Submitted from your account', icon: 'file', color: 'from-sky-400 to-sky-500' },
    { label: 'Awaiting review', value: pending, footer: 'Pending initial review', icon: 'clock', color: 'from-emerald-400 to-emerald-500' },
    { label: 'Under review', value: underReview, footer: 'Being assessed', icon: 'eye', color: 'from-orange-400 to-orange-500' },
    { label: 'In investigation', value: investigating, footer: 'Converted to cases', icon: 'check', color: 'from-violet-400 to-violet-500' },
  ];

  return (
    <Layout title="Employee Dashboard">
      <div className="space-y-4 sm:space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{getColomboGreeting()}, {user?.name || 'there'} <span aria-hidden="true">{'\u{1F44B}'}</span></h1>
            <p className="mt-1 text-sm text-slate-600">Track your concerns and follow their progress.</p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Link to="/submit-complaint" className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700 sm:flex-none">
              <span className="text-lg leading-none" aria-hidden="true">+</span> Submit a concern
            </Link>
            <Link to="/profile" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/90 bg-white/75 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"><Icon name="check" className="h-4 w-4" /> My profile</Link>
          </div>
        </div>

        <section aria-label="Concern summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(card => <article key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.color} p-4 text-white shadow-lg shadow-slate-500/15`}>
            <h2 className="text-sm font-semibold text-white/95">{card.label}</h2>
            <p className="mt-2 text-2xl font-bold leading-none">{loading ? '—' : card.value}</p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white/20 px-3 py-2 text-[11px] font-medium"><span>{card.footer}</span><span>{loading ? '—' : card.value}</span></div>
          </article>)}
        </section>

        <section aria-label="Quick actions" className="grid gap-3 md:grid-cols-3">
          {[
            { to: '/submit-complaint', title: 'Submit a concern', note: 'Share a new workplace concern', icon: 'file', tint: 'bg-sky-50 text-sky-600' },
            { to: '/my-complaints', title: 'My concerns', note: 'Follow your submissions', icon: 'clock', tint: 'bg-violet-50 text-violet-600' },
            { to: '/notifications', title: 'Notifications', note: 'View recent updates', icon: 'bell', tint: 'bg-emerald-50 text-emerald-600' },
          ].map(action => <Link key={action.to} to={action.to} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-md shadow-slate-400/10 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${action.tint}`}><Icon name={action.icon} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800 group-hover:text-blue-700">{action.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{action.note}</span></span><Icon name="arrow" className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" /></Link>)}
        </section>

        {complaintsError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>Concern data could not be loaded. Try again in a moment.</span><button type="button" onClick={() => loadDashboard(true)} disabled={refreshing} className="rounded-lg px-3 py-1.5 font-semibold underline underline-offset-2 disabled:opacity-60">{refreshing ? 'Refreshing…' : 'Try again'}</button></div>}

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-lg shadow-slate-400/10 backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Recent concerns</h2><p className="mt-1 text-xs text-slate-500">Your latest submissions and their current status</p></div>
              <Link to="/my-complaints" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 sm:text-sm">View all</Link>
            </div>
            {loading ? <div className="px-5 py-10 text-center text-sm text-slate-500">Loading your concerns…</div>
              : complaintsError ? <div role="alert" className="px-5 py-10 text-center text-sm text-rose-700">We could not load your concerns. Please refresh and try again.</div>
                : latestComplaints.length === 0 ? <div className="px-5 py-12 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon name="file" /></span><h3 className="mt-3 text-sm font-semibold text-slate-800">No concerns submitted yet</h3><p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">Submit a concern to follow its progress here.</p><Link to="/submit-complaint" className="mt-4 inline-flex rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700">Submit a concern</Link></div>
                  : <div className="divide-y divide-slate-100">
                    {latestComplaints.map(item => <Link key={item.complaintId} to={`/complaint/${item.complaintId}`} className="flex min-w-0 flex-col gap-2 px-5 py-3.5 transition hover:bg-white sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-slate-800">{item.title}</h3><div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1 text-[11px] text-slate-500"><span>{item.category || 'General'}</span><span>Submitted {formatDate(item.createdAt)}</span></div></div>
                      <span className={`inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[item.status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>{getStatusLabel(item.status)}</span>
                    </Link>)}
                  </div>}
          </section>

          <div className="space-y-4">
            <section className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-400/10 backdrop-blur sm:p-5">
              <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Concern outcomes</h2><p className="mt-1 text-xs text-slate-500">Decisions and investigations</p></div><span className="shrink-0 text-xs font-medium text-slate-600">{loading ? '—' : `${decided} decided`}</span></div>
              <div className="mt-5 space-y-4">
                {[
                  { label: 'Approved', value: approved, color: 'bg-emerald-500' },
                  { label: 'Not approved', value: rejected, color: 'bg-rose-400' },
                  { label: 'In investigation', value: investigating, color: 'bg-violet-500' },
                ].map(row => <div key={row.label}>
                  <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-slate-600">{row.label}</span><span className="font-semibold text-slate-700">{loading ? '—' : row.value}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${row.color} transition-all`} style={{ width: `${total ? Math.min(100, Math.round((row.value / total) * 100)) : 0}%` }} /></div>
                </div>)}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-lg shadow-slate-400/10 backdrop-blur">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5"><div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Latest notifications</h2><p className="mt-1 text-xs text-slate-500">Updates about your account</p></div><Link to="/notifications" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800">View all</Link></div>
              {loading ? <p className="px-5 py-8 text-center text-xs text-slate-500">Loading notifications…</p>
                : latestNotifications.length === 0 ? <div className="px-5 py-7 text-center"><p className="text-xs leading-5 text-slate-500">You are all caught up. Updates will appear here.</p></div>
                  : <ul className="divide-y divide-slate-100">{latestNotifications.map(item => <li key={item.notificationId} className="flex gap-3 px-4 py-3.5 sm:px-5"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon name="bell" className="h-4 w-4" /></span><div className="min-w-0"><p className="line-clamp-2 text-xs font-medium leading-5 text-slate-700">{item.message}</p><p className="mt-1 text-[10px] text-slate-500">{formatDate(item.createdAt)}</p></div></li>)}</ul>}
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
