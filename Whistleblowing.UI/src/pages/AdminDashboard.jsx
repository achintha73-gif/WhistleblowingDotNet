import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalComplaints: 0, totalCases: 0, totalUsers: 0, totalEvidenceFiles: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy data for chart 
  const chartData = [
    { name: 'Jan', complaints: 4 },
    { name: 'Feb', complaints: 7 },
    { name: 'Mar', complaints: 5 },
    { name: 'Apr', complaints: 12 },
    { name: 'May', complaints: 9 },
    { name: 'Jun', complaints: 15 },
    { name: 'Jul', complaints: 18 },
  ];

  const pieData = [
    { name: 'Pending', value: 5, color: '#f59e0b' },
    { name: 'Under Review', value: 3, color: '#3b82f6' },
    { name: 'Converted', value: 7, color: '#8b5cf6' },
    { name: 'Closed', value: 2, color: '#10b981' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          axios.get('/api/Admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/Complaints', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStats(statsRes.data);
        
        setRecentComplaints(complaintsRes.data.slice(0, 5));
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <Layout title="Dashboard"><p className="p-8 text-center text-gray-500">Loading dashboard data...</p></Layout>;

  return (
    <Layout title="Admin Dashboard">
      <div className="min-w-0 space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Welcome back, {user?.name}</h1>
            <p className="mt-1 text-sm text-gray-600">Here&apos;s what&apos;s happening with your system today.</p>
          </div>
          <Link to="/manage-users" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 sm:w-auto">
            Manage Users
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-3.5 text-white shadow-lg shadow-blue-500/30 sm:p-5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-blue-100 sm:text-sm">Total Complaints</span>
              <svg className="h-5 w-5 shrink-0 text-blue-200 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl">{stats.totalComplaints}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 p-3.5 text-white shadow-lg shadow-violet-500/30 sm:p-5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-violet-100 sm:text-sm">Active Cases</span>
              <svg className="h-5 w-5 shrink-0 text-violet-200 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </div>
            <div className="mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl">{stats.totalCases}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3.5 text-white shadow-lg shadow-emerald-500/30 sm:p-5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-emerald-100 sm:text-sm">Total Users</span>
              <svg className="h-5 w-5 shrink-0 text-emerald-200 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <div className="mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl">{stats.totalUsers}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-3.5 text-white shadow-lg shadow-orange-500/30 sm:p-5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-orange-100 sm:text-sm">Evidence Files</span>
              <svg className="h-5 w-5 shrink-0 text-orange-200 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl">{stats.totalEvidenceFiles}</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Line Chart */}
          <div className="min-w-0 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg backdrop-blur-xl sm:p-6 lg:col-span-2">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Complaints Trend</h2>
              <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500 sm:text-xs">Last 7 Months</span>
            </div>
            <div className="h-56 w-full min-w-0 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 8, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={8} />
                  <YAxis width={30} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="complaints" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="min-w-0 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg backdrop-blur-xl sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Case Distribution</h2>
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

        {/* Recent Activity List */}
        <div className="min-w-0 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Recent Complaints</h2>
            <Link to="/manage-cases" className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800 sm:text-sm">View All</Link>
          </div>
          <div className="space-y-3 sm:hidden">
            {recentComplaints.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">No recent complaints.</p>
            ) : (
              recentComplaints.map((complaint) => (
                <article key={complaint.complaintId} className="rounded-xl border border-gray-100 bg-white p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 break-words text-sm font-semibold text-gray-900">{complaint.title}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${
                      complaint.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      complaint.status === 'CONVERTED_TO_CASE' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-500">
                    <span className="truncate">{complaint.category || 'General'}</span>
                    <time className="shrink-0">{new Date(complaint.createdAt).toLocaleDateString()}</time>
                  </div>
                </article>
              ))
            )}
          </div>
          <div className="hidden overflow-x-auto sm:block">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentComplaints.length === 0 ? (
                  <tr><td colSpan="4" className="py-4 text-center text-gray-500">No recent complaints.</td></tr>
                ) : (
                  recentComplaints.map(c => (
                    <tr key={c.complaintId} className="hover:bg-gray-50/50">
                      <td className="max-w-xs truncate py-3 px-4 font-medium text-gray-900">{c.title}</td>
                      <td className="py-3 px-4 text-gray-600">{c.category || 'General'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          c.status === 'CONVERTED_TO_CASE' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AdminDashboard;