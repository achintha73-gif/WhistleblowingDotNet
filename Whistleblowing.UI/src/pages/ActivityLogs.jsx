import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Layout from '../components/Layout';
import { formatColomboDateTime } from '../utils/dateTime';

const ActivityLogs = () => {
  const { token } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // à¶¸à·š Endpoint à¶‘à¶š à¶­à·à¶¸ Backend à¶‘à¶šà·š à¶±à·‘. à¶’à¶­à·Š Error à¶‘à¶šà¶šà·Š à¶‘à¶±à·Šà¶±à·š à¶±à·à¶­à·”à·€ à·„à·ƒà·”à¶»à·”à·€à¶œà¶±à·Šà¶±à¶¸à·Š
        const res = await api.get('/api/Admin/logs', { headers: { Authorization: `Bearer ${token}` } });
        setLogs(res.data);
      } catch {
        setError(true);
      } finally { 
        setLoading(false); 
      }
    };
    fetchLogs();
  }, [token]);

  return (
    <Layout title="Activity Logs">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-1 text-sm text-gray-600">Recent recorded system activity (up to 200 entries).</p>
        </div>

        {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Activity logs are unavailable right now.</div>}

        {loading ? (
          <p className="text-center text-gray-500">Loading logs...</p>
        ) : logs.length === 0 && !error ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 p-12 text-center">
            <p className="text-sm text-gray-500">No activity has been recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-white/70 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">When</th>
                    <th className="px-5 py-3">Event</th>
                    <th className="px-5 py-3">Details</th>
                    <th className="px-5 py-3">Record</th>
                    <th className="px-5 py-3">Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">{formatColomboDateTime(log.createdAt)}</td>
                      <td className="px-5 py-4 font-medium text-gray-900">{log.eventType}</td>
                      <td className="px-5 py-4 text-gray-700">{log.description}</td>
                      <td className="px-5 py-4 text-gray-600">{log.entityType || 'â€”'}</td>
                      <td className="px-5 py-4 text-gray-600">{log.actorName || 'System'}</td>
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
export default ActivityLogs;
