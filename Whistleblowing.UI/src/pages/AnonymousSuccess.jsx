import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import EvidenceUploader from '../components/EvidenceUploader';

const AnonymousSuccess = () => {
  const location = useLocation();
  const code = location.state?.code || '';
  const evidenceWarning = location.state?.evidenceWarning || false;
  const remainingEvidence = location.state?.remainingEvidence || [];
  const [copyStatus, setCopyStatus] = useState('');

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/70 to-violet-50 px-4 py-8">
      <div className="w-full max-w-lg rounded-3xl border border-white bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-8">
        {!code ? <div className="py-4 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700"><svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg></span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Submission details unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">This confirmation page may have been refreshed. Your reference code is shown only once, immediately after submission.</p>
          <Link to="/anonymous" className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md">Return to portal</Link>
        </div> : <>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="mt-5 text-xl font-bold text-slate-900">Concern submitted successfully</h1>
          <p className="mt-2 text-sm text-slate-600">Save your reference code below. You will need it to check for updates.</p>
        </div>

        {code && (
          <div className="mt-6 rounded-xl border-2 border-blue-300 bg-blue-50/70 p-4">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Your reference code</p>
              <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-blue-900">{code}</p>
            </div>
            {copyStatus === 'failed' && <p role="status" className="mt-3 text-center text-xs text-amber-800">Could not copy automatically. Select and copy the code above.</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={copyCode} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-3 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {copyStatus === 'copied' ? 'Copied!' : 'Copy code'}
              </button>
              <Link to={`/anonymous/track?code=${encodeURIComponent(code)}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700">
                Track concern
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50/70 p-3">
          <p className="text-xs leading-5 text-amber-900"><strong>Keep this code safe.</strong> For privacy, it cannot be recovered if lost.</p>
        </div>

        {evidenceWarning && <div role="alert" className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3"><p className="text-xs text-amber-900"><strong>Your concern was submitted, but some evidence is still waiting to upload.</strong> Try the upload again below.</p></div>}

        {evidenceWarning && code && <div className="mt-4"><EvidenceUploader uploadUrl={`/api/Evidence/anonymous/${encodeURIComponent(code)}/upload`} initialFiles={remainingEvidence} initialDescription={location.state?.evidenceNote || ''} /></div>}

        <Link to="/anonymous" className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Back to anonymous portal
        </Link>
        </>}
      </div>
    </main>
  );
};
export default AnonymousSuccess;
