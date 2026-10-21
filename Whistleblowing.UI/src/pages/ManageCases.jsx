import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const ManageCases = () => {
  const { token, user } = useContext(AuthContext);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axios.get('/api/Cases', { headers: { Authorization: `Bearer ${token}` } });
        setCases(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchCases();
  }, [token]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'INVESTIGATING': return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'PENDING_REVIEW': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CLOSED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'LOW': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'HIGH': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Layout title="All Cases">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Case Management</h1>
              <p className="mt-0.5 text-sm text-gray-600">Manage and track all active investigations.</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/60 px-3.5 py-2 shadow-sm">
            <span className="text-sm font-semibold text-gray-900">{cases.length} Cases</span>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading cases...</p>
        ) : cases.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white/60 p-12 text-center">
            <p className="mt-3 text-sm font-semibold text-gray-900">No cases yet</p>
            <p className="mt-1 text-xs text-gray-500">Cases will appear here when managers convert concerns.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => (
              <Link to={`/case/${c.caseId}`} key={c.caseId} className="group block rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-blue-700">{c.complaintTitle}</h3>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${getStatusBadge(c.status)}`}>{c.status}</span>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${getPriorityBadge(c.priority)}`}>{c.priority}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {c.investigatorName ? (
                        <span>Investigator: <span className="font-medium text-gray-700">{c.investigatorName}</span></span>
                      ) : (
                        <span className="italic text-amber-600">Unassigned</span>
                      )}
                      <span>Case #{c.caseId}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
export default ManageCases;