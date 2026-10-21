import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.roleName === 'ADMIN') navigate('/admin');
      else if (user.roleName === 'MANAGER') navigate('/manager');
      else if (user.roleName === 'INVESTIGATOR') navigate('/investigator');
      else navigate('/employee');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased flex items-center justify-center p-3 sm:p-5 lg:p-7 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="pointer-events-none fixed -right-28 -top-36 h-96 w-96 rounded-full bg-pink-200/55 blur-3xl"></div>
      <div className="pointer-events-none fixed -bottom-44 -left-36 h-[30rem] w-[30rem] rounded-full bg-blue-200/45 blur-3xl"></div>

      <div className="relative grid min-h-[min(760px,calc(100vh-2rem))] w-full max-w-[1240px] overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_80px_-35px_rgba(31,41,75,0.35)] md:grid-cols-[0.98fr_1.02fr]">
        
        {/* Left Side (Branding) */}
        <aside className="relative m-3 hidden overflow-hidden rounded-[1.65rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-9 text-white shadow-inner sm:p-10 md:flex md:flex-col md:justify-between lg:p-11">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10"></div>
          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10"></div>
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl"></div>

          <div className="relative z-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3 4.5 6v5.2c0 4.7 3.2 8.7 7.5 9.8 4.3-1.1 7.5-5.1 7.5-9.8V6L12 3Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 12 2 2 4-4"/></svg>
            </span>
            <span>
              <span className="block text-sm font-bold tracking-tight">Whistleblowing</span>
              <span className="mt-0.5 block text-[10px] text-blue-100">Management System</span>
            </span>
          </div>

          <div className="relative z-10 my-10 max-w-md">
            <h2 className="text-4xl font-bold leading-[1.12] tracking-tight lg:text-[42px]">Report with confidence.<br /><span className="mt-1 inline-block text-blue-100">Stay anonymous.</span></h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-blue-100">A secure platform to report workplace concerns — with full anonymity, tracking, and role-based investigation.</p>
            
            <ul className="mt-6 space-y-3 text-xs font-medium text-blue-50">
              <li className="flex items-center gap-2.5"><span className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/20 bg-white/10">✓</span> End-to-end secure authentication</li>
              <li className="flex items-center gap-2.5"><span className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/20 bg-white/10">✓</span> Anonymous reporting with tracking codes</li>
              <li className="flex items-center gap-2.5"><span className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/20 bg-white/10">✓</span> Evidence uploads and investigation reports</li>
            </ul>
          </div>

          <p className="relative z-10 text-[10px] text-blue-100/75">&copy; {new Date().getFullYear()} Whistleblowing Management System</p>
        </aside>

        {/* Right Side (Login Form) */}
        <section className="flex min-w-0 items-center justify-center px-6 py-10 sm:px-10 md:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-[430px]">
            <div className="mb-6 text-center">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Secure reporting portal
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">Welcome Back</h1>
              <p className="mt-1 text-sm text-slate-500">Please login to your account</p>
            </div>

            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6.75h16A1.25 1.25 0 0 1 21.25 8v8A1.25 1.25 0 0 1 20 17.25H4A1.25 1.25 0 0 1 2.75 16V8A1.25 1.25 0 0 1 4 6.75Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m3.5 7.5 8.5 6 8.5-6"/></svg></span>
                  <input type="email" placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 10V7a5 5 0 0 1 10 0v3m-11.25 0h12.5A1.75 1.75 0 0 1 20 11.75v7.5A1.75 1.75 0 0 1 18.25 21h-12.5A1.75 1.75 0 0 1 4 19.25v-7.5A1.75 1.75 0 0 1 5.75 10Z"/></svg></span>
                  <input type="password" placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span>Remember me</span></label>
              </div>

              <button type="submit" className="group w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20">
                <span className="inline-flex items-center justify-center gap-2">Sign in <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 12h14m-6-6 6 6-6 6"/></svg></span>
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-200 pt-4">
              Want to submit a complaint anonymously? <br/>
              <Link to="/anonymous" className="mt-1 inline-block font-semibold text-blue-700 hover:text-indigo-700">Click here for Anonymous Portal &rarr;</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;