import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import { normalizeCase } from '../utils/cases';

const AssignInvestigators = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [investigators, setInvestigators] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [casesResponse, investigatorsResponse] = await Promise.all([
        api.get('/api/Cases', config),
        api.get('/api/Cases/investigators', config),
      ]);
      const found = normalizeCase((Array.isArray(casesResponse.data) ? casesResponse.data : []).find(item => Number(item.caseId) === Number(id)) || {});
      if (!found.caseId) throw new Error('Case not found or unavailable.');
      const availableInvestigators = Array.isArray(investigatorsResponse.data) ? investigatorsResponse.data : [];
      const assignedIds = found.assignedInvestigatorIds
        ? found.assignedInvestigatorIds.split(',').map(value => value.trim()).filter(Boolean)
        : found.assignedInvestigatorId ? [String(found.assignedInvestigatorId)] : [];
      setCaseData(found);
      setInvestigators(availableInvestigators);
      setSelectedIds(assignedIds);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Could not load the case and investigator list.');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggle = userId => {
    const value = String(userId);
    setSelectedIds(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  };

  const saveAssignments = async event => {
    event.preventDefault();
    if (!selectedIds.length) {
      setError('Select at least one investigator to assign this case.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post(`/api/Cases/${id}/assignments`, { investigatorIds: selectedIds.map(Number) }, { headers: { Authorization: `Bearer ${token}` } });
      navigate(`/case/${id}`, { replace: true, state: { assignmentSaved: true } });
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not save investigator assignments. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Assign Investigators">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link to={`/case/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"><span aria-hidden="true">â†</span> Back to Case</Link>
        <header className="flex items-center gap-4 px-1">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25" aria-hidden="true">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6" /></svg>
          </span>
          <div className="min-w-0"><h1 className="text-2xl font-bold tracking-tight text-slate-900">Assign Investigators</h1><p className="mt-1 truncate text-sm text-slate-600">{caseData?.complaintTitle || 'Select team members for this case.'}</p></div>
        </header>

        {loading ? <div className="rounded-2xl border border-white/80 bg-white/70 p-8 text-center text-sm text-slate-500 shadow-lg">Loading investigatorsâ€¦</div>
          : error && !caseData ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error} <button type="button" onClick={loadData} className="ml-2 font-semibold underline">Try again</button></div>
            : <form onSubmit={saveAssignments}>
              <section aria-labelledby="investigator-list-title" className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-lg shadow-slate-400/10 backdrop-blur sm:p-7">
                <h2 id="investigator-list-title" className="text-base font-semibold text-slate-700">Select Investigators ({investigators.length} available)</h2>
                {investigators.length ? <ul className="mt-4 divide-y divide-slate-100">
                  {investigators.map(person => {
                    const checked = selectedIds.includes(String(person.userId));
                    return <li key={person.userId}>
                      <label className="flex cursor-pointer items-center gap-4 rounded-xl px-2 py-3.5 transition hover:bg-white/80 sm:px-3">
                        <input type="checkbox" checked={checked} onChange={() => toggle(person.userId)} disabled={saving} className="h-5 w-5 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-bold text-white shadow-sm">{(person.name || person.email || '?').charAt(0).toUpperCase()}</span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{person.name || 'Investigator'}</span><span className="mt-0.5 block truncate text-sm text-slate-500">{person.email}</span></span>
                        {person.departmentName && <span className="hidden shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:inline-flex">{person.departmentName}</span>}
                      </label>
                    </li>;
                  })}
                </ul> : <p className="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-7 text-center text-sm text-slate-500">No active investigators available.</p>}
              </section>

              {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <Link to={`/case/${id}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/80 bg-white/70 px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white">Cancel</Link>
                <button type="submit" disabled={saving || !investigators.length} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"><span aria-hidden="true">âœ“</span>{saving ? 'Savingâ€¦' : 'Save Assignments'}</button>
              </div>
            </form>}
      </div>
    </Layout>
  );
};

export default AssignInvestigators;
