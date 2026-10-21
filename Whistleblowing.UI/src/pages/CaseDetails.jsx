import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import EvidenceUploader from '../components/EvidenceUploader';
import { normalizeCase } from '../utils/cases';

const CaseDetails = () => {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [caseData, setCaseData] = useState(null);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({ findings: '', recommendation: '' });
  const [message, setMessage] = useState('');
  const [selectedInvestigatorIds, setSelectedInvestigatorIds] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await axios.get('/api/Cases', { headers: { Authorization: `Bearer ${token}` } });
        const currentCase = res.data.map(normalizeCase).find(c => c.caseId === parseInt(id));
        if (currentCase) {
          setCaseData(currentCase);
          const assignedIds = currentCase.assignedInvestigatorIds
            ? currentCase.assignedInvestigatorIds.split(',').map(value => value.trim()).filter(Boolean)
            : currentCase.assignedInvestigatorId ? [String(currentCase.assignedInvestigatorId)] : [];
          setSelectedInvestigatorIds(assignedIds);
          setSelectedStatus(currentCase.status);
          try {
            const complaintResponse = await axios.get(`/api/Complaints/${currentCase.complaintId}`, { headers: { Authorization: `Bearer ${token}` } });
            setComplaint(complaintResponse.data);
          } catch { setComplaint(null); }
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchCase();
  }, [id, token]);

  const reloadCase = async () => {
    const response = await axios.get('/api/Cases', { headers: { Authorization: `Bearer ${token}` } });
    const updated = response.data.map(normalizeCase).find(item => item.caseId === Number(id));
    if (updated) {
      setCaseData(updated);
      const assignedIds = updated.assignedInvestigatorIds
        ? updated.assignedInvestigatorIds.split(',').map(value => value.trim()).filter(Boolean)
        : updated.assignedInvestigatorId ? [String(updated.assignedInvestigatorId)] : [];
      setSelectedInvestigatorIds(assignedIds);
      setSelectedStatus(updated.status);
    }
  };

  const updateStatus = async event => {
    event.preventDefault(); setActionBusy(true); setMessage('');
    try { await axios.put(`/api/Cases/${id}/status?newStatus=${encodeURIComponent(selectedStatus)}`, {}, { headers: { Authorization: `Bearer ${token}` } }); await reloadCase(); setMessage('Case status updated. An employee notification is sent for identified reports.'); }
    catch (e) { setMessage(e.response?.data?.error || 'Could not update the case status. Please try again.'); }
    finally { setActionBusy(false); }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportSubmitting(true);
    setMessage('');
    try {
      await axios.post(`/api/Cases/${id}/report`, { caseId: parseInt(id), ...report }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Investigation report submitted successfully!');
      setReport({ findings: '', recommendation: '' });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Could not submit the report. Please try again.');
    } finally {
      setReportSubmitting(false);
    }
  };

  const downloadEvidence = async evidence => {
    try {
      const response = await axios.get(`/api/Evidence/${evidence.evidenceId}/download`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const fileUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = evidence.fileName || `evidence-${evidence.evidenceId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileUrl);
    } catch {
      setMessage('Could not download this evidence file. Please check your access and try again.');
    }
  };

  const reloadComplaint = async () => {
    if (!caseData?.complaintId) return;
    const response = await axios.get(`/api/Complaints/${caseData.complaintId}`, { headers: { Authorization: `Bearer ${token}` } });
    setComplaint(response.data);
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
      <div className="mx-auto max-w-3xl space-y-4">
        {(location.state?.caseCreated || location.state?.assignmentSaved) && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{location.state?.assignmentSaved ? 'Investigator assignments saved successfully.' : 'Case created successfully.'}</div>}
        {message && <div role={message.includes('Could not') ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm font-medium ${message.includes('Could not') ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{message}</div>}
        <button onClick={() => navigate('/manage-cases')} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Cases
        </button>

        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{caseData.complaintTitle}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${getStatusBadge(caseData.status)}`}>{String(caseData.status || 'Unknown').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, character => character.toUpperCase())}</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-700">{String(caseData.priority || 'Unspecified').toLowerCase().replace(/\b\w/g, character => character.toUpperCase())} Priority</span>
                <span className="text-gray-500">Case #{caseData.caseId}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {['ADMIN', 'MANAGER'].includes(user?.roleName) && <button type="button" onClick={() => navigate(`/case/${id}/assign-investigators`)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6" /></svg>Manage Investigators</button>}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Created</div>
              <div className="mt-1 text-sm text-gray-900">{new Date(caseData.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Last Updated</div>
              <div className="mt-1 text-sm text-gray-900">{caseData.updatedAt && new Date(caseData.updatedAt).getTime() > 0 && new Date(caseData.updatedAt).getTime() !== new Date(caseData.createdAt).getTime() ? new Date(caseData.updatedAt).toLocaleString() : '—'}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Assigned Investigator</div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {caseData.investigatorName || <span className="italic text-amber-600">Unassigned</span>}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Investigators Assigned</div>
              <div className="mt-1 text-sm text-gray-900">{selectedInvestigatorIds.length}</div>
            </div>
          </div>

          {(user?.roleName === 'INVESTIGATOR' && (caseData.assignedInvestigatorId === user.userId || selectedInvestigatorIds.includes(String(user.userId)))) && <div className="mt-5 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-5">
            <form onSubmit={updateStatus} className="flex min-w-[250px] flex-1 items-end gap-2"><label className="flex-1 text-xs font-semibold text-gray-600">Update case status<select value={selectedStatus} onChange={event => setSelectedStatus(event.target.value)} className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm">{['OPEN', 'INVESTIGATING', 'PENDING_REVIEW', 'CLOSED', 'ARCHIVED'].map(status => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}</select></label><button disabled={actionBusy || selectedStatus === caseData.status} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 disabled:opacity-50">Update status</button></form>
          </div>}
        </div>

        {complaint && <section className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-lg shadow-slate-400/10 backdrop-blur sm:p-6"><h2 className="text-sm font-semibold text-slate-700">Complaint Details</h2><div className="mt-3"><span className="rounded-md border border-slate-100 bg-white/80 px-2 py-1 text-xs font-medium text-slate-700">{complaint.category || caseData.category || 'Uncategorized'}</span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{complaint.description || 'No description provided.'}</p></section>}

        <section className="space-y-4 rounded-2xl border border-white/80 bg-white/70 p-5 shadow-lg shadow-slate-400/10 backdrop-blur sm:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold text-slate-700">Evidence ({complaint?.evidence?.length || 0})</h2><span className="text-xs text-slate-500">Upload available</span></div>{complaint?.evidence?.length ? <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white/80">{complaint.evidence.map(item => <li key={item.evidenceId} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-blue-700">{item.fileName}</p><p className="mt-0.5 text-xs text-slate-500">{new Date(item.uploadedAt).toLocaleString()}{item.uploaderName ? ` · Uploaded by ${item.uploaderName}` : ''}</p></div><button type="button" onClick={() => downloadEvidence(item)} disabled={!item.hasFile} className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:text-slate-400">{item.hasFile ? 'Download' : 'File unavailable'}</button></li>)}</ul> : <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-500">No evidence files attached.</p>}<EvidenceUploader uploadUrl={`/api/Evidence/case/${id}/upload`} token={token} onUploaded={reloadComplaint} /></section>

        {/* Submit Report */}
        {user?.roleName === 'INVESTIGATOR' && <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Submit Investigation Report</h2>
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label htmlFor="report-findings" className="block text-xs font-medium text-gray-600 mb-1">Findings</label>
              <textarea id="report-findings" placeholder="What did you find?" className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={report.findings} onChange={e => setReport(current => ({ ...current, findings: e.target.value }))} required />
            </div>
            <div>
              <label htmlFor="report-recommendation" className="block text-xs font-medium text-gray-600 mb-1">Recommendation</label>
              <textarea id="report-recommendation" placeholder="What action should be taken?" className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={report.recommendation} onChange={e => setReport(current => ({ ...current, recommendation: e.target.value }))} required />
            </div>
            <button type="submit" disabled={reportSubmitting} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:from-emerald-600 hover:to-emerald-700 transition disabled:cursor-wait disabled:opacity-60">{reportSubmitting ? 'Submitting…' : 'Submit report'}</button>
          </form>
        </div>}
      </div>
    </Layout>
  );
};
export default CaseDetails;
