import { Link } from 'react-router-dom';

const AnonymousPortal = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md sm:h-10 sm:w-10">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xs font-bold leading-tight text-slate-900 sm:text-sm">Whistleblowing</h1>
            <p className="hidden text-[11px] text-slate-500 sm:block">Anonymous reporting portal</p>
          </div>
        </Link>
        <Link to="/" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 sm:gap-2 sm:px-4 sm:text-xs">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="sm:hidden">Sign in</span>
          <span className="hidden sm:inline">Employee sign in</span>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-3 py-4 sm:space-y-6 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-5 text-white shadow-xl sm:rounded-3xl sm:p-12">
          <div className="absolute -right-12 -top-14 h-56 w-56 rounded-full border border-white/10 sm:-right-20 sm:-top-24 sm:h-96 sm:w-96"></div>
          <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full border border-white/10 sm:-right-10 sm:-top-10 sm:h-64 sm:w-64"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 sm:mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-50">Secure Reporting Portal</span>
            </div>
            <h2 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight sm:mb-4 sm:text-4xl lg:text-5xl">Speak up with confidence.</h2>
            <p className="max-w-lg text-sm leading-relaxed text-blue-100 sm:text-base">
              Report a workplace concern without creating an account. Use your reference code later to check for updates or add evidence.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
          <Link to="/anonymous/submit" className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-50 transition group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md sm:mb-6 sm:h-12 sm:w-12">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m-7-7h14"/></svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">Submit a concern</h3>
              <p className="mb-4 max-w-xs text-sm leading-relaxed text-slate-500 sm:mb-6">Share what happened and attach images, documents, or other supporting evidence.</p>
              <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition group-hover:from-blue-700 group-hover:to-indigo-700 sm:w-auto">
                Start a report <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </Link>

          <Link to="/anonymous/track" className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-50 transition group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-md sm:mb-6 sm:h-12 sm:w-12">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10h6m-6 3h4"/></svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">Track a concern</h3>
              <p className="mb-4 max-w-xs text-sm leading-relaxed text-slate-500 sm:mb-6">Enter the reference code you saved to see the latest status or provide more information.</p>
              <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-purple-200 bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 transition group-hover:border-purple-300 group-hover:bg-purple-50 sm:w-auto">
                Check status <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
          <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">How anonymous reporting works</h3>
              <p className="text-sm text-slate-500 mt-1">A simple, private way to raise a concern and follow its progress.</p>
            </div>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              No account required
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-4">
            <div className="flex gap-3 rounded-xl bg-slate-50 p-3 sm:rounded-2xl sm:p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">1</div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Send your report</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Describe the concern and include evidence if available.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl bg-slate-50 p-3 sm:rounded-2xl sm:p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700">2</div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Save your code</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Keep the reference code shown after submission.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl bg-slate-50 p-3 sm:rounded-2xl sm:p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">3</div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Follow up securely</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Use your code to track progress or add details.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-4 pb-5 pt-2 text-center sm:p-6">
        <p className="text-xs text-slate-400">If you lose your reference code, we cannot retrieve it for you.</p>
      </footer>
    </div>
  );
};

export default AnonymousPortal;