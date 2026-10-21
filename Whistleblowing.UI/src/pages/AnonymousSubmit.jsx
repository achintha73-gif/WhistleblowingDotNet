import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AnonymousSubmit = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/anonymous/report', form);
      navigate('/anonymous/success', { state: { code: res.data.referenceCode } });
    } catch (err) {
      setError('Error submitting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-fuchsia-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[540px]">
        <Link to="/anonymous" className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-blue-700">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m15 18-6-6 6-6M9 12h12"/></svg>
          Back
        </Link>

        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-lg ring-4 ring-white/70">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3 4.5 6v5.2c0 4.7 3.2 8.7 7.5 9.8 4.3-1.1 7.5-5.1 7.5-9.8V6L12 3Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 12 2 2 4-4"/></svg>
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Submit a concern anonymously</h1>
            <p className="text-[11px] leading-4 text-slate-500">Share your concern securely. A reference code will be provided.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/90 bg-white/75 p-5 shadow-2xl backdrop-blur-2xl">
          {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Title <span className="text-red-500">*</span></label>
              <input type="text" maxLength="200" placeholder="Brief summary of the issue" className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Category (Optional)</label>
              <input type="text" placeholder="e.g. Fraud, Harassment" className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Description <span className="text-red-500">*</span></label>
              <textarea rows="5" maxLength="5000" placeholder="Provide details about what happened..." className="w-full resize-y rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required></textarea>
            </div>

            <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit concern anonymously'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AnonymousSubmit;