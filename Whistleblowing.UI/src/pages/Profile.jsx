import { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const Profile = () => {
  const { user, token, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notice, setNotice] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false); const [changing, setChanging] = useState(false);
  const saveProfile = async event => {
    event.preventDefault(); setError(''); setNotice(''); setSaving(true);
    try { const response = await axios.put('/api/Auth/profile', { name: profile.name.trim(), phone: profile.phone.trim() || null }, { headers: { Authorization: `Bearer ${token}` } }); updateUser({ ...user, ...response.data }); setNotice('Profile saved successfully.'); }
    catch (e) { setError(e.response?.data?.error || 'Could not save your profile. Please try again.'); }
    finally { setSaving(false); }
  };
  const changePassword = async event => {
    event.preventDefault(); setError(''); setNotice('');
    if (password.newPassword !== password.confirmPassword) { setError('The new passwords do not match.'); return; }
    setChanging(true);
    try { const response = await axios.put('/api/Auth/password', { currentPassword: password.currentPassword, newPassword: password.newPassword }, { headers: { Authorization: `Bearer ${token}` } }); setNotice(response.data?.message || 'Password updated.'); setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    catch (e) { setError(e.response?.data?.error || 'Could not update your password. Please try again.'); }
    finally { setChanging(false); }
  };
  const field = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';
  return <Layout title="My Profile"><div className="mx-auto max-w-6xl space-y-6">
    <header><h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Profile</h1><p className="mt-1 text-sm text-slate-600">Update your contact details and password.</p></header>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}{notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
    <div className="grid gap-4 lg:grid-cols-[minmax(250px,.7fr)_minmax(0,1.45fr)]">
      <section className="min-h-[300px] rounded-3xl border border-white/90 bg-white/75 p-8 shadow-lg shadow-slate-400/10"><div className="flex h-full flex-col items-center justify-start pt-1 text-center"><span className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">{(profile.name || user?.name || '?').charAt(0).toUpperCase()}</span><h2 className="mt-4 text-lg font-bold text-slate-900">{profile.name || user?.name}</h2><p className="mt-1 break-all text-sm text-slate-600">{user?.email}</p><span className="mt-3 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{(user?.status || 'ACTIVE').toLowerCase()}</span></div></section>
      <section className="rounded-3xl border border-white/90 bg-white/75 p-6 shadow-lg shadow-slate-400/10 sm:p-7"><h2 className="text-base font-semibold text-slate-900">Account details</h2><form onSubmit={saveProfile} className="mt-4 space-y-4"><label className="block text-sm font-medium text-slate-700">Full name<input required minLength="2" maxLength="150" autoComplete="name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className={field} /></label><label className="block text-sm font-medium text-slate-700">Email<input type="email" value={user?.email || ''} readOnly className={`${field} bg-slate-50 text-slate-500`} /><span className="mt-1 block text-xs text-slate-400">Contact an administrator to change your email.</span></label><label className="block text-sm font-medium text-slate-700">Phone<input type="tel" maxLength="20" autoComplete="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className={field} /></label><div className="flex justify-end border-t border-slate-100 pt-4"><button disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save profile'}</button></div></form></section>
    </div>
    <section className="rounded-3xl border border-white/90 bg-white/75 p-6 shadow-lg shadow-slate-400/10 sm:p-7"><h2 className="text-base font-semibold text-slate-900">Change password</h2><p className="mt-1 text-sm text-slate-500">Enter your current password to choose a new one.</p><form onSubmit={changePassword} className="mt-4 grid gap-4 md:grid-cols-3"><label className="block text-sm font-medium text-slate-700">Current password<input type="password" required autoComplete="current-password" value={password.currentPassword} onChange={e => setPassword({ ...password, currentPassword: e.target.value })} className={field} /></label><label className="block text-sm font-medium text-slate-700">New password<input type="password" required minLength="8" autoComplete="new-password" value={password.newPassword} onChange={e => setPassword({ ...password, newPassword: e.target.value })} className={field} /><span className="mt-1 block text-xs text-slate-400">Use uppercase, lowercase, a number, and a symbol.</span></label><label className="block text-sm font-medium text-slate-700">Confirm new password<input type="password" required minLength="8" autoComplete="new-password" value={password.confirmPassword} onChange={e => setPassword({ ...password, confirmPassword: e.target.value })} className={field} /></label><div className="flex justify-end md:col-span-3"><button disabled={changing} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{changing ? 'Updating…' : 'Update password'}</button></div></form></section>
  </div></Layout>;
};
export default Profile;
