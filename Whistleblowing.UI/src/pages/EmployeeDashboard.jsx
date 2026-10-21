import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('/api/Complaints', { headers: { Authorization: `Bearer ${token}` } });
        // අපේ API එකේ එන Complaints ටික (User ගේ ඒවා විතරක්)
        setComplaints(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [token]);

  // Stats ගණනය කිරීම
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'PENDING').length;
  const underReview = complaints.filter(c => c.status === 'UNDER_REVIEW').length;
  const converted = complaints.filter(c => c.status === 'CONVERTED_TO_CASE').length;

  // Status එකට අදාළ පාට (Tailwind Classes)
  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'UNDER_REVIEW': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'APPROVED': return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      case 'REJECTED': return 'border-rose-200 bg-rose-50 text-rose-800';
      case 'CONVERTED_TO_CASE': return 'border-violet-200 bg-violet-50 text-violet-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  return (
    <Layout title="Employee Dashboard">
      <div className="space-y-4">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name} 👋</h1>
            <p className="mt-1 text-sm text-gray-600">Track your concerns and follow their progress.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/submit-complaint" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Submit a concern
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-sky-400 to-sky-500 p-4 text-white shadow-lg shadow-sky-500/25">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-white/90">All my concerns</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/25"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></span></div>
            <div className="mt-3 text-2xl font-bold text-white">{total}</div>
            <div className="mt-3 flex justify-between rounded-lg bg-white/20 px-3 py-2 text-xs"><span>Submitted</span><span className="font-semibold">{total}</span></div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-emerald-400 to-emerald-500 p-4 text-white shadow-lg shadow-emerald-500/25">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-white/90">Awaiting review</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/25"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span></div>
            <div className="mt-3 text-2xl font-bold text-white">{pending}</div>
            <div className="mt-3 flex justify-between rounded-lg bg-white/20 px-3 py-2 text-xs"><span>Pending</span><span className="font-semibold">{pending}</span></div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-orange-400 to-orange-500 p-4 text-white shadow-lg shadow-orange-500/25">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-white/90">Under review</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/25"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12z" /><circle cx="12" cy="12" r="2.5" strokeWidth="1.8" /></svg></span></div>
            <div className="mt-3 text-2xl font-bold text-white">{underReview}</div>
            <div className="mt-3 flex justify-between rounded-lg bg-white/20 px-3 py-2 text-xs"><span>Being assessed</span><span className="font-semibold">{underReview}</span></div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-violet-400 to-violet-500 p-4 text-white shadow-lg shadow-violet-500/25">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-white/90">In investigation</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/25"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span></div>
            <div className="mt-3 text-2xl font-bold text-white">{converted}</div>
            <div className="mt-3 flex justify-between rounded-lg bg-white/20 px-3 py-2 text-xs"><span>Converted</span><span className="font-semibold">{converted}</span></div>
          </div>
        </section>

        {/* Recent Concerns List */}
        <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-lg backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100/80 px-4 py-3 sm:px-6">
            <div><h2 className="font-semibold text-gray-900">Recent concerns</h2><p className="mt-1 text-xs text-gray-500">Your latest submissions and their current status</p></div>
          </div>
          
          {loading ? (
            <p className="p-6 text-center text-sm text-gray-500">Loading...</p>
          ) : complaints.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">No concerns submitted yet</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">When you submit a concern, you can follow its progress here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100/80">
              {complaints.map((item) => (
                <div key={item.complaintId} className="group flex flex-col gap-3 px-4 py-3 transition hover:bg-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-gray-900">{item.title}</h3>
                      {item.isAnonymous && <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">Anonymous</span>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>{item.category || 'General'}</span>
                      <span>Submitted {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(item.status)}`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;