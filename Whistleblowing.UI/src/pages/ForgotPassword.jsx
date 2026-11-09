import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';
const buttonClass = 'w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-60';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState('email');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async event => {
    event.preventDefault(); setLoading(true); setError(''); setMessage('');
    try {
      const response = await api.post('/api/Auth/forgot-password', { email: email.trim() });
      setMessage(response.data?.message || 'If an active account exists, a reset code will be sent shortly.');
      setCode(''); setStep('code');
    } catch (e) { setError(e.response?.data?.error || 'Could not send a code. Please try again later.'); }
    finally { setLoading(false); }
  };

  const verifyCode = async event => {
    event.preventDefault(); setError(''); setMessage(''); setLoading(true);
    try {
      await api.post('/api/Auth/verify-reset-code', { email: email.trim(), code: code.trim().toUpperCase() });
      setStep('password');
    } catch (e) { setError(e.response?.data?.error || 'This code is invalid or has expired. Please check it or request a new code.'); }
    finally { setLoading(false); }
  };

  const reset = async event => {
    event.preventDefault(); setError(''); setMessage('');
    if (password !== confirm) { setError('The passwords do not match.'); return; }
    setLoading(true);
    try {
      await api.post('/api/Auth/reset-password', { email: email.trim(), token: code.trim().toUpperCase(), newPassword: password });
      setPassword(''); setConfirm(''); setCode(''); setStep('done');
    } catch (e) { setError(e.response?.data?.error || 'Could not reset your password. Please try again.'); }
    finally { setLoading(false); }
  };

  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_10%_10%,#dfeaff_0%,transparent_40%),radial-gradient(ellipse_at_90%_15%,#f1d9ff_0%,transparent_38%),linear-gradient(145deg,#eef2ff_0%,#f5eaff_100%)] p-4"><section className="w-full max-w-md rounded-3xl border border-white bg-white/85 p-7 shadow-xl backdrop-blur">
    <h1 className="text-2xl font-extrabold text-slate-900">{step === 'done' ? 'Password reset' : 'Forgot password?'}</h1>
    <p className="mt-2 text-sm leading-6 text-slate-600">{step === 'email' ? 'Enter the email address registered to your account. We will send a reset code if the account is active.' : step === 'code' ? 'Enter the code sent to your email. The code expires after 15 minutes.' : step === 'password' ? 'Code verified. Choose a new password.' : 'Your password has been reset. You can now sign in.'}</p>
    {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {message && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    {step === 'email' && <form onSubmit={sendCode} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-slate-700">Email address<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} /></label><button disabled={loading} className={buttonClass}>{loading ? 'Sending...' : 'Send reset code'}</button></form>}
    {step === 'code' && <><form onSubmit={verifyCode} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-slate-700">Reset code<input required autoComplete="one-time-code" maxLength={16} value={code} onChange={e => setCode(e.target.value)} className={inputClass} /></label><button disabled={loading} className={buttonClass}>{loading ? 'Checking...' : 'Next'}</button></form><button type="button" onClick={() => { setStep('email'); setError(''); setMessage(''); setCode(''); }} className="mt-4 block w-full text-center text-sm font-semibold text-blue-600">Change email or request another code</button></>}
    {step === 'password' && <form onSubmit={reset} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-slate-700">New password<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} /><span className="mt-1 block text-xs font-normal text-slate-500">At least 8 characters with uppercase, lowercase, a number, and a symbol.</span></label><label className="block text-sm font-semibold text-slate-700">Confirm password<input required minLength={8} type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputClass} /></label><button disabled={loading} className={buttonClass}>{loading ? 'Updating...' : 'Reset password'}</button></form>}
    <Link to="/" className="mt-5 block text-center text-sm font-semibold text-blue-600 hover:text-blue-800">Back to sign in</Link>
  </section></main>;
}
