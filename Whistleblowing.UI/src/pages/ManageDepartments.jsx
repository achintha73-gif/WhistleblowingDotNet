import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Layout from '../components/Layout';

const messageFrom = error => {
  const data = error.response?.data;
  return data?.error || data?.message || data?.title || (typeof data === 'string' ? data : 'The request could not be completed. Please try again.');
};
const ManageDepartments = () => {
  const { token } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]); const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [form, setForm] = useState(null); const [saving, setSaving] = useState(false);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [departmentRes, userRes] = await Promise.all([api.get('/api/Departments', { headers }), api.get('/api/Users', { headers })]);
      setDepartments(Array.isArray(departmentRes.data) ? departmentRes.data : []);
      setManagers((Array.isArray(userRes.data) ? userRes.data : []).filter(user => Number(user.roleId) === 2 || user.roleName === 'MANAGER'));
    } catch (e) { setError(messageFrom(e)); } finally { setLoading(false); }
  }, [headers]);
  useEffect(() => { load(); }, [load]);
  const start = dept => setForm(dept ? { departmentId: dept.departmentId, departmentName: dept.departmentName || '', description: dept.description || '', managerId: dept.managerId ?? '' } : { departmentName: '', description: '', managerId: '' });
  const save = async event => {
    event.preventDefault(); setSaving(true); setError('');
    const payload = { departmentName: form.departmentName.trim(), description: form.description.trim() || null, managerId: form.managerId ? Number(form.managerId) : null };
    try {
      if (form.departmentId) await api.put(`/api/Departments/${form.departmentId}`, payload, { headers }); else await api.post('/api/Departments', payload, { headers });
      setForm(null); setNotice(form.departmentId ? 'Department updated successfully.' : 'Department created successfully.'); await load();
    } catch (e) { setError(messageFrom(e)); } finally { setSaving(false); }
  };
  const remove = async dept => {
    if (!window.confirm(`Delete ${dept.departmentName}? Users assigned to it will no longer have a department.`)) return;
    setError(''); setNotice('');
    try { await api.delete(`/api/Departments/${dept.departmentId}`, { headers }); setDepartments(list => list.filter(item => item.departmentId !== dept.departmentId)); setNotice('Department deleted successfully.'); }
    catch (e) { setError(messageFrom(e)); }
  };
  return <Layout title="Departments"><div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Departments</h1><p className="mt-1 text-sm text-slate-600">Manage organization departments and their managers.</p></div><button onClick={() => { setError(''); setNotice(''); start(); }} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700">Add department</button></header>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{String(error)}</div>}{notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
    <section className="overflow-hidden rounded-2xl border border-white/90 bg-white/75 shadow-[0_14px_28px_rgba(30,41,59,.10)] backdrop-blur">
      {loading ? <p className="px-6 py-14 text-center text-sm text-slate-500">Loading departmentsâ€¦</p> : !departments.length ? <div className="px-6 py-14 text-center"><p className="text-sm font-semibold text-slate-800">No departments yet</p><p className="mt-1 text-sm text-slate-500">Add a department to get started.</p></div> : <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="border-b border-slate-200 bg-white/60 text-xs font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Department</th><th className="px-6 py-4">Manager</th><th className="px-6 py-4">Members</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100/80">{departments.map(dept => <tr key={dept.departmentId} className="transition hover:bg-white/70">
            <td className="px-6 py-4"><p className="text-sm font-semibold text-slate-900">{dept.departmentName}</p><p className="mt-1 text-sm text-slate-500">{dept.description || `${dept.departmentName} department`}</p></td>
            <td className="px-6 py-4 text-sm text-slate-700">{dept.managerName || 'Unassigned'}</td>
            <td className="px-6 py-4 text-sm text-slate-700">{dept.userCount ?? 0}</td>
            <td className="px-6 py-4"><div className="flex justify-end gap-4"><button onClick={() => { setError(''); setNotice(''); start(dept); }} className="text-sm font-semibold text-blue-600 transition hover:text-blue-800">Edit</button><button onClick={() => remove(dept)} className="text-sm font-semibold text-rose-600 transition hover:text-rose-800">Delete</button></div></td>
          </tr>)}</tbody>
        </table>
      </div>}
    </section>
  </div>{form && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onMouseDown={e => { if (e.target === e.currentTarget && !saving) setForm(null); }}><form onSubmit={save} className="w-full max-w-lg space-y-4 rounded-3xl bg-white p-6 shadow-2xl"><div><h2 className="text-xl font-bold text-slate-900">{form.departmentId ? 'Edit department' : 'Add department'}</h2><p className="text-sm text-slate-500">Set the department details and optional manager.</p></div>{error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{String(error)}</p>}<label className="block text-sm font-medium text-slate-700">Department name<input required maxLength="120" value={form.departmentName} onChange={e => setForm({ ...form, departmentName: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label><label className="block text-sm font-medium text-slate-700">Description<textarea maxLength="500" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label><label className="block text-sm font-medium text-slate-700">Department manager<select value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"><option value="">No manager</option>{managers.map(user => <option key={user.userId} value={user.userId}>{user.name} ({user.email})</option>)}</select></label><div className="flex justify-end gap-3 pt-2"><button type="button" disabled={saving} onClick={() => setForm(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">Cancel</button><button disabled={saving} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Savingâ€¦' : 'Save department'}</button></div></form></div>}</Layout>;
};
export default ManageDepartments;
