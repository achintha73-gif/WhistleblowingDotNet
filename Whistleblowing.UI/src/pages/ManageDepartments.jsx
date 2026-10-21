import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const ManageDepartments = () => {
  const { token } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/api/Departments', { headers: { Authorization: `Bearer ${token}` } });
        setDepartments(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchDepartments();
  }, [token]);

  return (
    <Layout title="Departments">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="mt-1 text-sm text-gray-600">Manage organization departments and their managers.</p>
          </div>
          {/* මේ Button එකට අදාළ API එකක් තාම හදලා නෑ */}
          <button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg opacity-50 cursor-not-allowed" disabled>
            Add department
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading departments...</p>
        ) : departments.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 p-10 text-center">
            <p className="text-gray-500">No departments yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-white/70 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Department Name</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {departments.map(dept => (
                    <tr key={dept.departmentId}>
                      <td className="px-5 py-4 font-semibold text-gray-900">{dept.departmentName}</td>
                      <td className="px-5 py-4 text-gray-500">{dept.description || "No description"}</td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-gray-400 opacity-50 cursor-not-allowed text-xs font-medium" disabled>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default ManageDepartments;