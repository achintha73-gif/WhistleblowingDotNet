import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5-5 5 5m-5-5v12',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0',
  arrow: 'M5 12h14m-7-7 7 7-7 7',
};

const Icon = ({ name, className = 'h-5 w-5' }) => <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[name]} /></svg>;

const AdminDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [usersError, setUsersError] = useState(false);
  const mounted = useRef(false);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(false);
    setUsersError(false);
    const [statsResult, complaintResult, casesResult, notificationResult, usersResult] = await Promise.allSettled([
      axios.get('/api/Admin/stats', { headers }),
      axios.get('/api/Complaints', { headers }),
      axios.get('/api/Cases', { headers }),
      axios.get('/api/Notifications', { headers }),
      axios.get('/api/Users', { headers }),
    ]);
    if (!mounted.current) return;
    setStats(statsResult.status === 'fulfilled' ? statsResult.value.data : null);
    setComplaints(complaintResult.status === 'fulfilled' && Array.isArray(complaintResult.value.data) ? complaintResult.value.data : []);
    setCases(casesResult.status === 'fulfilled' ? normalizeCases(casesResult.value.data) : []);
    setNotifications(notificationResult.status === 'fulfilled' && Array.isArray(notificationResult.value.data) ? notificationResult.value.data : []);
    setUsers(usersResult.status === 'fulfilled' && Array.isArray(usersResult.value.data) ? usersResult.value.data : []);
    const usersFailed = usersResult.status !== 'fulfilled';
    setUsersError(usersFailed);
    setError([statsResult, complaintResult, casesResult, notificationResult, usersResult].some(result => result.status !== 'fulfilled'));
    setLoading(false);
    setRefreshing(false);
  }, [headers]);

  useEffect(() => {
    mounted.current = true;
    loadDashboard();
    return () => { mounted.current = false; };
  }, [loadDashboard]);

  const activeCases = cases.filter(item => item.status !== 'CLOSED' && item.status !== 'ARCHIVED').length;
  const userCount = stats?.totalUsers ?? (usersError ? null : users.length);
  const cards = [
    { label: 'Total concerns', value: stats?.totalComplaints ?? complaints.length, foot: 'Submitted reports', icon: 'report', color: 'from-sky-400 to-sky-500' },
    { label: 'Total cases', value: stats?.totalCases ?? cases.length, foot: `${activeCases} active cases`, icon: 'cases', color: 'from-emerald-400 to-emerald-500' },
    { label: 'User accounts', value: userCount, foot: 'Registered accounts', icon: 'users', color: 'from-orange-400 to-orange-500' },
    { label: 'Evidence files', value: stats?.totalEvidenceFiles, foot: 'Uploaded evidence', icon: 'upload', color: 'from-violet-400 to-violet-500' },
  ];
  const recentCases = [...cases].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5);
  const recentComplaints = [...complaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const recentNotifications = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const caseStyle = { OPEN: 'border-sky-200 bg-sky-50 text-sky-700', INVESTIGATING: 'border-violet-200 bg-violet-50 text-violet-700', PENDING_REVIEW: 'border-amber-200 bg-amber-50 text-amber-700', CLOSED: 'border-emerald-200 bg-emerald-50 text-emerald-700', ARCHIVED: 'border-slate-200 bg-slate-50 text-slate-600' };
  const roleNames = { 1: 'Admin', 2: 'Manager', 3: 'Investigator', 4: 'Employee' };
  const userStatus = status => ({
    0: { label: 'Active', style: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    1: { label: 'Inactive', style: 'border-slate-200 bg-slate-100 text-slate-700' },
    2: { label: 'Suspended', style: 'border-rose-200 bg-rose-50 text-rose-700' },
    ACTIVE: { label: 'Active', style: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    INACTIVE: { label: 'Inactive', style: 'border-slate-200 bg-slate-100 text-slate-700' },
    SUSPENDED: { label: 'Suspended', style: 'border-rose-200 bg-rose-50 text-rose-700' },
  }[status] || { label: 'Unknown', style: 'border-slate-200 bg-slate-50 text-slate-600' });

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{getColomboGreeting()}, {user?.name || 'Admin'} <span aria-hidden="true">{'\u{1F44B}'}</span></h1><p className="mt-1 text-sm text-slate-600">System overview and administration.</p></div>
          <Link to="/manage-users" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700"><Icon name="users" className="h-4 w-4" />Manage users</Link>
        </div>

        {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>Some dashboard data could not be loaded. Available information is still shown.</span><button type="button" onClick={() => loadDashboard(true)} disabled={refreshing} className="rounded-lg px-3 py-1.5 font-semibold underline underline-offset-2 disabled:opacity-60">{refreshing ? 'Refreshing…' : 'Try again'}</button></div>}

        <section aria-label="System statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(card => <article key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.color} p-4 text-white shadow-lg shadow-slate-500/15`}>
            <h2 className="text-sm font-semibold text-white/95">{card.label}</h2>
            <p className="mt-2 text-2xl font-bold leading-none">{loading ? '—' : (card.value ?? '—')}</p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white/20 px-3 py-2 text-[11px] font-medium"><span>{card.foot}</span><span>{loading ? '—' : (card.value ?? '—')}</span></div>
          </article>)}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold text-slate-800">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { to: '/manage-complaints', title: 'Review concerns', note: 'Review employee reports', icon: 'report', tint: 'bg-sky-50 text-sky-600' },
              { to: '/manage-users', title: 'User management', note: 'Manage accounts and roles', icon: 'users', tint: 'bg-blue-50 text-blue-600' },
              { to: '/manage-cases', title: 'Case management', note: 'Assign and track cases', icon: 'cases', tint: 'bg-violet-50 text-violet-600' },
              { to: '/manage-departments', title: 'Departments', note: 'Manage departments', icon: 'report', tint: 'bg-emerald-50 text-emerald-600' },
            ].map(action => <Link key={action.to} to={action.to} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-md shadow-slate-400/10 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${action.tint}`}><Icon name={action.icon} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800 group-hover:text-blue-700">{action.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{action.note}</span></span><Icon name="arrow" className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" /></Link>)}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-lg shadow-slate-400/10 backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Recently added users</h2><p className="mt-1 text-xs text-slate-500">Latest accounts across the system</p></div>
            <Link to="/manage-users" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800">Manage users</Link>
          </div>
          {loading ? <p className="px-5 py-8 text-center text-sm text-slate-500">Loading users…</p>
            : usersError ? <p role="alert" className="px-5 py-8 text-center text-sm text-rose-700">User data is unavailable right now.</p>
            : recentUsers.length === 0 ? <div className="px-5 py-8 text-center"><p className="text-sm font-semibold text-slate-800">No users yet</p><p className="mt-1 text-xs text-slate-500">New accounts will appear here.</p></div>
              : <ul className="divide-y divide-slate-100">{recentUsers.map(item => {
                const status = userStatus(item.status);
                return <li key={item.userId} className="flex min-w-0 flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">{(item.name || item.email || '?').charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{item.name || 'Unnamed user'}</p><p className="truncate text-xs text-slate-500">{item.email || 'No email on file'} · {roleNames[item.roleId] || 'Unknown role'}</p></div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.style}`}>{status.label}</span>
                </li>;
              })}</ul>}
        </section>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
          <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-lg shadow-slate-400/10 backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Recent concerns</h2><p className="mt-1 text-xs text-slate-500">Latest reports from employees</p></div><span className="text-xs text-slate-500">{complaints.length} total</span></div>
            {loading ? <p className="px-5 py-9 text-center text-sm text-slate-500">Loading concerns…</p> : recentComplaints.length === 0 ? <div className="px-5 py-10 text-center"><p className="text-sm font-semibold text-slate-800">No concerns yet</p><p className="mt-1 text-xs text-slate-500">New reports will appear here.</p></div> : <div className="divide-y divide-slate-100">{recentComplaints.map(item => <Link key={item.complaintId} to={`/complaint/${item.complaintId}`} className="flex min-w-0 flex-col gap-2 px-5 py-3.5 transition hover:bg-white sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{item.title}</p><p className="mt-1 truncate text-xs text-slate-500">{item.category || 'General'} · {formatColomboDate(item.createdAt)}</p></div><span className="inline-flex w-fit shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">{(item.status || 'Unknown').replace(/_/g, ' ')}</span></Link>)}</div>}
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-lg shadow-slate-400/10 backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Recent cases</h2><p className="mt-1 text-xs text-slate-500">Latest investigation activity</p></div><Link to="/manage-cases" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800">View all</Link></div>
            {loading ? <p className="px-5 py-9 text-center text-sm text-slate-500">Loading cases…</p> : recentCases.length === 0 ? <div className="px-5 py-10 text-center"><p className="text-sm font-semibold text-slate-800">No cases yet</p><p className="mt-1 text-xs text-slate-500">Converted reports will appear here.</p></div> : <div className="divide-y divide-slate-100">{recentCases.map(item => <Link key={item.caseId} to={`/case/${item.caseId}`} className="flex min-w-0 flex-col gap-2 px-5 py-3.5 transition hover:bg-white sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{item.complaintTitle}</p><p className="mt-1 truncate text-xs text-slate-500">{item.investigatorName || 'Unassigned'} · {item.priority || 'No'} priority</p></div><span className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${caseStyle[item.status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>{(item.status || 'Unknown').replace(/_/g, ' ')}</span></Link>)}</div>}
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-lg shadow-slate-400/10 backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800 sm:text-base">Latest notifications</h2><p className="mt-1 text-xs text-slate-500">System updates for your account</p></div><Link to="/notifications" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800">View all</Link></div>
            {loading ? <p className="px-5 py-8 text-center text-xs text-slate-500">Loading notifications…</p> : recentNotifications.length === 0 ? <p className="px-5 py-8 text-center text-xs text-slate-500">No new notifications.</p> : <ul className="divide-y divide-slate-100">{recentNotifications.map(item => <li key={item.notificationId} className="flex gap-3 px-5 py-3.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon name="bell" className="h-4 w-4" /></span><p className="line-clamp-2 min-w-0 text-xs leading-5 text-slate-700">{item.message}</p></li>)}</ul>}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
