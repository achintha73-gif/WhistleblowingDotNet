import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const AnonymousTrack = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/anonymous/track/${code}`);
      navigate('/anonymous/view', { state: { complaint: res.data } });
    } catch (err) {
      setError('Invalid reference code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('code')) {
      handleTrack();
    }
  }, []);

  return (
    <div className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="mx-auto max-w-md">
        <Link to="/anonymous" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Back to anonymous portal
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Track Your Complaint</h1>
          <p className="mt-1 text-sm text-gray-600">Enter your reference code to view your anonymous complaint.</p>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
          <form onSubmit={handleTrack} className="space-y-5">
            {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Reference Code</label>
              <input type="text" maxLength="20" placeholder="WB-XXXX-XXXX" className="w-full rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2.5 font-mono text-lg text-gray-900 uppercase focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50">
              {loading ? 'Searching...' : 'Track Complaint'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AnonymousTrack;