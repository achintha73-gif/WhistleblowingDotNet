import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/Admin/stats', { headers: { Authorization: `Bearer ${token}` } });
        setStats(res.data);
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, [token]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">Logout</button>
      </nav>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">System Overview</h2>
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg shadow-md text-white bg-blue-500"><h3 className="text-3xl font-bold">{stats.totalComplaints}</h3><p className="text-sm mt-2">Complaints</p></div>
            <div className="p-6 rounded-lg shadow-md text-white bg-green-500"><h3 className="text-3xl font-bold">{stats.totalCases}</h3><p className="text-sm mt-2">Cases</p></div>
            <div className="p-6 rounded-lg shadow-md text-white bg-purple-500"><h3 className="text-3xl font-bold">{stats.totalUsers}</h3><p className="text-sm mt-2">Users</p></div>
            <div className="p-6 rounded-lg shadow-md text-white bg-orange-500"><h3 className="text-3xl font-bold">{stats.totalEvidenceFiles}</h3><p className="text-sm mt-2">Evidence</p></div>
          </div>
        ) : <p>Loading...</p>}
      </div>
    </div>
  );
};
export default AdminDashboard;