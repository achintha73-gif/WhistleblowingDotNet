import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { formatColomboDate } from '../utils/dateTime';

const MyComplaints = () => {
  const { token, user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isStaffView = ['ADMIN', 'MANAGER'].includes(user?.roleName);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('/api/Complaints', { headers: { Authorization: `Bearer ${token}` } });
        setComplaints(res.data);
      } catch { setError(true); } finally { setLoading(false); }
    };
    fetchComplaints();
  }, [token]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'CONVERTED_TO_CASE': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout title={isStaffView ? 'All Concerns' : 'My Complaints'} wide={isStaffView}>
      <div className={`space-y-5 ${isStaffView ? '' : 'mx-auto max-w-4xl'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{isStaffView ? 'All Concerns' : 'My Complaints'}</h1>
              <p className="mt-0.5 text-sm text-gray-600">{isStaffView ? 'All concerns submitted in the system.' : 'Track the status of concerns you have submitted.'}</p>
            </div>
          </div>
          {isStaffView && <div className="rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm">{complaints.length} {complaints.length === 1 ? 'concern' : 'concerns'}</div>}
          {!isStaffView && <Link to="/submit-complaint" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            New Concern
          </Link>}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">We could not load concerns. Refresh to try again.</div>
        ) : complaints.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white/60 p-12 text-center backdrop-blur-sm">
            <p className="mt-3 text-sm font-semibold text-gray-900">No concerns yet</p>
            <p className="mt-1 text-xs text-gray-500">{isStaffView ? 'Submitted reports will appear here.' : 'Submit your first concern to get started.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map(c => (
              <Link key={c.complaintId} to={`/complaint/${c.complaintId}`} className="group block rounded-2xl border border-white/75 bg-white/70 p-4 shadow-[0_8px_16px_rgba(30,41,59,.10)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/85 hover:shadow-lg focus-visible:outline-offset-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-blue-700">{c.title}</h3>
                      {c.isAnonymous && <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">Anonymous</span>}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {c.category && <span className="rounded-md bg-white/70 px-2 py-0.5 border border-gray-200">{c.category}</span>}
                      {isStaffView && !c.isAnonymous && <span>By {c.authorName || 'Employee'}</span>}
                      <span>Submitted {formatColomboDate(c.createdAt)}</span>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">Concern #{c.complaintId}</div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(c.status)}`}>{c.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
export default MyComplaints;
