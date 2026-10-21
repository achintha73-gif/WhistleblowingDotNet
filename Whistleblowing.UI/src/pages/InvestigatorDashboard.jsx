import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const InvestigatorDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axios.get('/api/Cases', { headers: { Authorization: `Bearer ${token}` } });
        setCases(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [token]);

  // Stats ගණනය කිරීම
  const active = cases.length;
  const open = cases.filter(c => c.status === 'OPEN').length;
  const investigating = cases.filter(c => c.status === 'INVESTIGATING').length;
  const pendingReview = cases.filter(c => c.status === 'PENDING_REVIEW').length;
  const highPriority = cases.filter(c => c.priority === 'HIGH' || c.priority === 'CRITICAL').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return 'border-sky-200 bg-sky-50 text-sky-800';
      case 'INVESTIGATING': return 'border-violet-200 bg-violet-50 text-violet-800';
      case 'PENDING_REVIEW': return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'CLOSED': return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      case 'ARCHIVED': return 'border-slate-200 bg-slate-50 text-slate-700';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'LOW': return 'border-slate-200 bg-slate-50 text-slate-700';
      case 'MEDIUM': return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'HIGH': return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'CRITICAL': return 'border-rose-200 bg-rose-50 text-rose-700';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  return (
    <Layout title="Investigator Dashboard">
      <div className="space-y-4">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name} 👋</h1>
            <p className="mt-1 text-sm text-gray-600">Your investigation queue and the next steps for each assigned case.</p>
          </div>
          <Link to="/investigator" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            View my cases
          </Link>
        </div>

        {/* Stat Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 p-4 text-white shadow-lg shadow-sky-500/25">
            <div className="text-sm font-medium text-white/95">Active assignments</div>
            <div className="mt-2 text-2xl font-bold">{active}</div>
            <div className="mt-3 flex justify-between rounded-lg bg-white/20 px-3 py-2 text-xs"><span>Ready to start</span><span className="font-semibold">{open}</span></div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 p-4 text-white shadow-lg shadow-emerald-500/25">
            <div className="text-sm font-medium text-white/95">Investigating</div>
            <div className="mt-2 text-2xl font-bold">{investigating}</div>
            <div className="mt-3 flex justify-between rounded-lg bg-white/20 px-3 py-2 text-xs"><span>In progress</span><span className="font-semibold">{investigating}</span></div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 p-4 text-white shadow-lg shadow-orange-500/25">
            <div className="text-sm font-medium text-white/95">High priority</div>
            <div className="mt-2 text-2xl font-bold">{highPriority}</div>
            <div className="mt-3 rounded-lg bg-white/20 px-3 py-2 text-xs">High and critical active cases</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-violet-400 to-violet-500 p-4 text-white shadow-lg shadow-violet-500/25">
            <div className="text-sm font-medium text-white/95">Awaiting manager review</div>
            <div className="mt-2 text-2xl font-bold">{pendingReview}</div>
            <div className="mt-3 rounded-lg bg-white/20 px-3 py-2 text-xs">Reports sent for review</div>
          </div>
        </section>

        {/* Case List */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
          <section className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div><h2 className="font-semibold text-gray-900">My investigation queue</h2><p className="mt-0.5 text-xs text-gray-500">Recently updated cases assigned to you</p></div>
            </div>
            
            {loading ? (
              <p className="p-6 text-center text-sm text-gray-500">Loading...</p>
            ) : cases.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg></div>
                <p className="mt-2 text-sm font-semibold text-gray-900">No cases assigned yet</p>
                <p className="mt-1 text-xs text-gray-500">Cases assigned by your manager will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cases.map((item) => (
                  <Link to={`/case/${item.caseId}`} key={item.caseId} className="group block px-4 py-3 transition hover:bg-white/70">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-blue-700">{item.complaintTitle}</h3>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadge(item.status)}`}>{item.status}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getPriorityBadge(item.priority)}`}>{item.priority} priority</span>
                      {item.status === 'INVESTIGATING' && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">Report needed</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Right Sidebar - Work Progress */}
          <div className="space-y-4">
            <section className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-lg backdrop-blur-xl">
              <div><h2 className="font-semibold text-gray-900">Work progress</h2><p className="mt-0.5 text-xs text-gray-500">Your active case status</p></div>
              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-gray-600">Open</span><span className="font-semibold text-gray-800">{open}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-sky-500" style={{ width: `${active === 0 ? 0 : Math.min(100, Math.round((open / active) * 100))}%` }}></div></div>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-gray-600">Investigating</span><span className="font-semibold text-gray-800">{investigating}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-violet-500" style={{ width: `${active === 0 ? 0 : Math.min(100, Math.round((investigating / active) * 100))}%` }}></div></div>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-gray-600">Awaiting review</span><span className="font-semibold text-gray-800">{pendingReview}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-amber-500" style={{ width: `${active === 0 ? 0 : Math.min(100, Math.round((pendingReview / active) * 100))}%` }}></div></div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvestigatorDashboard;