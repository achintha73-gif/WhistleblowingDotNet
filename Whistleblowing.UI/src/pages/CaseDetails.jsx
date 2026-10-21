import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const CaseDetails = () => {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [report, setReport] = useState({ findings: '', recommendation: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await axios.get('/api/Cases', { headers: { Authorization: `Bearer ${token}` } });
        const currentCase = res.data.find(c => c.caseId === parseInt(id));
        if (currentCase) setCaseData(currentCase);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchCase();
  }, [id, token]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage('Please select a file first.');
    const formData = new FormData();
    formData.append('File', file);
    formData.append('Description', 'Uploaded via UI');
    try {
      await axios.post(`/api/Evidence/case/${id}/upload`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      setMessage('Evidence uploaded successfully!');
      setFile(null);
      e.target.reset();
    } catch (err) { setMessage('Error uploading evidence.'); }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/Cases/${id}/report`, { caseId: parseInt(id), ...report }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Investigation report submitted successfully!');
      setReport({ findings: '', recommendation: '' });
    } catch (err) { setMessage('Error submitting report.'); }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'INVESTIGATING': return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'PENDING_REVIEW': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CLOSED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <Layout title="Loading..."><p className="p-8">Loading case data...</p></Layout>;
  if (!caseData) return <Layout title="Error"><p className="p-8 text-red-500">Case not found.</p></Layout>;

  return (
    <Layout title={`Case #${caseData.caseId}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Cases
        </button>

        {message && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</div>}

        {/* Header Card */}
        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{caseData.complaintTitle}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${getStatusBadge(caseData.status)}`}>{caseData.status}</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-700">{caseData.priority} Priority</span>
                <span className="text-gray-500">Case #{caseData.caseId}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Assigned Investigator</div>
              <div className="mt-1 text-gray-900 font-medium">
                {caseData.investigatorName || <span className="italic text-amber-600">Unassigned</span>}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Last Updated</div>
              <div className="mt-1 text-gray-900">{new Date(caseData.updatedAt || caseData.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Upload Evidence */}
        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Upload Evidence</h2>
          <form onSubmit={handleFileUpload} className="flex items-center gap-4">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Upload</button>
          </form>
        </div>

        {/* Submit Report */}
        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Submit Investigation Report</h2>
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Findings</label>
              <textarea placeholder="What did you find?" className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={report.findings} onChange={e => setReport({...report, findings: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Recommendation</label>
              <textarea placeholder="What action should be taken?" className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={report.recommendation} onChange={e => setReport({...report, recommendation: e.target.value})} required />
            </div>
            <button type="submit" className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:from-emerald-600 hover:to-emerald-700 transition">Submit Report</button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
export default CaseDetails;