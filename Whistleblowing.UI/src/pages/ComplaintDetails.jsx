import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await axios.get(`/api/Complaints/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setComplaint(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchComplaint();
  }, [id, token]);

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

  if (loading) return <Layout title="Loading..."><p className="p-8">Loading...</p></Layout>;
  if (!complaint) return <Layout title="Error"><p className="p-8 text-red-500">Complaint not found.</p></Layout>;

  return (
    <Layout title="Concern Detail">
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to My Concerns
        </button>

        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{complaint.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {complaint.category && <span className="rounded-md bg-white/70 px-2 py-0.5 font-medium border border-gray-200">{complaint.category}</span>}
                {complaint.isAnonymous && <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">Anonymous</span>}
                <span>Concern #{complaint.complaintId}</span>
              </div>
            </div>
            <div className="shrink-0">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getStatusBadge(complaint.status)}`}>{complaint.status}</span>
            </div>
          </div>

          <div className="mt-6 border-t border-white/60 pt-6">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">Description</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{complaint.description}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/60 pt-6 text-sm sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Submitted by</div>
              <div className="mt-1 text-gray-900">
                {complaint.isAnonymous ? <span className="italic text-gray-500">Anonymous</span> : <div className="font-medium">{complaint.userName}</div>}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Submitted at</div>
              <div className="mt-1 text-gray-900">{new Date(complaint.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default ComplaintDetails;