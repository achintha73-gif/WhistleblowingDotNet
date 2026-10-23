import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { normalizeCases } from '../utils/cases';
import { formatColomboDate } from '../utils/dateTime';

const badgeStyles = {
  status: {
    OPEN: 'border-sky-200 bg-sky-100 text-sky-800',
    INVESTIGATING: 'border-violet-200 bg-violet-100 text-violet-800',
    PENDING_REVIEW: 'border-amber-200 bg-amber-100 text-amber-800',
    CLOSED: 'border-emerald-200 bg-emerald-100 text-emerald-800',
    ARCHIVED: 'border-slate-200 bg-slate-100 text-slate-700',
  },
};

const formatDate = value => formatColomboDate(value, { month: 'short', day: 'numeric', year: undefined });

const Badge = ({ children, className = '' }) => <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${className}`}>{children}</span>;

const ManageCases = () => {
  const { token, user } = useContext(AuthContext);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isInvestigator = user?.roleName === 'INVESTIGATOR';
  const pageTitle = isInvestigator ? 'My Assigned Cases' : 'All Cases';
  const statusOptions = [
    { id: 'ALL', label: 'All statuses' },
    { id: 'OPEN', label: 'Open' },
    { id: 'INVESTIGATING', label: 'Investigating' },
    { id: 'PENDING_REVIEW', label: 'Awaiting review' },
    { id: 'CLOSED', label: 'Closed' },
    { id: 'ARCHIVED', label: 'Archived' },
  ];
  const visibleCases = statusFilter === 'ALL' ? cases : cases.filter(item => item.status === statusFilter);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/api/Cases', { headers: { Authorization: `Bearer ${token}` } });
      setCases(normalizeCases(res.data));
    } catch { setError(true); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  return (
    <Layout title={pageTitle} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7V5a2 2 0 0 1 2-2h5l2 2h3" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{pageTitle}</h1>
              <p className="mt-0.5 text-sm text-slate-600">{isInvestigator ? 'See the latest status of every case assigned to you.' : 'Review each case, its assigned investigators, and its current status.'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm">{cases.length} {isInvestigator ? (cases.length === 1 ? 'assignment' : 'assignments') : (cases.length === 1 ? 'case' : 'cases')}</div>
            <button type="button" onClick={fetchCases} disabled={loading} className="rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-white disabled:opacity-60">{loading ? 'Refreshingâ€¦' : 'Refresh status'}</button>
          </div>
        </div>

        <nav aria-label="Filter cases by status" className="flex flex-wrap gap-2">
          {statusOptions.map(option => {
            const count = option.id === 'ALL' ? cases.length : cases.filter(item => item.status === option.id).length;
            const selected = statusFilter === option.id;
            return <button key={option.id} type="button" aria-pressed={selected} onClick={() => setStatusFilter(option.id)} className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${selected ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-white/80 bg-white/70 text-slate-700 hover:bg-white'}`}>
              <span>{option.label}</span><span className={`rounded-full px-1.5 py-0.5 text-[10px] ${selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{count}</span>
            </button>;
          })}
        </nav>

        {loading ? <div className="rounded-2xl border border-white/70 bg-white/70 p-10 text-center text-sm text-slate-500 shadow-sm">Loading casesâ€¦</div>
          : error ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">Cases could not be loaded. <button onClick={fetchCases} className="ml-2 font-semibold underline">Try again</button></div>
          : cases.length === 0 ? <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/60 p-10 text-center"><p className="text-sm font-semibold text-slate-800">{isInvestigator ? 'No cases assigned to you yet' : 'No cases yet'}</p><p className="mt-1 text-xs text-slate-500">{isInvestigator ? 'New assignments from your manager will appear here.' : 'Cases created from approved concerns will appear here.'}</p></div>
            : visibleCases.length === 0 ? <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/60 p-10 text-center"><p className="text-sm font-semibold text-slate-800">No {statusOptions.find(option => option.id === statusFilter)?.label.toLowerCase()} cases</p><p className="mt-1 text-xs text-slate-500">Choose another status above to see more cases.</p></div>
              : <div className="space-y-3">
                {visibleCases.map(item => {
                  const status = String(item.status || '').toUpperCase();
                  const priority = String(item.priority || '').toUpperCase();
                  return <Link key={item.caseId} to={`/case/${item.caseId}`} className="group block rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_8px_16px_rgba(30,41,59,.10)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-semibold text-slate-900 group-hover:text-blue-700">{item.complaintTitle || `Case #${item.caseId}`}</h2>
                          {item.isAnonymous && <Badge className="border-slate-200 bg-slate-100 text-slate-600">Anonymous</Badge>}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="rounded-md border border-slate-100 bg-white/80 px-2 py-0.5">{item.category || 'Uncategorized'}</span>
                          {item.investigatorName ? <span>Investigator: {item.investigatorName}</span> : <span className="font-medium text-amber-700">Unassigned</span>}
                          <span>{priority ? `${priority.charAt(0)}${priority.slice(1).toLowerCase()} priority` : 'Priority not set'}</span>
                          <span>Updated {formatDate(item.updatedAt || item.createdAt)}</span>
                        </div>
                        <p className="mt-3 text-xs text-slate-400">Case #{item.caseId}</p>
                      </div>
                      <Badge className={badgeStyles.status[status] || 'border-slate-200 bg-slate-100 text-slate-700'}>{status.replaceAll('_', ' ') || 'UNKNOWN'}</Badge>
                    </div>
                  </Link>;
                })}
              </div>}
      </div>
    </Layout>
  );
};

export default ManageCases;
