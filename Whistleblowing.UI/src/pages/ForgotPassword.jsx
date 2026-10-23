import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async event => {
    event.preventDefault(); setLoading(true); setError(''); setMessage('');
    try { const response = await api.post('/api/Auth/forgot-password', { email }); setMessage(response.data?.message || 'If an account exists for that email, a reset link will be sent shortly.'); }
    catch (e) { setError(e.response?.data?.error || (e.code === 'ERR_NETWORK' ? 'The reset service could not be reached. Check that the API is running and try again.' : 'We could not process your request. Please try again later.')); }
    finally { setLoading(false); }
  };
  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_10%_10%,#dfeaff_0%,transparent_40%),radial-gradient(ellipse_at_90%_15%,#f1d9ff_0%,transparent_38%),linear-gradient(145deg,#eef2ff_0%,#f5eaff_100%)] p-4"><section className="w-full max-w-md rounded-3xl border border-white bg-white/85 p-7 shadow-xl backdrop-blur"><div className="mb-6"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16v12H4zM4 7l8 6 8-6"/></svg></span><h1 className="mt-5 text-2xl font-extrabold text-slate-900">Forgot password?</h1><p className="mt-2 text-sm leading-6 text-slate-600">Enter your account email. If it matches an account, weâ€™ll send a secure password reset link.</p></div>{error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{message && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}<form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold text-slate-700">Email address<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label><button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Sendingâ€¦' : 'Send reset link'}</button></form><Link to="/" className="mt-5 block text-center text-sm font-semibold text-blue-600 hover:text-blue-800">Back to sign in</Link></section></main>;
}
