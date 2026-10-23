import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const priorities = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const CreateCase = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await api.get(`/api/Complaints/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (active) setComplaint(response.data);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.error || 'Could not load this concern. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id, token]);

  const createCase = async event => {
    event.preventDefault();
    if (!complaint || saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await api.post(`/api/Cases/convert/${id}?priority=${encodeURIComponent(priority)}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      navigate(`/case/${response.data.caseId}`, { replace: true, state: { caseCreated: true } });
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not create the investigation case. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Create Case">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link to={`/complaint/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"><span aria-hidden="true">â†</span> Back to Complaint</Link>
        <header className="flex items-center gap-3 px-1">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20" aria-hidden="true">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7V5a2 2 0 0 1 2-2h5l2 2h3" /></svg>
          </span>
          <div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Case from Complaint</h1><p className="mt-0.5 text-sm text-slate-600">Review the complaint and set the case priority.</p></div>
        </header>

        {loading ? <div className="rounded-2xl border border-white/80 bg-white/70 p-8 text-center text-sm text-slate-500 shadow-lg">Loading complaintâ€¦</div>
          : !complaint ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error || 'Complaint not found.'}</div>
            : <>
              <section aria-labelledby="complaint-summary-heading" className="rounded-2xl border border-white/80 bg-white/75 p-6 shadow-lg shadow-slate-400/10 backdrop-blur">
                <h2 id="complaint-summary-heading" className="mb-4 text-sm font-semibold text-slate-700">Complaint Summary</h2>
                <dl className="space-y-4">
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title</dt><dd className="mt-1 text-base font-semibold text-slate-900">{complaint.title || 'Untitled concern'}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</dt><dd className="mt-1"><span className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{complaint.category || 'Uncategorized'}</span></dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{complaint.description || 'No description provided.'}</dd></div>
                </dl>
              </section>

              <form onSubmit={createCase} className="rounded-2xl border border-white/80 bg-white/75 p-6 shadow-lg shadow-slate-400/10 backdrop-blur sm:p-7">
                <fieldset disabled={saving}>
                  <legend className="text-sm font-semibold text-slate-800">Case Priority</legend>
                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {priorities.map(option => {
                      const selected = priority === option.value;
                      return <label key={option.value} className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 px-3 text-sm font-semibold transition ${selected ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md shadow-blue-500/10' : 'border-slate-200 bg-white/70 text-slate-700 hover:border-blue-200 hover:bg-white'} ${saving ? 'cursor-not-allowed opacity-60' : ''}`}>
                        <input className="sr-only" type="radio" name="priority" value={option.value} checked={selected} onChange={() => setPriority(option.value)} />{option.label}
                      </label>;
                    })}
                  </div>
                </fieldset>
                {complaint.status === 'REJECTED' && <p className="mt-4 text-sm text-rose-700">Rejected concerns cannot be converted to cases.</p>}
                {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
                <div className="mt-5 flex flex-wrap justify-end gap-2.5 border-t border-slate-100 pt-5">
                  <Link to={`/complaint/${id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</Link>
                  <button type="submit" disabled={saving || complaint.status === 'REJECTED' || complaint.status === 'CONVERTED_TO_CASE'} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"><span aria-hidden="true">âœ“</span>{saving ? 'Creating caseâ€¦' : complaint.status === 'CONVERTED_TO_CASE' ? 'Already converted' : 'Create Case'}</button>
                </div>
              </form>
            </>}
      </div>
    </Layout>
  );
};

export default CreateCase;
