import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const [params] = useSearchParams(); const navigate = useNavigate();
  const email = params.get('email') || ''; const token = params.get('token') || '';
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async event => {
    event.preventDefault(); setError('');
    if (password !== confirm) { setError('The passwords do not match.'); return; }
    setLoading(true);
    try { await axios.post('/api/Auth/reset-password', { email, token, newPassword: password }); navigate('/', { replace: true, state: { email, passwordReset: true } }); }
    catch (e) { setError(e.response?.data?.error || 'This reset link is invalid or has expired. Request a new one.'); }
    finally { setLoading(false); }
  };
  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_10%_10%,#dfeaff_0%,transparent_40%),radial-gradient(ellipse_at_90%_15%,#f1d9ff_0%,transparent_38%),linear-gradient(145deg,#eef2ff_0%,#f5eaff_100%)] p-4"><section className="w-full max-w-md rounded-3xl border border-white bg-white/85 p-7 shadow-xl backdrop-blur"><h1 className="text-2xl font-extrabold text-slate-900">Choose a new password</h1><p className="mt-2 text-sm text-slate-600">{email ? `Resetting password for ${email}` : 'Use the secure link from your email.'}</p>{error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{!email || !token ? <div className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">This reset link is incomplete or invalid.</div> : <form onSubmit={submit} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-slate-700">New password<input required minLength="8" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /><span className="mt-1 block text-xs font-normal text-slate-500">At least 8 characters with uppercase, lowercase, a number, and a symbol.</span></label><label className="block text-sm font-semibold text-slate-700">Confirm password<input required minLength="8" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label><button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Updating…' : 'Reset password'}</button></form>}<Link to="/forgot-password" className="mt-5 block text-center text-sm font-semibold text-blue-600">Request another link</Link></section></main>;
}
