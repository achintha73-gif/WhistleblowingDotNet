import { Link } from 'react-router-dom';

const AnonymousPortal = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-violet-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full bg-fuchsia-200/40 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl"></div>

      <main className="relative mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/25">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3 4.5 6v5.2c0 4.7 3.2 8.7 7.5 9.8 4.3-1.1 7.5-5.1 7.5-9.8V6L12 3Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 12 2 2 4-4"/></svg>
            </span>
            <span><span className="block text-sm font-bold text-slate-900">Whistleblowing</span><span className="block text-[11px] text-slate-500">Anonymous reporting portal</span></span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-blue-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 19v-1.5a4.5 4.5 0 0 0-4.5-4.5h-1A4.5 4.5 0 0 0 6 17.5V19m9-11a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>
            Employee sign in
          </Link>
        </header>

        <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 shadow-[0_28px_90px_-40px_rgba(47,59,110,0.32)] backdrop-blur-xl">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 px-6 py-8 text-white sm:px-9 sm:py-10">
            <div className="pointer-events-none absolute -right-10 -top-28 h-72 w-72 rounded-full border border-white/10"></div>
            <div className="pointer-events-none absolute -right-2 -top-20 h-56 w-56 rounded-full border border-white/10"></div>
            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-50"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300"></span> Secure reporting portal</span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Speak up with confidence.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">Report a workplace concern without creating an account. Use your reference code later to check for updates or add evidence.</p>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <Link to="/anonymous/submit" className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-blue-100/70 transition group-hover:scale-125"></div>
                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 5v14m-7-7h14"/></svg></span>
                  <h2 className="mt-5 text-lg font-bold text-slate-900">Submit a concern</h2>
                  <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-600">Share what happened and attach images, documents, or other supporting evidence.</p>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md">Start a report &rarr;</span>
                </div>
              </Link>

              <Link to="/anonymous/track" className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl">
                <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-violet-100/70 transition group-hover:scale-125"></div>
                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/25"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 10h6m-6 3h4"/></svg></span>
                  <h2 className="mt-5 text-lg font-bold text-slate-900">Track a concern</h2>
                  <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-600">Enter the reference code you saved to see the latest status or provide more information.</p>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-xs font-semibold text-violet-700 transition">Check status &rarr;</span>
                </div>
              </Link>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white/75 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><h2 className="text-sm font-bold text-slate-900">How anonymous reporting works</h2><p className="mt-1 text-[11px] text-slate-500">A simple, private way to raise a concern and follow its progress.</p></div>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">No account required</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="flex gap-3 rounded-xl bg-slate-50/80 p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[11px] font-bold text-blue-700">1</span><div><p className="text-xs font-semibold text-slate-800">Send your report</p><p className="mt-1 text-[10px] leading-4 text-slate-500">Describe the concern and include evidence if available.</p></div></div>
                <div className="flex gap-3 rounded-xl bg-slate-50/80 p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-[11px] font-bold text-violet-700">2</span><div><p className="text-xs font-semibold text-slate-800">Save your code</p><p className="mt-1 text-[10px] leading-4 text-slate-500">Keep the reference code shown after submission.</p></div></div>
                <div className="flex gap-3 rounded-xl bg-slate-50/80 p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[11px] font-bold text-emerald-700">3</span><div><p className="text-xs font-semibold text-slate-800">Follow up securely</p><p className="mt-1 text-[10px] leading-4 text-slate-500">Use your code to track progress or add details.</p></div></div>
              </div>
            </section>
          </div>
        </section>
        
        <p className="mt-5 text-center text-[10px] text-slate-500">If you lose your reference code, we cannot retrieve it for you.</p>
      </main>
    </div>
  );
};
export default AnonymousPortal;