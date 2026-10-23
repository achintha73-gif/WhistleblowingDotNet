import { useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const emptyForm = { key: '', value: '', description: '' };
const errorMessage = error => {
  if (!error.response) return 'The API server is unreachable. Start the API on http://localhost:5064 and try again.';
  const data = error.response.data;
  if (data?.error || data?.title) return data.error || data.title;
  if (error.response.status === 404) return 'The Settings API is missing from the running server. Rebuild and restart the API.';
  if (error.response.status >= 500) return 'The API could not read settings from SQL Server. Start the SQLEXPRESS2025 database and check the API connection string.';
  return `The API returned an error (${error.response.status}). Please try again.`;
};

const displayValue = value => {
  if (value === 'true') return 'True';
  if (value === 'false') return 'False';
  if (/^[A-Z_]+$/.test(value)) return value.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
  return value;
};

const Settings = () => {
  const { token } = useContext(AuthContext);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await api.get('/api/Settings', { headers: { Authorization: `Bearer ${token}` } });
      setSettings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const openCreate = () => {
    setForm(emptyForm);
    setActionError('');
    setFormOpen(true);
  };

  const openEdit = setting => {
    setForm({ key: setting.key, value: setting.value, description: setting.description || '', settingId: setting.settingId });
    setActionError('');
    setFormOpen(true);
  };

  const saveSetting = async event => {
    event.preventDefault();
    setSaving(true);
    setActionError('');
    const payload = { key: form.key.trim(), value: form.value.trim(), description: form.description.trim() || null };
    try {
      if (form.settingId) {
        await api.put(`/api/Settings/${form.settingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setSettings(current => current.map(item => item.settingId === form.settingId ? { ...item, ...payload } : item).sort((a, b) => a.key.localeCompare(b.key)));
      } else {
        const response = await api.post('/api/Settings', payload, { headers: { Authorization: `Bearer ${token}` } });
        setSettings(current => [...current, response.data].sort((a, b) => a.key.localeCompare(b.key)));
      }
      setFormOpen(false);
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const deleteSetting = async setting => {
    if (!window.confirm(`Delete the â€œ${setting.key}â€ setting? This cannot be undone.`)) return;
    setDeletingId(setting.settingId);
    setActionError('');
    try {
      await api.delete(`/api/Settings/${setting.settingId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSettings(current => current.filter(item => item.settingId !== setting.settingId));
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout title="System Settings">
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-2xl font-extrabold tracking-tight text-slate-900">System settings</h1><p className="mt-1 text-sm text-slate-600">Manage application-wide configuration values.</p></div>
          <button type="button" onClick={openCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"><span aria-hidden="true">+</span> Add setting</button>
        </header>

        {actionError && !formOpen && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div>}
        {loadError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{loadError}</span><button type="button" onClick={loadSettings} className="font-semibold underline underline-offset-2">Try again</button></div>}

        <section aria-label="System setting values" className="overflow-hidden rounded-3xl border border-white/90 bg-white/80 shadow-xl shadow-slate-900/10 backdrop-blur">
          {loading ? <div className="px-6 py-14 text-center text-sm text-slate-500">Loading settingsâ€¦</div>
            : loadError ? <div className="px-6 py-14 text-center text-sm text-slate-500">Settings could not be loaded.</div>
              : settings.length === 0 ? <div className="px-6 py-14 text-center"><p className="text-sm font-semibold text-slate-800">No settings yet</p><p className="mt-1 text-xs text-slate-500">Add a setting to configure the system.</p></div>
                : <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full border-collapse text-left">
                    <thead className="bg-white/70 text-[11px] font-bold uppercase tracking-[.08em] text-slate-500"><tr><th scope="col" className="px-6 py-4">Key</th><th scope="col" className="px-4 py-4">Value</th><th scope="col" className="px-4 py-4">Description</th><th scope="col" className="px-6 py-4 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-white/80">{settings.map(setting => <tr key={setting.settingId} className="transition hover:bg-white/70">
                      <td className="px-6 py-5 font-mono text-sm font-bold text-slate-800">{setting.key}</td>
                      <td className="px-4 py-5 text-sm text-slate-700">{displayValue(setting.value)}</td>
                      <td className="max-w-[600px] px-4 py-5 text-sm leading-6 text-slate-500">{setting.description || 'â€”'}</td>
                      <td className="px-6 py-5"><div className="flex justify-end gap-4"><button type="button" onClick={() => openEdit(setting)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button><button type="button" disabled={deletingId === setting.settingId} onClick={() => deleteSetting(setting)} className="text-sm font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50">{deletingId === setting.settingId ? 'Deletingâ€¦' : 'Delete'}</button></div></td>
                    </tr>)}</tbody>
                  </table>
                </div>}
        </section>
      </div>

      {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !saving) setFormOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="setting-form-title" className="w-full max-w-lg rounded-3xl border border-white bg-white p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">System configuration</p><h2 id="setting-form-title" className="mt-1 text-xl font-extrabold text-slate-900">{form.settingId ? 'Edit setting' : 'Add setting'}</h2></div><button type="button" disabled={saving} onClick={() => setFormOpen(false)} aria-label="Close dialog" className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700">Ã—</button></div>
          {actionError && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div>}
          <form onSubmit={saveSetting} className="mt-5 space-y-4">
            <div><label htmlFor="setting-key" className="mb-1.5 block text-sm font-semibold text-slate-700">Key</label><input id="setting-key" value={form.key} onChange={event => setForm(current => ({ ...current, key: event.target.value }))} required minLength={2} maxLength={100} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="OrganizationName" /></div>
            <div><label htmlFor="setting-value" className="mb-1.5 block text-sm font-semibold text-slate-700">Value</label><input id="setting-value" value={form.value} onChange={event => setForm(current => ({ ...current, value: event.target.value }))} required maxLength={4000} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></div>
            <div><label htmlFor="setting-description" className="mb-1.5 block text-sm font-semibold text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span></label><textarea id="setting-description" rows={3} maxLength={2000} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" disabled={saving} onClick={() => setFormOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Savingâ€¦' : form.settingId ? 'Save changes' : 'Add setting'}</button></div>
          </form>
        </section>
      </div>}
    </Layout>
  );
};

export default Settings;
