import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Layout from '../components/Layout';
import { Link, useLocation } from 'react-router-dom';
import { formatColomboDate } from '../utils/dateTime';

const roles = [{ id: 1, name: 'Admin' }, { id: 2, name: 'Manager' }, { id: 3, name: 'Investigator' }, { id: 4, name: 'Employee' }];
const roleStyles = { 1: 'border-purple-200 bg-purple-50 text-purple-700', 2: 'border-blue-200 bg-blue-50 text-blue-700', 3: 'border-amber-200 bg-amber-50 text-amber-800', 4: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
const statuses = [{ id: 0, name: 'Active' }, { id: 1, name: 'Inactive' }, { id: 2, name: 'Suspended' }];
const getStatus = value => {
  const normalized = typeof value === 'string' && Number.isNaN(Number(value)) ? value.toUpperCase() : Number(value);
  const found = statuses.find(s => s.id === normalized || s.name.toUpperCase() === normalized);
  return found ? { ...found, style: found.id === 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : found.id === 1 ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-rose-200 bg-rose-50 text-rose-700' } : { name: 'Unknown', style: 'border-slate-200 bg-slate-50 text-slate-600' };
};
const dateLabel = value => formatColomboDate(value);
const messageFrom = error => {
  const data = error.response?.data;
  return data?.error || data?.message || data?.title || (typeof data === 'string' ? data : 'The request could not be completed. Please try again.');
};

const ManageUsers = () => {
  const { token, user: currentUser } = useContext(AuthContext);
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [userRes, departmentRes] = await Promise.all([
        api.get('/api/Users', { headers }), api.get('/api/Departments', { headers }),
      ]);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setDepartments(Array.isArray(departmentRes.data) ? departmentRes.data : []);
    } catch (e) { setError(messageFrom(e)); }
    finally { setLoading(false); }
  }, [headers]);
  useEffect(() => { load(); }, [load]);

  const beginEdit = item => setEditing({
    userId: item.userId, name: item.name || '', email: item.email || '', phone: item.phone || '',
    roleId: Number(item.roleId) || 4, departmentId: item.departmentId ?? item.department?.departmentId ?? '',
    status: getStatus(item.status).id ?? 0,
  });
  const saveUser = async event => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { name: editing.name.trim(), email: editing.email.trim(), phone: editing.phone.trim() || null, roleId: Number(editing.roleId), departmentId: editing.departmentId ? Number(editing.departmentId) : null, status: Number(editing.status) };
      await api.put(`/api/Users/${editing.userId}`, payload, { headers });
      setNotice('User details updated successfully.'); setEditing(null); await load();
    } catch (e) { setError(messageFrom(e)); }
    finally { setSaving(false); }
  };
  const deleteUser = async item => {
    if (!window.confirm(`Delete ${item.name || item.email}? This action cannot be undone.`)) return;
    setError(''); setNotice('');
    try { await api.delete(`/api/Users/${item.userId}`, { headers }); setUsers(list => list.filter(user => user.userId !== item.userId)); setNotice('User deleted successfully.'); }
    catch (e) { setError(messageFrom(e)); }
  };
  const ordered = [...users].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return <Layout title="User Management">
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-600/20"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m16-10a4 4 0 1 0-2-7.5M22 21v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /></svg></span><div><h1 className="text-2xl font-extrabold tracking-tight text-slate-900">User Management</h1><p className="mt-1 text-sm text-slate-600">Manage accounts, roles, and access.</p></div></div>
        <div className="flex items-center gap-3"><span className="rounded-xl border border-white bg-white/80 px-4 py-3 text-sm font-bold text-slate-800 shadow-sm">{loading ? 'â€¦' : `${users.length} ${users.length === 1 ? 'user' : 'users'}`}</span><Link to="/manage-users/create" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">+ New User</Link></div>
      </header>
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{String(error)}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
      <section className="overflow-hidden rounded-3xl border border-white/90 bg-white/80 shadow-xl shadow-slate-900/10 backdrop-blur">
        {loading ? <div className="px-6 py-14 text-center text-sm text-slate-500">Loading usersâ€¦</div> : !ordered.length ? <div className="px-6 py-14 text-center text-sm text-slate-500">No users found.</div> : <div className="overflow-x-auto"><table className="min-w-[900px] w-full border-collapse text-left"><thead className="bg-white/70 text-[11px] font-bold uppercase tracking-[.08em] text-slate-500"><tr>{['User', 'Role', 'Department', 'Status', 'Joined', 'Actions'].map(x => <th key={x} className="px-5 py-4">{x}</th>)}</tr></thead><tbody className="divide-y divide-white/80">{ordered.map(item => { const status = getStatus(item.status); const role = roles.find(r => r.id === Number(item.roleId)); const isSelf = String(item.userId) === String(currentUser?.userId); return <tr key={item.userId} className="hover:bg-white/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">{(item.name || item.email || '?').charAt(0).toUpperCase()}</span><div><p className="text-sm font-semibold text-slate-900">{item.name || 'Unnamed user'}</p><p className="text-xs text-slate-500">{item.email}</p></div></div></td><td className="px-4 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${roleStyles[item.roleId] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>{role?.name || item.roleName || 'Unknown'}</span></td><td className="px-4 py-4 text-sm text-slate-600">{item.departmentName || item.department?.departmentName || 'â€”'}</td><td className="px-4 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.style}`}>{status.name}</span></td><td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">{dateLabel(item.createdAt)}</td><td className="px-5 py-4"><div className="flex justify-end gap-4"><button onClick={() => { setNotice(''); setError(''); beginEdit(item); }} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button><button onClick={() => deleteUser(item)} disabled={isSelf} title={isSelf ? 'You cannot delete your own account' : 'Delete user'} className="text-sm font-semibold text-rose-600 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-40">Delete</button></div></td></tr>; })}</tbody></table></div>}
      </section>
    </div>
    {editing && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onMouseDown={e => { if (e.target === e.currentTarget && !saving) setEditing(null); }}><form onSubmit={saveUser} className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div><h2 className="text-xl font-bold text-slate-900">Edit user</h2><p className="text-sm text-slate-500">Update account information and access.</p></div>{error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{String(error)}</p>}<label className="block text-sm font-medium text-slate-700">Full name<input required maxLength="150" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label><label className="block text-sm font-medium text-slate-700">Email<input required type="email" maxLength="256" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label><label className="block text-sm font-medium text-slate-700">Phone<input maxLength="20" value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Role<select value={editing.roleId} onChange={e => setEditing({ ...editing, roleId: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Status<select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">{statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label></div><label className="block text-sm font-medium text-slate-700">Department<select value={editing.departmentId} onChange={e => setEditing({ ...editing, departmentId: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"><option value="">No department</option>{departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}</select></label><div className="flex justify-end gap-3 pt-2"><button type="button" disabled={saving} onClick={() => setEditing(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button disabled={saving} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Savingâ€¦' : 'Save changes'}</button></div></form></div>}
  </Layout>;
};
export default ManageUsers;
