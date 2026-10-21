import { Link } from 'react-router-dom';

const ShieldIcon = ({ className = 'h-6 w-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 3 8 3v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 12 2 2 4-4"/></svg>
);

const AnonymousPortal = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-violet-50 flex flex-col text-slate-900">
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link to="/" className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20"><ShieldIcon /></span>
        <span><span className="block text-sm font-bold">Whistleblowing</span><span className="block text-[11px] text-slate-500">Anonymous reporting portal</span></span>
      </Link>
      <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21a7 7 0 0 1 14 0"/></svg>Employee sign in
      </Link>
    </header>

    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-5 sm:px-8">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-900/15">
        <div className="pointer-events-none absolute -right-8 -top-32 h-80 w-80 rounded-full border border-white/10"/><div className="pointer-events-none absolute right-7 -top-20 h-64 w-64 rounded-full border border-white/10"/>
        <div className="relative px-7 py-9 sm:px-9 sm:py-10 lg:px-10 lg:py-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300"/><span className="text-[10px] font-bold uppercase tracking-[.14em] text-blue-50">Secure reporting portal</span></div>
          <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Speak up with confidence.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">Report a workplace concern without creating an account. Use your reference code later to check for updates or add evidence.</p>
        </div>
      </section>

      <section aria-label="Anonymous reporting actions" className="mt-6 grid gap-5 md:grid-cols-2">
        <Link to="/anonymous/submit" className="group relative min-h-56 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:p-6">
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-blue-100/70 transition group-hover:scale-110"/><div className="relative">
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeWidth="2" d="M12 5v14m-7-7h14"/></svg></span>
            <h2 className="text-lg font-bold">Submit a concern</h2><p className="mt-1 max-w-sm text-xs leading-5 text-slate-600 sm:text-sm">Share what happened and attach images, documents, or other supporting evidence.</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm">Start a report <span aria-hidden="true">→</span></span>
          </div>
        </Link>
        <Link to="/anonymous/track" className="group relative min-h-56 overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-fuchsia-50/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500 sm:p-6">
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-violet-100/70 transition group-hover:scale-110"/><div className="relative">
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg shadow-purple-500/20"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" strokeWidth="2"/><path strokeLinecap="round" strokeWidth="2" d="m16 16 5 5m-13-11h5m-5 3h3"/></svg></span>
            <h2 className="text-lg font-bold">Track a concern</h2><p className="mt-1 max-w-sm text-xs leading-5 text-slate-600 sm:text-sm">Enter the reference code you saved to see the latest status or provide more information.</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-xs font-semibold text-violet-700 transition group-hover:bg-violet-50">Check status <span aria-hidden="true">→</span></span>
          </div>
        </Link>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6" aria-labelledby="steps-title">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="steps-title" className="text-sm font-bold sm:text-base">How anonymous reporting works</h2><p className="mt-1 text-xs text-slate-500">A simple, private way to raise a concern and follow its progress.</p></div><span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700">No account required</span></div>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ['1', 'Send your report', 'Describe the concern and include evidence if available.', 'bg-blue-100 text-blue-700'],
            ['2', 'Save your code', 'Keep the reference code shown after submission.', 'bg-violet-100 text-violet-700'],
            ['3', 'Follow up securely', 'Use your code to track progress or add details.', 'bg-emerald-100 text-emerald-700'],
          ].map(([number, title, description, color]) => <li key={number} className="flex gap-3 rounded-xl bg-slate-50/90 p-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${color}`}>{number}</span><span><strong className="block text-xs font-semibold">{title}</strong><span className="mt-1 block text-[11px] leading-4 text-slate-500">{description}</span></span></li>)}
        </ol>
      </section>
    </main>
    <footer className="px-4 pb-5 text-center text-[10px] text-slate-500">If you lose your reference code, we cannot retrieve it for you.</footer>
  </div>
);

export default AnonymousPortal;
