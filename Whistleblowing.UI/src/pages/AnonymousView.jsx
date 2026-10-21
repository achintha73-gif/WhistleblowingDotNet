import { useLocation, useNavigate, Link } from 'react-router-dom';

const AnonymousView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const complaint = location.state?.complaint;

  if (!complaint) return (
    <div className="min-h-screen flex items-center justify-center">
      <Link to="/anonymous/track" className="text-blue-600 hover:underline">Go back to Track</Link>
    </div>
  );

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'UNDER_REVIEW': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONVERTED_TO_CASE': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Track another complaint
        </button>

        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Reference Code</p>
              <p className="mt-1 font-mono text-lg font-bold text-gray-900">{complaint.referenceCode}</p>
              <h1 className="mt-4 text-xl font-bold text-gray-900">{complaint.title}</h1>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                {complaint.category && <span>{complaint.category} · </span>}
                <span>Submitted {new Date(complaint.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${getStatusClass(complaint.status)}`}>
              {complaint.status}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Description</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{complaint.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnonymousView;