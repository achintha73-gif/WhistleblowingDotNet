import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const AnonymousSuccess = () => {
  const location = useLocation();
  const code = location.state?.code || '';
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-lg rounded-2xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="mt-5 text-xl font-bold text-gray-900">Complaint Submitted Successfully</h1>
          <p className="mt-2 text-sm text-gray-600">Save your reference code below to track it later.</p>
        </div>

        {code && (
          <div className="mt-6 rounded-xl border-2 border-blue-300 bg-blue-50/70 p-4">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Your Reference Code</p>
              <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-blue-900">{code}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={copyCode} className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-300 bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 transition">
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <Link to={`/anonymous/track?code=${code}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition">
                Track Complaint
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50/70 p-3">
          <p className="text-xs text-amber-800"><strong>Important:</strong> Save this code! We cannot recover it if you lose it.</p>
        </div>

        <Link to="/anonymous" className="mt-6 flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Back to anonymous portal
        </Link>
      </div>
    </div>
  );
};
export default AnonymousSuccess;