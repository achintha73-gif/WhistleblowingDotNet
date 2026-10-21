import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { normalizeCases } from '../utils/cases';
import { formatColomboDate, getColomboGreeting } from '../utils/dateTime';

const iconPaths = {
  report: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6',
  cases: 'M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7V5a2 2 0 0 1 2-2h5l2 2h5',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m16-10a4 4 0 1 0-2-7.5M22 21v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0',
  arrow: 'M5 12h14m-7-7 7 7-7 7',
};
const Icon = ({ name, className = 'h-5 w-5' }) => <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[name]} /></svg>;
const dateLabel = value => formatColomboDate(value, { month: 'short', day: 'numeric', year: 'numeric' }) || 'Date unavailable';
const normalizeStatus = value => typeof value === 'string' ? value.toUpperCase() : value;

const ManagerDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [cases, setCases] = useState([]);
  const [investigators, setInvestigators] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [failedParts, setFailedParts] = useState([]);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    const results = await Promise.allSettled([
      axios.get('/api/Complaints', { headers }),
      axios.get('/api/Cases', { headers }),
      axios.get('/api/Cases/investigators', { headers }),
      axios.get('/api/Notifications', { headers }),
    ]);
    const names = ['concerns', 'cases', 'investigators', 'notifications'];
    const failures = names.filter((_, index) => results[index].status !== 'fulfilled');
    const [complaintResult, caseResult, investigatorResult, notificationResult] = results;
    setComplaints(complaintResult.status === 'fulfilled' && Array.isArray(complaintResult.value.data) ? complaintResult.value.data : []);
    setCases(caseResult.status === 'fulfilled' ? normalizeCases(caseResult.value.data) : []);
    setInvestigators(investigatorResult.status === 'fulfilled' && Array.isArray(investigatorResult.value.data) ? investigatorResult.value.data : []);
    setNotifications(notificationResult.status === 'fulfilled' && Array.isArray(notificationResult.value.data) ? notificationResult.value.data : []);
    setFailedParts(failures);
    setError(failures.length > 0);
    setLoading(false);
    setRefreshing(false);
  }, [headers]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const pending = complaints.filter(item => normalizeStatus(item.status) === 'PENDING').length;
  const underReview = complaints.filter(item => normalizeStatus(item.status) === 'UNDER_REVIEW').length;
  const activeCases = cases.filter(item => !['CLOSED', 'ARCHIVED'].includes(normalizeStatus(item.status))).length;
  const pendingReview = cases.filter(item => normalizeStatus(item.status) === 'PENDING_REVIEW').length;
  const unassigned = cases.filter(item => !['CLOSED', 'ARCHIVED'].includes(normalizeStatus(item.status)) && !item.assignedInvestigatorId).length;
  const critical = cases.filter(item => normalizeStatus(item.priority) === 'CRITICAL' && !['CLOSED', 'ARCHIVED'].includes(normalizeStatus(item.status))).length;
  const recentComplaints = [...complaints].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
  const recentCases = [...cases].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)).slice(0, 5);
  const recentNotifications = [...notifications].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);
  const complaintStatus = {
    PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
    UNDER_REVIEW: 'border-blue-200 bg-blue-50 text-blue-800',
    APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    REJECTED: 'border-rose-200 bg-rose-50 text-rose-800',
    CONVERTED_TO_CASE: 'border-violet-200 bg-violet-50 text-violet-800',
  };
  const caseStatus = {
    OPEN: 'border-sky-200 bg-sky-50 text-sky-800',
    INVESTIGATING: 'border-violet-200 bg-violet-50 text-violet-800',
    PENDING_REVIEW: 'border-amber-200 bg-amber-50 text-amber-800',
    CLOSED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    ARCHIVED: 'border-slate-200 bg-slate-100 text-slate-700',
  };

  const cards = [
    { label: 'Pending concerns', value: pending, note: 'Need initial review', subValue: pending, color: 'from-sky-400 to-sky-500' },
    { label: 'Under review', value: underReview, note: 'Concerns being assessed', subValue: underReview, color: 'from-emerald-400 to-emerald-500' },
    { label: 'Active cases', value: activeCases, note: 'Critical priority', subValue: critical, color: 'from-orange-400 to-orange-500' },
    { label: 'Awaiting manager review', value: pendingReview, note: 'Unassigned active cases', subValue: unassigned, color: 'from-violet-400 to-violet-500' },
  ];

  return <Layout title="Manager Dashboard">
    <div className="space-y-4 sm:space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{getColomboGreeting()}, {user?.name || 'Manager'} <span aria-hidden="true">👋</span></h1><p className="mt-1 text-sm text-slate-600">Review incoming concerns and keep investigations moving.</p></div>
        <a href="#investigator-workload" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700"><Icon name="users" className="h-4 w-4" />Manage team</a>
      </header>

      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>Some dashboard data could not be loaded{failedParts.length ? ` (${failedParts.join(', ')})` : ''}. Available information is still shown.</span><button type="button" onClick={() => loadDashboard(true)} disabled={refreshing} className="rounded-lg px-3 py-1.5 font-semibold underline underline-offset-2 disabled:opacity-60">{refreshing ? 'Refreshing…' : 'Try again'}</button></div>}

      <section aria-label="Manager statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(card => <article key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.color} p-4 text-white shadow-lg shadow-slate-500/15`}>
          <h2 className="text-sm font-semibold text-white/95">{card.label}</h2>
          <p className="mt-2 text-2xl font-bold leading-none">{loading ? '—' : card.value}</p>
          <div className="mt-3 flex justify-between gap-2 rounded-lg bg-white/20 px-3 py-2 text-[11px] font-medium"><span>{card.note}</span><span className="font-semibold">{loading ? '—' : card.subValue}</span></div>
        </article>)}
      </section>

      <section aria-label="Quick actions" className="grid gap-3 md:grid-cols-3">
        {[
          { to: '/manage-complaints', title: 'Review concerns', note: `${pending} pending for review`, icon: 'report', tint: 'bg-sky-50 text-sky-600' },
          { to: '/manage-cases', title: 'Manage investigations', note: 'Assign teams and review reports', icon: 'cases', tint: 'bg-violet-50 text-violet-600' },
          { to: '#investigator-workload', title: 'Team management', note: 'View investigator assignments', icon: 'users', tint: 'bg-emerald-50 text-emerald-600' },
        ].map(action => <Link key={action.title} to={action.to} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-md shadow-slate-400/10 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${action.tint}`}><Icon name={action.icon} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800 group-hover:text-blue-700">{action.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{action.note}</span></span><Icon name="arrow" className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" /></Link>)}
      </section>

      <div className="grid items-stretch gap-4 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-lg shadow-slate-400/10 backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Recent concerns</h2><p className="mt-1 text-xs text-slate-500">Latest submissions requiring attention</p></div><Link to="/manage-complaints" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800">View all</Link></div>
          {loading ? <p className="px-5 py-9 text-center text-sm text-slate-500">Loading concerns…</p> : recentComplaints.length === 0 ? <p className="px-5 py-9 text-center text-sm text-slate-500">No concerns to review yet.</p> : <div className="divide-y divide-slate-100">{recentComplaints.map(item => { const status = normalizeStatus(item.status); return <Link to={`/complaint/${item.complaintId}`} key={item.complaintId} className="flex min-w-0 items-center justify-between gap-3 px-5 py-3 transition hover:bg-white"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{item.title || 'Untitled concern'}</p><p className="mt-1 truncate text-xs text-slate-500">{item.category || 'General'} · {dateLabel(item.createdAt)}</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${complaintStatus[status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>{(status || 'UNKNOWN').replace(/_/g, ' ')}</span></Link>; })}</div>}
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-lg shadow-slate-400/10 backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Recent cases</h2><p className="mt-1 text-xs text-slate-500">Current investigation work</p></div><Link to="/manage-cases" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800">View all</Link></div>
          {loading ? <p className="px-5 py-9 text-center text-sm text-slate-500">Loading cases…</p> : recentCases.length === 0 ? <p className="px-5 py-9 text-center text-sm text-slate-500">No cases have been created yet.</p> : <div className="divide-y divide-slate-100">{recentCases.map(item => { const status = normalizeStatus(item.status); return <Link to={`/case/${item.caseId}`} key={item.caseId} className="flex min-w-0 items-center justify-between gap-3 px-5 py-3 transition hover:bg-white"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{item.complaintTitle || `Case #${item.caseId}`}</p><p className="mt-1 truncate text-xs text-slate-500">{item.investigatorName || 'Awaiting assignment'} · {item.priority || 'No'} priority</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${caseStatus[status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>{(status || 'UNKNOWN').replace(/_/g, ' ')}</span></Link>; })}</div>}
        </section>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <section id="investigator-workload" className="scroll-mt-24 overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-lg shadow-slate-400/10 backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Investigator workload</h2><p className="mt-1 text-xs text-slate-500">Active cases assigned to each investigator</p></div><Link to="/manage-cases" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800">View cases</Link></div>
            {loading ? <p className="px-5 py-8 text-center text-sm text-slate-500">Loading team…</p> : investigators.length === 0 ? <p className="px-5 py-8 text-center text-sm text-slate-500">No active investigators found.</p> : <ul className="divide-y divide-slate-100">{investigators.slice(0, 5).map(person => { const assigned = cases.filter(item => (String(item.assignedInvestigatorId) === String(person.userId) || item.assignedInvestigatorIds?.split(',').includes(String(person.userId))) && !['CLOSED', 'ARCHIVED'].includes(normalizeStatus(item.status))).length; return <li key={person.userId} className="flex items-center gap-3 px-5 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">{(person.name || '?').charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{person.name || 'Investigator'}</span><span className="block truncate text-xs text-slate-500">{person.email || 'Active investigator'}</span></span><span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{assigned} active</span></li>; })}</ul>}
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-lg shadow-slate-400/10 backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Latest notifications</h2><p className="mt-1 text-xs text-slate-500">Updates for your management account</p></div><Link to="/notifications" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800">View all</Link></div>
          {loading ? <p className="px-5 py-8 text-center text-sm text-slate-500">Loading notifications…</p> : recentNotifications.length === 0 ? <p className="px-5 py-8 text-center text-sm text-slate-500">No new notifications.</p> : <ul className="divide-y divide-slate-100">{recentNotifications.map(item => <li key={item.notificationId} className="flex gap-3 px-5 py-3.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon name="bell" className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="line-clamp-2 block text-xs leading-5 text-slate-700">{item.message || 'System update'}</span><span className="mt-1 block text-[10px] text-slate-400">{dateLabel(item.createdAt)}</span></span></li>)}</ul>}
        </section>
      </div>
    </div>
  </Layout>;
};

export default ManagerDashboard;
