import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const EmployeeDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/api/Complaints', { headers: { Authorization: `Bearer ${token}` } });
        setComplaints(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchComplaints();
  }, [token]);

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'PENDING').length;
  const underReview = complaints.filter(c => c.status === 'UNDER_REVIEW').length;
  const converted = complaints.filter(c => c.status === 'CONVERTED_TO_CASE').length;

  const pieData = [
    { name: 'Pending', value: pending || 0, color: '#f59e0b' },
    { name: 'Under Review', value: underReview || 0, color: '#3b82f6' },
    { name: 'In Investigation', value: converted || 0, color: '#8b5cf6' },
  ];

  if (loading) return <Layout title="Dashboard"><p className="p-8 text-center text-gray-500">Loading...</p></Layout>;

  return (
    <Layout title="Employee Dashboard">
      <div className="min-w-0 space-y-4 sm:space-y-6">

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Welcome back, {user?.name} 👋</h1>
            <p className="mt-1 text-sm text-gray-600">Track your concerns and follow their progress.</p>
          </div>
          <Link to="/submit-complaint" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 sm:w-auto">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Submit a concern
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 p-3.5 text-white shadow-lg shadow-sky-500/30 sm:p-5">
            <div className="text-xs font-medium text-sky-100 sm:text-sm">All my concerns</div>
            <div className="mt-2 text-2xl font-bold sm:text-3xl">{total}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 p-3.5 text-white shadow-lg shadow-emerald-500/30 sm:p-5">
            <div className="text-xs font-medium text-emerald-100 sm:text-sm">Awaiting review</div>
            <div className="mt-2 text-2xl font-bold sm:text-3xl">{pending}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 p-3.5 text-white shadow-lg shadow-orange-500/30 sm:p-5">
            <div className="text-xs font-medium text-orange-100 sm:text-sm">Under review</div>
            <div className="mt-2 text-2xl font-bold sm:text-3xl">{underReview}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-violet-400 to-violet-500 p-3.5 text-white shadow-lg shadow-violet-500/30 sm:p-5">
            <div className="text-xs font-medium text-violet-100 sm:text-sm">In investigation</div>
            <div className="mt-2 text-2xl font-bold sm:text-3xl">{converted}</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-3">

          {/* Recent Concerns List */}
          <div className="min-w-0 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg backdrop-blur-xl sm:p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Recent Concerns</h2>
              <Link to="/my-complaints" className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800 sm:text-sm">View All</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {complaints.length === 0 ? (
                <p className="py-5 text-center text-sm text-gray-500">You haven&apos;t submitted any concerns yet.</p>
              ) : complaints.slice(0, 5).map(c => (
                <div key={c.complaintId} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-gray-900">{c.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium sm:px-2.5 sm:text-xs ${
                    c.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="min-w-0 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg backdrop-blur-xl sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Concern Outcomes</h2>
            <div className="flex h-52 w-full min-w-0 justify-center sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    <span className="text-gray-600">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
};
export default EmployeeDashboard;