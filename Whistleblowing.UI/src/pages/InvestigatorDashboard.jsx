import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InvestigatorDashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axios.get('/api/Cases', { headers: { Authorization: `Bearer ${token}` } });
        setCases(res.data);
      } catch (err) { console.error(err); }
    };
    fetchCases();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Investigator Dashboard</h1>
        <button onClick={() => { logout(); navigate('/'); }} className="bg-red-500 px-4 py-2 rounded">Logout</button>
      </nav>
      <div className="p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">My Assigned Cases</h2>
        {cases.length === 0 ? <p>No cases assigned yet.</p> : (
          <div className="space-y-4">
            {cases.map(c => (
              <div key={c.caseId} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                <h3 className="text-lg font-bold">Case #{c.caseId}: {c.complaintTitle}</h3>
                <p className="text-gray-600">Status: <span className="font-semibold">{c.status}</span> | Priority: {c.priority}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default InvestigatorDashboard;