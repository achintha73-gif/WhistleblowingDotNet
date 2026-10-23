import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

const normalizeCode = value => value.trim().toUpperCase();

const AnonymousTrack = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(initialCode));
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialCode) return undefined;
    const controller = new AbortController();

    const trackInitialCode = async () => {
      try {
        const res = await api.get(`/api/anonymous/track/${encodeURIComponent(normalizeCode(initialCode))}`, { signal: controller.signal });
        navigate('/anonymous/view', { state: { complaint: res.data }, replace: true });
      } catch {
        if (!controller.signal.aborted) setError('We could not find that reference code. Check it and try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    trackInitialCode();
    return () => controller.abort();
  }, [initialCode, navigate]);

  const handleTrack = async event => {
    event.preventDefault();
    const referenceCode = normalizeCode(code);
    if (!referenceCode) return;

    setCode(referenceCode);
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/anonymous/track/${encodeURIComponent(referenceCode)}`);
      navigate('/anonymous/view', { state: { complaint: res.data } });
    } catch {
      setError('We could not find that reference code. Check it and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-violet-50 px-4 py-8 text-slate-900 sm:py-12">
      <div className="mx-auto max-w-xl">
        <Link to="/anonymous" className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-4">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7M3 12h18" /></svg>
          Anonymous reporting portal
        </Link>

        <section className="mt-7 overflow-hidden rounded-3xl border border-white bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur sm:mt-9">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 px-6 py-7 text-white sm:px-8 sm:py-8">
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-white/15">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" strokeWidth="2" /><path strokeLinecap="round" strokeWidth="2" d="m16 16 5 5m-13-11h5m-5 3h3" /></svg>
            </span>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-100">Private follow-up</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Track your concern</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-blue-50">Enter the reference code you received after submitting your anonymous report.</p>
          </div>

          <form onSubmit={handleTrack} className="space-y-5 p-6 sm:p-8">
            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            <div>
              <label htmlFor="reference-code" className="mb-2 block text-sm font-semibold text-slate-800">Reference code</label>
              <input id="reference-code" name="code" type="text" autoComplete="off" autoCapitalize="characters" spellCheck="false" maxLength={20} placeholder="WB-XXXX-XXXX" value={code} onChange={event => setCode(event.target.value.toUpperCase())} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-base tracking-wider text-slate-900 outline-none transition placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
              <p className="mt-2 text-xs leading-5 text-slate-500">Your reference code is the only way to access an anonymous report.</p>
            </div>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-wait disabled:opacity-60">
              {loading ? 'Searchingâ€¦' : 'View report'}
              {!loading && <span aria-hidden="true">â†’</span>}
            </button>
            <p className="text-center text-xs text-slate-500">Need to submit a new concern? <Link to="/anonymous/submit" className="font-semibold text-blue-700 hover:text-blue-900">Start a report</Link></p>
          </form>
        </section>
      </div>
    </main>
  );
};

export default AnonymousTrack;
