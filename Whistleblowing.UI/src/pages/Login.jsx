import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ShieldIcon = ({ className = 'h-6 w-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 12 2 2 4-4" />
  </svg>
);

const Login = () => {
  const [activeTab, setActiveTab] = useState('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(email, password);

      if (user.roleName === 'ADMIN') navigate('/admin');
      else if (user.roleName === 'MANAGER') navigate('/manager');
      else if (user.roleName === 'INVESTIGATOR') navigate('/investigator');
      else navigate('/employee');
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-2 sm:p-3">
      <div className="mx-auto grid min-h-[calc(100vh-1rem)] w-full max-w-[1440px] overflow-hidden rounded-[24px] bg-white p-2.5 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.35)] sm:min-h-[calc(100vh-1.5rem)] sm:grid-cols-2 sm:rounded-[28px] sm:p-3">
        <section className="relative flex min-h-[230px] flex-col overflow-hidden rounded-[20px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-5 py-5 text-white sm:min-h-[540px] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-16 h-56 w-56 rounded-full border border-white/10" />

          <div className="relative flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-white/15 shadow-lg shadow-indigo-950/10">
              <ShieldIcon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight">Whistleblowing</span>
              <span className="mt-1 block text-[10px] font-medium text-blue-100">Management System</span>
            </span>
          </div>

          <div className="relative mt-5 max-w-xl sm:mt-9 lg:mt-10">
            <h1 className="text-2xl font-extrabold leading-[1.12] tracking-tight sm:text-[34px] lg:text-[38px]">
              Report with<br />
              confidence.<br />
              <span className="text-blue-100">Stay anonymous.</span>
            </h1>
            <p className="mt-3 max-w-md text-xs leading-5 text-blue-100 sm:mt-5 sm:text-sm sm:leading-6">
              A secure platform to report workplace concerns — with full anonymity, tracking, and role-based investigation.
            </p>
          </div>

          <div className="relative mx-auto my-7 hidden h-36 w-full max-w-[280px] items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-inner shadow-white/10 sm:my-7 sm:flex sm:h-[140px] sm:max-w-[280px] lg:my-8 lg:h-[150px] lg:max-w-[300px]">
            <span className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-white/25 bg-white/15">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V7a5 5 0 0 1 10 0v3m-11.25 0h12.5A1.75 1.75 0 0 1 20 11.75v7.5A1.75 1.75 0 0 1 18.25 21h-12.5A1.75 1.75 0 0 1 4 19.25v-7.5A1.75 1.75 0 0 1 5.75 10Z" /></svg>
            </span>
            <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-white/25 bg-white/15">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5h8M8 9h8M8 13h5m-9-9h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" /></svg>
            </span>
            <span className="absolute bottom-4 left-4 grid h-9 w-9 place-items-center rounded-xl border border-white/25 bg-white/15">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z" /><circle cx="12" cy="12" r="2.5" strokeWidth="2" /></svg>
            </span>
            <span className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-xl border border-white/25 bg-white/15">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5h8M8 9h8M8 13h5m-9-9h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" /></svg>
            </span>
            <span className="grid h-[68px] w-[68px] place-items-center rounded-2xl bg-white/20 shadow-lg shadow-indigo-950/10">
              <ShieldIcon className="h-9 w-9" />
            </span>
          </div>

          <ul className="relative hidden space-y-3 text-xs font-semibold text-blue-50 sm:block sm:text-[11px] lg:text-xs">
            {[
              'End-to-end secure authentication',
              'Anonymous reporting with tracking codes',
              'Evidence uploads and investigation reports',
              'Role-based access for all users',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-white/25 bg-white/15 text-xs">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <p className="relative mt-auto hidden pt-7 text-[10px] text-blue-100/80 sm:block">© 2026 Whistleblowing Management System</p>
        </section>

        <section className="flex items-center justify-center px-3 py-8 sm:px-8 sm:py-12 lg:px-12">
          <div className="w-full max-w-[400px]">
            <header className="mb-5 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-700">Secure Reporting Portal</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">Welcome Back</h2>
              <p className="mt-1 text-sm text-slate-500">Please login to your account</p>
            </header>

            <div role="tablist" aria-label="Choose a reporting option" className="mb-4 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'employee'}
                onClick={() => setActiveTab('employee')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${activeTab === 'employee' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21a7 7 0 0 1 14 0" /></svg>
                Employee
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'anonymous'}
                onClick={() => setActiveTab('anonymous')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${activeTab === 'anonymous' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V7a5 5 0 0 1 10 0v3m-11.25 0h12.5A1.75 1.75 0 0 1 20 11.75v7.5A1.75 1.75 0 0 1 18.25 21h-12.5A1.75 1.75 0 0 1 4 19.25v-7.5A1.75 1.75 0 0 1 5.75 10Z" /></svg>
                Anonymous
              </button>
            </div>

            {activeTab === 'employee' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

                <div>
                  <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6.75h16A1.25 1.25 0 0 1 21.25 8v8A1.25 1.25 0 0 1 20 17.25H4A1.25 1.25 0 0 1 2.75 16V8A1.25 1.25 0 0 1 4 6.75Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m3.5 7.5 8.5 6 8.5-6" /></svg>
                    <input id="login-email" type="email" autoComplete="username" placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" value={email} onChange={(event) => setEmail(event.target.value)} required />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V7a5 5 0 0 1 10 0v3m-11.25 0h12.5A1.75 1.75 0 0 1 20 11.75v7.5A1.75 1.75 0 0 1 18.25 21h-12.5A1.75 1.75 0 0 1 4 19.25v-7.5A1.75 1.75 0 0 1 5.75 10Z" /></svg>
                    <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" value={password} onChange={(event) => setPassword(event.target.value)} required />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z" /><circle cx="12" cy="12" r="2.75" strokeWidth="2" /></svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Forgot password?</Link>
                </div>

                <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-violet-700 disabled:cursor-wait disabled:opacity-70">
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                  {!isSubmitting && <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-6-6 6 6-6 6" /></svg>}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <h3 className="text-sm font-bold text-slate-900">Submit Anonymously</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">Your identity stays private. Submit a concern without an account and use your reference code to follow up.</p>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  {['No personal information required', 'Get a reference code to track status', 'Add information and evidence later'].map((item) => (
                    <li key={item} className="flex items-center gap-2"><span className="font-bold text-emerald-500">✓</span>{item}</li>
                  ))}
                </ul>
                <Link to="/anonymous" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-violet-700">
                  Continue Anonymously <span aria-hidden="true">→</span>
                </Link>
                <div className="text-center">
                  <Link to="/anonymous/track" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Already submitted? Track your concern</Link>
                </div>
              </div>
            )}

            <div className="mt-5 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
              Don&apos;t have an account? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800">Create account</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
