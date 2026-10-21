import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { useNavigate, Link } from 'react-router-dom';

const SubmitComplaint = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/Complaints', form, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/my-complaints');
    } catch (err) { 
      setMessage('Error submitting complaint. Please try again.'); 
    } finally { setLoading(false); }
  };

  return (
    <Layout title="Submit a Concern">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/my-complaints" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to My Concerns
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submit a Concern</h1>
            <p className="mt-0.5 text-sm text-gray-600">Report a concern about unethical, illegal, or unsafe behavior.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl sm:p-8">
          {message && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">Title <span className="text-red-500">*</span></label>
              <input type="text" maxLength="200" placeholder="Brief summary of your concern" className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">Category <span className="font-normal text-gray-400">(optional)</span></label>
              <input type="text" placeholder="e.g. Fraud, Harassment" className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">Description <span className="text-red-500">*</span></label>
              <textarea rows="8" maxLength="5000" placeholder="Describe the situation in detail. Include dates, people involved, and any relevant information." className="w-full resize-y rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            </div>
            <div className="flex justify-end gap-3 border-t border-white/60 pt-5">
              <Link to="/my-complaints" className="rounded-xl border border-white/60 bg-white/60 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-white">Cancel</Link>
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Concern'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
export default SubmitComplaint;