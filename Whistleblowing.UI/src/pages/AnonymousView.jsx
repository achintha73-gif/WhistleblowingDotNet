import { Link, useLocation } from 'react-router-dom';
import EvidenceUploader from '../components/EvidenceUploader';
import { formatColomboDate, parseUtcDate } from '../utils/dateTime';

const statusStyles = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  UNDER_REVIEW: 'border-blue-200 bg-blue-50 text-blue-800',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-800',
  CONVERTED_TO_CASE: 'border-violet-200 bg-violet-50 text-violet-800',
};

const AnonymousView = () => {
  const location = useLocation();
  const complaint = location.state?.complaint;

  if (!complaint) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/60 to-violet-50 px-4 py-10">
        <section className="w-full max-w-md rounded-3xl border border-white bg-white/90 p-8 text-center shadow-xl shadow-slate-900/5">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" strokeWidth="2" /><path strokeLinecap="round" strokeWidth="2" d="m16 16 5 5" /></svg></span>
          <h1 className="mt-4 text-lg font-bold text-slate-900">Enter your reference code</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">For privacy, report details are shown only after verifying the reference code.</p>
          <Link to="/anonymous/track" className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md">Track a concern</Link>
        </section>
      </main>
    );
  }

  const submittedDate = parseUtcDate(complaint.submittedAt);
  const validSubmittedDate = Boolean(submittedDate);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-violet-50 px-4 py-8 text-slate-900 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/anonymous/track" className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-4">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7M3 12h18" /></svg>
          Track another concern
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-white bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur">
          <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 px-6 py-6 text-white sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-100">Anonymous report</p>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-extrabold tracking-tight sm:text-3xl">{complaint.title}</h1>
                <p className="mt-2 font-mono text-sm text-blue-100">{complaint.referenceCode}</p>
              </div>
              <span className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyles[complaint.status] || 'border-white/30 bg-white/15 text-white'}`}>{(complaint.status || 'Status unavailable').replace(/_/g, ' ')}</span>
            </div>
          </header>

          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              {complaint.category && <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700">{complaint.category}</span>}
              {validSubmittedDate && <span>Submitted {formatColomboDate(submittedDate)}</span>}
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800">Report details</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{complaint.description || 'No description available.'}</p>
            </div>

            <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-blue-700"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 3 8 3v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 12 2 2 4-4" /></svg></span>
              <p className="text-xs leading-5 text-blue-900">Keep your reference code private. You can return here to check updates or provide more evidence.</p>
            </div>
          </div>
        </section>

        <div className="mt-5"><EvidenceUploader uploadUrl={`/api/Evidence/anonymous/${encodeURIComponent(complaint.referenceCode)}/upload`} /></div>
      </div>
    </main>
  );
};

export default AnonymousView;
