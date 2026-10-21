import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { normalizeCases } from '../utils/cases';
import { formatColomboDate, getColomboGreeting } from '../utils/dateTime';

const iconPaths = {
  cases: 'M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7V5a2 2 0 0 1 2-2h5l2 2h5',
  clock: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  alert: 'M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.5L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4m0 4h.01',
  check: 'M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0',
  arrow: 'M5 12h14m-7-7 7 7-7 7',
};

const Icon = ({ name, className = 'h-5 w-5' }) => <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[name]} /></svg>;

const statusStyles = {
  OPEN: 'border-sky-200 bg-sky-50 text-sky-700',
  INVESTIGATING: 'border-violet-200 bg-violet-50 text-violet-700',
  PENDING_REVIEW: 'border-amber-200 bg-amber-50 text-amber-700',
  CLOSED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  ARCHIVED: 'border-slate-200 bg-slate-50 text-slate-600',
};

const priorityStyles = {
  LOW: 'border-slate-200 bg-slate-50 text-slate-600',
  MEDIUM: 'border-blue-200 bg-blue-50 text-blue-700',
  HIGH: 'border-amber-200 bg-amber-50 text-amber-700',
  CRITICAL: 'border-rose-200 bg-rose-50 text-rose-700',
};

const InvestigatorDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [cases, setCases] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    setError(false);
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    const [caseResult, notificationResult] = await Promise.allSettled([
      axios.get('/api/Cases', headers), axios.get('/api/Notifications', headers),
    ]);
    if (caseResult.status === 'fulfilled') setCases(normalizeCases(caseResult.value.data));
    else setError(true);
    if (notificationResult.status === 'fulfilled') setNotifications(Array.isArray(notificationResult.value.data) ? notificationResult.value.data : []);
    setLoading(false);
    setRefreshing(false);
  }, [token]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const activeCases = cases.filter(item => item.status !== 'CLOSED' && item.status !== 'ARCHIVED');
  const open = activeCases.filter(item => item.status === 'OPEN').length;
  const investigating = activeCases.filter(item => item.status === 'INVESTIGATING').length;
  const awaitingReview = activeCases.filter(item => item.status === 'PENDING_REVIEW').length;
  const urgent = activeCases.filter(item => item.priority === 'HIGH' || item.priority === 'CRITICAL').length;
  const unreadNotifications = notifications.filter(item => !item.isRead).length;
  const recentlyUpdated = [...cases].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 6);
  const latestNotifications = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const cards = [
    { label: 'Active assignments', value: activeCases.length, note: 'Ready to start', subValue: open, icon: 'cases', color: 'from-sky-400 to-sky-500' },
    { label: 'Investigating', value: investigating, note: 'Reports to complete', subValue: investigating, icon: 'clock', color: 'from-emerald-400 to-emerald-500' },
    { label: 'High priority', value: urgent, note: 'High and critical active cases', subValue: urgent, icon: 'alert', color: 'from-orange-400 to-orange-500' },
    { label: 'Awaiting manager review', value: awaitingReview, note: 'Reports sent for review', subValue: awaitingReview, icon: 'check', color: 'from-violet-400 to-violet-500' },
  ];

  const progress = [
    { label: 'Ready to start', value: open, color: 'bg-sky-500' },
    { label: 'Investigating', value: investigating, color: 'bg-violet-500' },
    { label: 'Awaiting review', value: awaitingReview, color: 'bg-amber-500' },
  ];

  return (
    <Layout title="Investigator Dashboard">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl">{getColomboGreeting()}, {user?.name || 'Investigator'} <span aria-hidden="true">{'\u{1F44B}'}</span></h1><p className="mt-1 text-sm text-slate-600">Your investigation queue and the next steps for each assigned case.</p>{unreadNotifications > 0 && <Link to="/notifications" className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800"><span className="h-2 w-2 rounded-full bg-blue-600" />{unreadNotifications} unread {unreadNotifications === 1 ? 'notification' : 'notifications'}</Link>}</div>
          <Link to="/manage-cases" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700"><Icon name="cases" className="h-4 w-4" />View my cases</Link>
        </div>

        {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>Some dashboard data could not be loaded. Available information is still shown.</span><button type="button" onClick={() => loadDashboard(true)} disabled={refreshing} className="rounded-lg px-3 py-1.5 font-semibold underline underline-offset-2 disabled:opacity-60">{refreshing ? 'Refreshing…' : 'Try again'}</button></div>}

        <section aria-label="Assignment summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(card => <article key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.color} p-4 text-white shadow-lg shadow-slate-500/15`}>
            <h2 className="text-sm font-semibold text-white/95">{card.label}</h2>
            <p className="mt-2 text-2xl font-bold leading-none">{loading ? '—' : card.value}</p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white/20 px-3 py-2 text-[11px] font-medium"><span>{card.note}</span><span>{loading ? '—' : card.subValue}</span></div>
          </article>)}
        </section>

        <section aria-label="Quick actions" className="grid gap-3 md:grid-cols-3">
          {[
            { to: '/manage-cases', title: 'Open a case', note: `${open} cases ready to investigate`, icon: 'cases', tint: 'bg-sky-50 text-sky-600' },
            { to: '/manage-cases', title: 'Complete reports', note: `${investigating} investigation reports needed`, icon: 'clock', tint: 'bg-amber-50 text-amber-600' },
            { to: '/notifications', title: 'Notifications', note: `${unreadNotifications} unread updates`, icon: 'bell', tint: 'bg-violet-50 text-violet-600' },
          ].map(action => <Link key={action.to} to={action.to} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-md shadow-slate-400/10 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${action.tint}`}><Icon name={action.icon} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800 group-hover:text-blue-700">{action.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{action.note}</span></span><Icon name="arrow" className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" /></Link>)}
        </section>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-lg shadow-slate-400/10 backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800 sm:text-base">My investigation queue</h2><p className="mt-1 text-xs text-slate-500">Recently updated cases assigned to you</p></div><Link to="/manage-cases" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800">View all</Link></div>
            {loading ? <p className="px-5 py-10 text-center text-sm text-slate-500">Loading assigned cases…</p> : error && cases.length === 0 ? <p className="px-5 py-10 text-center text-sm text-rose-700">Cases are unavailable right now.</p> : recentlyUpdated.length === 0 ? <div className="px-5 py-12 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon name="cases" /></span><h3 className="mt-3 text-sm font-semibold text-slate-800">No assigned cases yet</h3><p className="mt-1 text-xs text-slate-500">New assignments from your manager will appear here.</p></div> : <div className="divide-y divide-slate-100">{recentlyUpdated.map(item => <Link key={item.caseId} to={`/case/${item.caseId}`} className="group block min-w-0 px-5 py-3.5 transition hover:bg-white"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold text-slate-800 group-hover:text-blue-700">{item.complaintTitle || `Case #${item.caseId}`}</h3>{item.isAnonymous && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">Anonymous</span>}</div><p className="mt-1 text-xs text-slate-500">{item.category || 'General'} · Updated {formatColomboDate(item.updatedAt || item.createdAt)}</p></div><span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[item.status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>{(item.status || 'Unknown').replace(/_/g, ' ')}</span></div><div className="mt-2 flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${priorityStyles[item.priority] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>{item.priority || 'Unspecified'} priority</span>{item.status === 'INVESTIGATING' && <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">Report needed</span>}</div></Link>)}</div>}
          </section>

          <div className="space-y-4">
            <section className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-400/10 backdrop-blur sm:p-5">
              <div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Work progress</h2><p className="mt-1 text-xs text-slate-500">Your active case status</p></div>
              <div className="mt-5 space-y-4">{progress.map(row => <div key={row.label}><div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-slate-600">{row.label}</span><span className="font-semibold text-slate-700">{loading ? '—' : row.value}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${row.color} transition-all`} style={{ width: `${activeCases.length ? Math.min(100, Math.round((row.value / activeCases.length) * 100)) : 0}%` }} /></div></div>)}</div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs"><span className="font-medium text-slate-600">Closed assignments</span><span className="font-semibold text-slate-700">{loading ? '—' : cases.filter(item => item.status === 'CLOSED').length}</span></div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-lg shadow-slate-400/10 backdrop-blur">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5"><div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Latest notifications</h2><p className="mt-1 text-xs text-slate-500">Updates about your assignments</p></div><Link to="/notifications" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800">View all</Link></div>
              {loading ? <p className="px-5 py-8 text-center text-xs text-slate-500">Loading notifications…</p> : latestNotifications.length === 0 ? <p className="px-5 py-8 text-center text-xs text-slate-500">You are all caught up. Updates will appear here.</p> : <ul className="divide-y divide-slate-100">{latestNotifications.map(item => <li key={item.notificationId} className="flex gap-3 px-4 py-3.5 sm:px-5"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon name="bell" className="h-4 w-4" /></span><p className="line-clamp-2 min-w-0 text-xs leading-5 text-slate-700">{item.message}</p></li>)}</ul>}
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvestigatorDashboard;
