import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-violet-50 px-4 py-10">
    <section className="w-full max-w-md rounded-3xl border border-white bg-white/85 p-8 text-center shadow-xl shadow-slate-300/30">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-700">404</span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">The page may have moved or the address may be incorrect.</p>
      <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700">Back to sign in</Link>
    </section>
  </main>
);

export default NotFound;
