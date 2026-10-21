import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, caseRes] = await Promise.all([
          axios.get('/api/Complaints', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/Cases', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setComplaints(compRes.data);
        setCases(caseRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Calculations
  const pending = complaints.filter(c => c.status === 'PENDING').length;
  const underReview = complaints.filter(c => c.status === 'UNDER_REVIEW').length;
  const activeCases = cases.filter(c => c.status !== 'CLOSED' && c.status !== 'ARCHIVED').length;
  const pendingReview = cases.filter(c => c.status === 'PENDING_REVIEW').length;
  const unassigned = cases.filter(c => !c.assignedInvestigatorId).length;
  const critical = cases.filter(c => c.priority === 'CRITICAL').length;

  const getComplaintBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'UNDER_REVIEW': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'APPROVED': return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      case 'REJECTED': return 'border-rose-200 bg-rose-50 text-rose-800';
      case 'CONVERTED_TO_CASE': return 'border-violet-200 bg-violet-50 text-violet-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  const getCaseBadge = (status) => {
    switch (status) {
      case 'OPEN': return 'border-sky-200 bg-sky-50 text-sky-800';
      case 'INVESTIGATING': return 'border-violet-200 bg-violet-50 text-violet-800';
      case 'PENDING_REVIEW': return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'CLOSED': return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  return (
    <Layout title="Manager Dashboard">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name} 👋</h1>
            <p className="mt-1 text-sm text-gray-600">Review incoming concerns and keep investigations moving.</p>
          </div>
        </div>

        {/* Stat Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 p-4 text-white shadow-lg shadow-sky-500/25">
            <div className="text-sm font-medium text-white/95">Pending concerns</div>
            <div className="mt-2 text-2xl font-bold">{pending}</div>
            <div className="mt-3 flex justify-between rounded-lg bg-white/20 px-3 py-2 text-xs"><span>Need initial review</span><span className="font-semibold">{pending}</span></div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 p-4 text-white shadow-lg shadow-emerald-500/25">
            <div className="text-sm font-medium text-white/95">Under review</div>
            <div className="mt-2 text-2xl font-bold">{underReview}</div>
            <div className="mt-3 flex justify-between rounded-lg bg-white/20 px-3 py-2 text-xs"><span>Concerns being assessed</span><span className="font-semibold">{underReview}</span></div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 p-4 text-white shadow-lg shadow-orange-500/25">
            <div className="text-sm font-medium text-white/95">Active cases</div>
            <div className="mt-2 text-2xl font-bold">{activeCases}</div>
            <div className="mt-3 flex justify-between rounded-lg bg-white/20 px-3 py-2 text-xs"><span>Critical priority</span><span className="font-semibold">{critical}</span></div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-violet-400 to-violet-500 p-4 text-white shadow-lg shadow-violet-500/25">
            <div className="text-sm font-medium text-white/95">Awaiting manager review</div>
            <div className="mt-2 text-2xl font-bold">{pendingReview}</div>
            <div className="mt-3 flex justify-between rounded-lg bg-white/20 px-3 py-2 text-xs"><span>Unassigned active cases</span><span className="font-semibold">{unassigned}</span></div>
          </div>
        </section>

        {/* Lists */}
        <div className="grid gap-4 xl:grid-cols-2">
          {/* Recent Concerns */}
          <section className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div><h2 className="font-semibold text-gray-900">Recent concerns</h2><p className="mt-0.5 text-xs text-gray-500">Latest submissions requiring attention</p></div>
            </div>
            <div className="divide-y divide-gray-100">
              {complaints.slice(0, 5).map(item => (
                <div key={item.complaintId} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.category || 'General'} · {new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getComplaintBadge(item.status)}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Cases */}
          <section className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div><h2 className="font-semibold text-gray-900">Recent cases</h2><p className="mt-0.5 text-xs text-gray-500">Current investigation work</p></div>
            </div>
            <div className="divide-y divide-gray-100">
              {cases.slice(0, 5).map(item => (
                <div key={item.caseId} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{item.complaintTitle}</p>
                    <p className="mt-1 truncate text-xs text-gray-500">{item.investigatorName || 'Awaiting assignment'} · {item.priority} priority</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getCaseBadge(item.status)}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};
export default ManagerDashboard;