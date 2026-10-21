import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const Support = () => {
  const { user } = useContext(AuthContext);

  return (
    <Layout title="Help Center">
      <div className="mx-auto max-w-4xl space-y-7">
        <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/75 p-7 shadow-xl backdrop-blur-xl sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth="1.8"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.6 9a2.4 2.4 0 114.3 1.45c-.9 1.05-1.9 1.3-1.9 2.55M12 16.5h.01"/></svg>
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Help center</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">How can we help?</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Find guidance for account access, concerns, investigations, and anonymous reports.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/70 bg-white/75 p-6 shadow-lg backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m4-10a4 4 0 110-8 4 4 0 010 8zm12 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">Account and access</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">For sign-in, account, or role access issues, contact your organization’s system administrator.</p>
            <Link to="/profile" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">Open my profile &rarr;</Link>
          </article>
          <article className="rounded-2xl border border-white/70 bg-white/75 p-6 shadow-lg backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">Concerns and cases</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use the concerns or cases section to review updates. Contact the assigned manager or investigator if you need help with a specific case.</p>
            {user?.roleName === 'INVESTIGATOR' ? (
              <Link to="/manage-cases" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900">Open my cases &rarr;</Link>
            ) : (
              <Link to="/my-complaints" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900">Open concerns &rarr;</Link>
            )}
          </article>
          <article className="rounded-2xl border border-white/70 bg-white/75 p-6 shadow-lg backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4"/></svg>
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">Anonymous reports</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Keep your reference code in a safe place. You need it to check the status of your anonymous concern.</p>
            <Link to="/anonymous/track" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900">Track a concern &rarr;</Link>
          </article>
        </section>

        <section className="rounded-2xl border border-white/70 bg-white/75 p-6 shadow-lg backdrop-blur-xl sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 5a2 2 0 012-2h3.3a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.2 1.1a11 11 0 005.5 5.5l1.1-2.2a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.7 21 3 14.3 3 6V5z"/></svg>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-slate-900">Contact support</h2>
              <p className="mt-1 text-sm text-slate-600">Choose a contact option to call or email the support team.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="tel:+94112345678" className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"><span aria-hidden="true">☎</span> Call +94 11 234 5678</a>
                <a href="mailto:support@wb.local" className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"><span aria-hidden="true">✉</span> Email support@wb.local</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};
export default Support;