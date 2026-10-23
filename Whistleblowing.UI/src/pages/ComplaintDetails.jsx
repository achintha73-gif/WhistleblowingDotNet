import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import EvidenceUploader from '../components/EvidenceUploader';
import EvidenceList from '../components/EvidenceList';
import InvestigatorMultiSelect from '../components/InvestigatorMultiSelect';
import { normalizeCases } from '../utils/cases';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investigators, setInvestigators] = useState([]);
  const [selectedInvestigatorIds, setSelectedInvestigatorIds] = useState([]);
  const [caseId, setCaseId] = useState(null);
  const [caseLookupError, setCaseLookupError] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState(false);
  const [evidenceError, setEvidenceError] = useState('');
  const staffCanReview = ['ADMIN', 'MANAGER'].includes(user?.roleName);
  const requestConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    let active = true;
    const fetchComplaint = async () => {
      try {
        const res = await api.get(`/api/Complaints/${id}`, requestConfig);
        if (active) setComplaint(res.data);
        if (active && staffCanReview) {
          const [caseResult, investigatorResult] = await Promise.allSettled([
            api.get('/api/Cases', requestConfig), api.get('/api/Cases/investigators', requestConfig),
          ]);
          if (!active) return;
          if (caseResult.status === 'fulfilled') {
            const relatedCase = normalizeCases(caseResult.value.data).find(item => Number(item.complaintId) === Number(id));
            if (relatedCase) {
              setCaseId(relatedCase.caseId);
              const assignedIds = relatedCase.assignedInvestigatorIds
                ? relatedCase.assignedInvestigatorIds.split(',').map(value => value.trim()).filter(Boolean)
                : relatedCase.assignedInvestigatorId ? [String(relatedCase.assignedInvestigatorId)] : [];
              setSelectedInvestigatorIds(assignedIds);
            }
          } else { setCaseLookupError(true); setActionError(true); setActionMessage('Could not check for an existing case. Refresh this page before continuing.'); }
          if (investigatorResult.status === 'fulfilled') setInvestigators(Array.isArray(investigatorResult.value.data) ? investigatorResult.value.data : []);
          else { setActionError(true); setActionMessage('Could not load investigators. Try refreshing the page.'); }
        }
      } catch (err) { if (active) { setActionError(true); setActionMessage(err.response?.data?.error || 'Could not load this concern. Please try again.'); } }
      finally { if (active) setLoading(false); }
    };
    fetchComplaint();
    return () => { active = false; };
  }, [id, token, staffCanReview]);

  const updateConcernStatus = async status => {
    setActionBusy(true); setActionError(false); setActionMessage('');
    try {
      await api.put(`/api/Complaints/${id}/status?status=${encodeURIComponent(status)}`, {}, requestConfig);
      setComplaint(current => ({ ...current, status }));
      setActionMessage(`Concern marked ${status.replace(/_/g, ' ').toLowerCase()}. The employee has been notified when applicable.`);
    } catch (error) {
      setActionError(true);
      setActionMessage(error.response?.data?.error || 'Could not update concern status. Please try again.');
    } finally { setActionBusy(false); }
  };

  const assignInvestigators = async event => {
    event.preventDefault();
    if (!selectedInvestigatorIds.length) { setActionError(true); setActionMessage('Select at least one investigator before assigning this concern.'); return; }
    if (!caseId) { setActionError(true); setActionMessage('Create the investigation case before assigning investigators.'); return; }
    setActionBusy(true); setActionError(false); setActionMessage('');
    try {
      await api.post(`/api/Cases/${caseId}/assignments`, { investigatorIds: selectedInvestigatorIds.map(Number) }, requestConfig);
      const assignedNames = investigators.filter(item => selectedInvestigatorIds.includes(String(item.userId))).map(item => item.name).join(', ');
      setActionMessage(`Case #${caseId} is assigned to ${assignedNames || 'the selected investigators'}. Notifications have been sent.`);
    } catch (error) {
      setActionError(true);
      setActionMessage(error.response?.data?.error || 'Could not assign investigators. Please try again.');
    } finally { setActionBusy(false); }
  };

  const reloadComplaint = async () => {
    const response = await api.get(`/api/Complaints/${id}`, requestConfig);
    setComplaint(response.data);
  };

  const downloadEvidence = async evidence => {
    setEvidenceError('');
    try {
      const response = await api.get(`/api/Evidence/${evidence.evidenceId}/download`, { ...requestConfig, responseType: 'blob' });
      const fileUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = evidence.fileName || `evidence-${evidence.evidenceId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileUrl);
    } catch {
      setEvidenceError('Could not download this evidence file. Check your access and try again.');
    }
  };

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
  if (!complaint) return <Layout title="Error"><div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{actionMessage || 'Concern not found.'}</div></Layout>;

  return (
    <Layout title="Concern Detail">
      <div className="max-w-3xl mx-auto space-y-6">
        {location.state?.caseCreated && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Investigation case created. Select one or more investigators below to assign it.</div>}
        {location.state?.evidenceWarning && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Your concern was submitted, but one or more evidence files could not be uploaded. Add them below or contact support with this concern number.</div>}
        {staffCanReview && <section className="relative z-30 space-y-3 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-400/10 backdrop-blur sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => updateConcernStatus('UNDER_REVIEW')} disabled={actionBusy || complaint.status === 'CONVERTED_TO_CASE' || complaint.status === 'REJECTED'} className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50">Mark under review</button>
            <button type="button" onClick={() => updateConcernStatus('APPROVED')} disabled={actionBusy || complaint.status === 'CONVERTED_TO_CASE' || complaint.status === 'REJECTED'} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">Approve concern</button>
            <button type="button" onClick={() => updateConcernStatus('REJECTED')} disabled={actionBusy || complaint.status === 'CONVERTED_TO_CASE' || complaint.status === 'REJECTED'} className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50">Reject</button>
            {caseId && <button type="button" onClick={() => navigate(`/case/${caseId}`)} className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100">Open case #{caseId}</button>}
            {!caseId && complaint.status !== 'CONVERTED_TO_CASE' && complaint.status !== 'REJECTED' && <button type="button" onClick={() => navigate(`/complaint/${id}/create-case`)} disabled={actionBusy || caseLookupError} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Create investigation case</button>}
          </div>
          {caseId && complaint.status !== 'REJECTED' && <form onSubmit={assignInvestigators} className="grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="text-xs font-semibold text-slate-600">Assign investigators<InvestigatorMultiSelect investigators={investigators} selectedIds={selectedInvestigatorIds} onChange={setSelectedInvestigatorIds} disabled={actionBusy} /></label>
            <button type="submit" disabled={actionBusy || !investigators.length || !selectedInvestigatorIds.length} className="min-h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{actionBusy ? 'Assigningâ€¦' : 'Assign investigators'}</button>
          </form>}
          {actionMessage && <p role={actionError ? 'alert' : 'status'} className={`rounded-xl px-3.5 py-2.5 text-xs ${actionError ? 'border border-rose-200 bg-rose-50 text-rose-700' : 'border border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{actionMessage}</p>}
        </section>}
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
                {complaint.isAnonymous ? <span className="italic text-gray-500">Anonymous</span> : <div className="font-medium">{complaint.authorName || complaint.authorEmail || 'Employee'}</div>}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Submitted at</div>
              <div className="mt-1 text-gray-900">{new Date(complaint.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
        <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-400/10 backdrop-blur sm:p-5" aria-labelledby="attached-evidence-heading">
          <div className="flex items-center justify-between gap-3"><h2 id="attached-evidence-heading" className="text-sm font-semibold text-slate-800">Attached Evidence ({complaint.evidence?.length || 0})</h2><span className="text-[10px] text-slate-500">Supporting files for this concern</span></div>
          <EvidenceList items={complaint.evidence || []} token={token} />
        </section>
        <EvidenceUploader uploadUrl={`/api/Evidence/complaint/${id}/upload`} token={token} onUploaded={reloadComplaint} initialFiles={location.state?.remainingEvidence || []} initialDescription={location.state?.evidenceNote || ''} />
        <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-400/10 backdrop-blur sm:p-5" aria-labelledby="additional-information-heading">
          <div className="flex items-center justify-between gap-3"><h2 id="additional-information-heading" className="text-sm font-semibold text-slate-800">Additional Information ({complaint.additionalInformation?.length || 0})</h2></div>
          {complaint.additionalInformation?.length ? <ul className="mt-3 space-y-3">{complaint.additionalInformation.map(item => <li key={item.infoId} className="rounded-xl border border-slate-100 bg-white/80 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-sm font-semibold text-slate-800">{item.title}</h3><span className="text-[10px] text-slate-500">{new Date(item.submittedAt).toLocaleString()}</span></div><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{item.description}</p>{item.submittedByName && <p className="mt-2 text-[10px] text-slate-500">Submitted by {item.submittedByName}</p>}</li>)}</ul>
            : <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white/50 px-4 py-7 text-center text-xs text-slate-500">No additional information submitted.</div>}
        </section>
      </div>
    </Layout>
  );
};
export default ComplaintDetails;
