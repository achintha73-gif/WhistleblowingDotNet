import { useContext, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ShieldIcon = ({ className = 'h-6 w-6' }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 3 8 3v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 12 2 2 4-4"/></svg>;

const Login = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('employee');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password, rememberMe);
      const defaultRoute = user.roleName === 'ADMIN' ? '/admin'
        : user.roleName === 'MANAGER' ? '/manager'
          : user.roleName === 'INVESTIGATOR' ? '/investigator'
            : '/employee';
      navigate(location.state?.from?.pathname || defaultRoute, { replace: true });
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    'End-to-end secure authentication',
    'Anonymous reporting with tracking codes',
    'Evidence uploads and investigation reports',
    'Role-based access for all users',
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-violet-50 p-3 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_-30px_rgba(30,41,59,.28)] sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[.96fr_1.04fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-10 text-white lg:flex lg:flex-col lg:rounded-[26px] lg:m-3 xl:p-11">
          <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10"/><div className="pointer-events-none absolute -right-4 -top-16 h-64 w-64 rounded-full border border-white/10"/>
          <Link to="/anonymous" className="relative flex w-fit items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/70">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg"><ShieldIcon /></span>
            <span><strong className="block text-sm">Whistleblowing</strong><span className="block text-[11px] text-blue-100">Management System</span></span>
          </Link>
          <div className="relative mt-10 xl:mt-12">
            <h1 className="max-w-lg text-4xl font-extrabold leading-[1.12] tracking-tight xl:text-[42px]">Report with confidence.<br/>Stay anonymous.</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-blue-50">A secure platform to report workplace concerns — with full anonymity, tracking, and role-based investigation.</p>
          </div>
          <div className="relative mx-auto my-8 flex h-40 w-full max-w-xs items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-inner shadow-white/10">
            <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V7a5 5 0 0 1 10 0v3m-11 0h12v11H5V10Z"/></svg></div>
            <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg></div>
            <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5" strokeWidth="2"/></svg></div>
            <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 3h12v18H6zM9 8h6m-6 4h6m-6 4h4"/></svg></div>
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg"><ShieldIcon className="h-11 w-11"/></span>
          </div>
          <ul className="relative space-y-3 text-xs font-semibold text-blue-50">
            {benefits.map(item => <li key={item} className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-sm">✓</span>{item}</li>)}
          </ul>
          <p className="relative mt-auto pt-8 text-[10px] text-blue-100/80">© 2026 Whistleblowing Management System</p>
        </aside>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            <div className="mb-7 flex justify-center lg:hidden"><Link to="/anonymous" className="flex items-center gap-2 text-sm font-bold text-slate-800"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white"><ShieldIcon className="h-5 w-5"/></span>Whistleblowing</Link></div>
            <div className="text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/><span className="text-[10px] font-bold uppercase tracking-[.14em] text-blue-700">Secure reporting portal</span></div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">Welcome Back</h2>
              <p className="mt-1 text-sm text-slate-500">Please login to your account</p>
            </div>

            <div className="mt-6 flex rounded-xl border border-slate-200 bg-slate-100/80 p-1" role="tablist" aria-label="Sign in options">
              <button type="button" role="tab" aria-selected={activeTab === 'employee'} onClick={() => { setActiveTab('employee'); setError(''); }} className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition ${activeTab === 'employee' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/70' : 'text-slate-600 hover:text-slate-900'}`}><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21a7 7 0 0 1 14 0"/></svg>Employee</button>
              <button type="button" role="tab" aria-selected={activeTab === 'anonymous'} onClick={() => { setActiveTab('anonymous'); setError(''); }} className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition ${activeTab === 'anonymous' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/70' : 'text-slate-600 hover:text-slate-900'}`}><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V7a5 5 0 0 1 10 0v3m-11 0h12v11H5V10Z"/></svg>Anonymous</button>
            </div>

            {activeTab === 'employee' ? <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {location.state?.registrationComplete && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Your account was created. Sign in with your new credentials.</div>}
              {location.state?.passwordReset && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Your password was reset. Sign in with your new password.</div>}
              {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <div><label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-slate-700">Email</label><div className="relative"><svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16v12H4zM4 7l8 6 8-6"/></svg><input id="login-email" type="email" autoComplete="username" placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" value={email} onChange={event => setEmail(event.target.value)} required /></div></div>
              <div><label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-slate-700">Password</label><div className="relative"><svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V7a5 5 0 0 1 10 0v3m-12 0h14v11H5V10Z"/></svg><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" value={password} onChange={event => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5" strokeWidth="2"/></svg></button></div></div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5"><label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>Remember me</label><Link to="/forgot-password" className="text-right text-[11px] font-medium text-blue-600 hover:text-blue-800">Forgot password?</Link></div>
              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-violet-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-wait disabled:opacity-70">{submitting ? 'Signing in…' : 'Sign in'}{!submitting && <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-6-6 6 6-6 6"/></svg>}</button>
            </form> : <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5"><div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700"><ShieldIcon className="h-5 w-5"/></span><div><h3 className="text-sm font-bold text-blue-950">Submit anonymously</h3><p className="mt-1 text-xs leading-5 text-blue-800">Your identity stays hidden. No account is needed. Save your reference code to check updates or add evidence later.</p></div></div></div>
              <ul className="space-y-2.5 px-1 text-xs text-slate-600">{['No personal information required', 'Receive a reference code to track status', 'Add information and evidence later', 'No sign-in needed to report'].map(item => <li key={item} className="flex items-center gap-2"><span className="font-bold text-emerald-500" aria-hidden="true">✓</span>{item}</li>)}</ul>
              <Link to="/anonymous" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-violet-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V7a5 5 0 0 1 10 0v3m-12 0h14v11H5V10Z"/></svg>Continue anonymously</Link>
              <p className="text-center"><Link to="/anonymous/track" className="text-xs font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-blue-700">Already submitted? Track your concern</Link></p>
            </div>}

            <div className="mt-5 border-t border-slate-200 pt-4 text-center text-xs text-slate-600">Don&apos;t have an account? <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800">Create account</Link></div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
