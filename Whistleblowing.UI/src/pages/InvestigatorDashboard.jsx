import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const InvestigatorDashboard = () => {
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

  const active = cases.length;
  const open = cases.filter(c => c.status === 'OPEN').length;
  const investigating = cases.filter(c => c.status === 'INVESTIGATING').length;
  const pendingReview = cases.filter(c => c.status === 'PENDING_REVIEW').length;
  const highPriority = cases.filter(c => c.priority === 'HIGH' || c.priority === 'CRITICAL').length;

  const pieData = [
    { name: 'Open', value: open || 0, color: '#0ea5e9' },
    { name: 'Investigating', value: investigating || 0, color: '#8b5cf6' },
    { name: 'Review', value: pendingReview || 0, color: '#f59e0b' },
  ];

  const barData = [
    { name: 'Open', count: open },
    { name: 'Investigating', count: investigating },
    { name: 'Review', count: pendingReview },
  ];
  const hasWorkProgress = barData.some((item) => item.count > 0);
  const hasCaseDistribution = pieData.some((item) => item.value > 0);

  if (loading) return <Layout title="Dashboard"><p className="p-8 text-center text-gray-500">Loading...</p></Layout>;

  return (
    <Layout title="Investigator Dashboard">
      <div className="min-w-0 space-y-4 sm:space-y-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Welcome back, {user?.name} 👋</h1>
            <p className="mt-1 text-sm text-gray-600">Your investigation queue and next steps.</p>
          </div>
          <Link to="/manage-cases" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 sm:w-auto">
            View My Cases
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 p-3.5 text-white shadow-lg shadow-sky-500/30 sm:p-5">
            <div className="text-xs font-medium text-sky-100 sm:text-sm">Active Assignments</div>
            <div className="mt-2 text-2xl font-bold sm:text-3xl">{active}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 p-3.5 text-white shadow-lg shadow-emerald-500/30 sm:p-5">
            <div className="text-xs font-medium text-emerald-100 sm:text-sm">Investigating</div>
            <div className="mt-2 text-2xl font-bold sm:text-3xl">{investigating}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 p-3.5 text-white shadow-lg shadow-orange-500/30 sm:p-5">
            <div className="text-xs font-medium text-orange-100 sm:text-sm">High Priority</div>
            <div className="mt-2 text-2xl font-bold sm:text-3xl">{highPriority}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-violet-400 to-violet-500 p-3.5 text-white shadow-lg shadow-violet-500/30 sm:p-5">
            <div className="text-xs font-medium text-violet-100 sm:text-sm">Awaiting Review</div>
            <div className="mt-2 text-2xl font-bold sm:text-3xl">{pendingReview}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg backdrop-blur-xl sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Work Progress</h2>
            <div className="h-56 w-full min-w-0 sm:h-64">
              {hasWorkProgress ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 8, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={8} />
                    <YAxis width={30} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid h-full place-items-center text-center text-sm text-gray-500">No case activity to show yet.</div>
              )}
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg backdrop-blur-xl sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Case Distribution</h2>
            <div className="flex h-52 w-full min-w-0 justify-center sm:h-56">
              {hasCaseDistribution ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid h-full place-items-center text-center text-sm text-gray-500">Case distribution will appear here.</div>
              )}
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
export default InvestigatorDashboard;