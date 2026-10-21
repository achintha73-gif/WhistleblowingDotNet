import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/Admin/stats', { headers: { Authorization: `Bearer ${token}` } });
        setStats(res.data);
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, [token]);

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name} 👋</h1>
            <p className="mt-1 text-sm text-gray-600">System overview and administration.</p>
          </div>
          <Link to="/manage-users" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700">
            Manage Users
          </Link>
        </div>

        {/* Stat Cards (මේක තමයි ඔයාගේ Design එකේ තියෙන්නේ) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 p-4 text-white shadow-lg shadow-sky-500/25">
            <div className="text-sm font-medium text-white/95">Total Complaints</div>
            <div className="mt-2 text-2xl font-bold">{stats?.totalComplaints ?? 0}</div>
            <div className="mt-3 rounded-lg bg-white/20 px-3 py-2 text-xs flex justify-between"><span>All time</span><span className="font-semibold">{stats?.totalComplaints ?? 0}</span></div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 p-4 text-white shadow-lg shadow-emerald-500/25">
            <div className="text-sm font-medium text-white/95">Total Cases</div>
            <div className="mt-2 text-2xl font-bold">{stats?.totalCases ?? 0}</div>
            <div className="mt-3 rounded-lg bg-white/20 px-3 py-2 text-xs flex justify-between"><span>Active cases</span><span className="font-semibold">{stats?.totalCases ?? 0}</span></div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 p-4 text-white shadow-lg shadow-orange-500/25">
            <div className="text-sm font-medium text-white/95">Total Users</div>
            <div className="mt-2 text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
            <div className="mt-3 rounded-lg bg-white/20 px-3 py-2 text-xs flex justify-between"><span>Registered</span><span className="font-semibold">{stats?.totalUsers ?? 0}</span></div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-violet-400 to-violet-500 p-4 text-white shadow-lg shadow-violet-500/25">
            <div className="text-sm font-medium text-white/95">Evidence Files</div>
            <div className="mt-2 text-2xl font-bold">{stats?.totalEvidenceFiles ?? 0}</div>
            <div className="mt-3 rounded-lg bg-white/20 px-3 py-2 text-xs flex justify-between"><span>Uploaded</span><span className="font-semibold">{stats?.totalEvidenceFiles ?? 0}</span></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link to="/manage-users" className="group flex items-start gap-3 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">User Management</h3>
              <p className="mt-0.5 text-xs text-gray-500">Manage accounts, roles, status</p>
            </div>
          </Link>
          <Link to="/employee" className="group flex items-start gap-3 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-violet-700">All Concerns</h3>
              <p className="mt-0.5 text-xs text-gray-500">Review and convert to cases</p>
            </div>
          </Link>
          <Link to="/investigator" className="group flex items-start gap-3 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700">All Cases</h3>
              <p className="mt-0.5 text-xs text-gray-500">Assign and monitor investigations</p>
            </div>
          </Link>
        </div>

      </div>
    </Layout>
  );
};

export default AdminDashboard;