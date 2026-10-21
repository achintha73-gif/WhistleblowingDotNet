import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/Auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/', { replace: true, state: { registrationComplete: true, email: form.email.trim() } });
    } catch (err) {
      const responseError = err.response?.data?.error;
      const validationError = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null;
      setError(responseError || validationError || 'We could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-md" aria-hidden="true">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </span>
          <span className="text-xl font-bold text-blue-700">Whistleblowing</span>
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700">Employee account</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">Register to submit concerns and follow their progress.</p>
          </div>

          {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
              <input id="register-name" name="name" type="text" autoComplete="name" maxLength={120} minLength={2} required value={form.name} onChange={handleChange} placeholder="Your full name" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            </div>
            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
              <input id="register-email" name="email" type="email" autoComplete="email" maxLength={254} required value={form.email} onChange={handleChange} placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            </div>
            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input id="register-password" name="password" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={handleChange} placeholder="Create a strong password" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
              <p className="mt-1.5 text-xs text-slate-500">At least 8 characters, including upper and lowercase letters, a number, and a symbol.</p>
            </div>
            <div>
              <label htmlFor="register-confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
              <input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required value={form.confirmPassword} onChange={handleChange} placeholder="Enter your password again" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            </div>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-wait disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </section>

        <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/" className="font-semibold text-blue-700 hover:text-blue-800">Sign in</Link></p>
      </div>
    </main>
  );
};

export default Register;
