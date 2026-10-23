import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Layout from '../components/Layout';
import { useNavigate, Link } from 'react-router-dom';

const CreateUser = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', roleName: 'USER' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [investigators, setInvestigators] = useState([
    { name: '', email: '', password: '' },
    { name: '', email: '', password: '' },
  ]);

  const addInvestigatorRow = () => setInvestigators(rows => [...rows, { name: '', email: '', password: '' }]);
  const updateInvestigator = (index, field, value) => setInvestigators(rows => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));

  const handleBatchSubmit = async event => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    let createdCount = 0;
    try {
      for (let index = 0; index < investigators.length; index += 1) {
        const person = investigators[index];
        try {
          await api.post('/api/Users', { ...person, roleName: 'INVESTIGATOR' }, { headers: { Authorization: `Bearer ${token}` } });
          createdCount += 1;
        } catch (err) {
          const reason = err.response?.data?.error || err.response?.data?.message || 'Could not create this account.';
          setInvestigators(rows => rows.slice(index));
          setMessage(`${createdCount} investigator${createdCount === 1 ? '' : 's'} added. The remaining accounts are still in the form. Please fix the first row and submit again: ${reason}`);
          return;
        }
      }
      navigate('/manage-users', { state: { notice: `${createdCount} investigators added successfully.` } });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/Users', form, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/manage-users');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error creating user.');
    } finally { setLoading(false); }
  };

  return (
    <Layout title="New User">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link to="/manage-users" className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-blue-600">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Users
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
              <p className="mt-0.5 text-sm text-gray-600">Add a new user to the system with a specific role.</p>
            </div>
          </div>
          <button type="button" onClick={() => { setBatchMode(value => !value); setMessage(''); }} className="rounded-xl border border-blue-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-white">{batchMode ? 'Create one user' : 'Add multiple investigators'}</button>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-lg backdrop-blur-xl">
          {message && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</div>}

          {batchMode ? <form onSubmit={handleBatchSubmit} className="space-y-5">
            <div><h2 className="text-lg font-bold text-slate-900">Add investigators</h2><p className="mt-1 text-sm text-slate-600">Create several investigator accounts in one step. Add more rows as needed.</p></div>
            <div className="space-y-4">
              {investigators.map((person, index) => <fieldset key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-white/70 p-4 sm:grid-cols-2">
                <legend className="px-1 text-xs font-semibold text-slate-600">Investigator {index + 1}</legend>
                <label className="text-xs font-semibold text-slate-700">Full name<input value={person.name} onChange={event => updateInvestigator(index, 'name', event.target.value)} required maxLength={120} autoComplete="name" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" /></label>
                <label className="text-xs font-semibold text-slate-700">Email<input type="email" value={person.email} onChange={event => updateInvestigator(index, 'email', event.target.value)} required maxLength={254} autoComplete="email" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" /></label>
                <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Temporary password<input type="password" value={person.password} onChange={event => updateInvestigator(index, 'password', event.target.value)} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" /></label>
                {investigators.length > 2 && <button type="button" onClick={() => setInvestigators(rows => rows.filter((_, rowIndex) => rowIndex !== index))} className="justify-self-start text-xs font-semibold text-rose-600 hover:text-rose-800">Remove investigator</button>}
              </fieldset>)}
            </div>
            <button type="button" onClick={addInvestigatorRow} className="rounded-xl border border-dashed border-blue-300 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">+ Add another investigator</button>
            <div className="flex justify-end gap-3 border-t border-white/60 pt-5">
              <Link to="/manage-users" className="rounded-xl border border-white/60 bg-white/60 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-white">Cancel</Link>
              <button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-50">{loading ? 'Adding investigatorsâ€¦' : `Add ${investigators.length} investigators`}</button>
            </div>
          </form> :
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">Full Name</label>
              <input type="text" placeholder="John Doe" className="w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">Email</label>
              <input type="email" placeholder="user@wb.local" className="w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">Password</label>
              <input type="password" placeholder="Min 8 chars (upper + lower + digit + symbol)" className="w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">Role</label>
              <select className="w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.roleName} onChange={e => setForm({...form, roleName: e.target.value})}>
                <option value="USER">Employee (USER)</option>
                <option value="INVESTIGATOR">Investigator</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/60 pt-5">
              <Link to="/manage-users" className="rounded-xl border border-white/60 bg-white/60 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-white">Cancel</Link>
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50">
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
          }
        </div>
      </div>
    </Layout>
  );
};
export default CreateUser;
