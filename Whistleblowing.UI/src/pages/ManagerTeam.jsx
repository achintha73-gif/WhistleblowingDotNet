import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { formatColomboDate } from '../utils/dateTime';

const dateLabel = value => formatColomboDate(value);

const roleColors = {
  INVESTIGATOR: 'border-amber-200 bg-amber-100 text-amber-800',
  MANAGER: 'border-blue-200 bg-blue-100 text-blue-800',
  USER: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  EMPLOYEE: 'border-emerald-200 bg-emerald-100 text-emerald-800',
};

const ManagerTeam = () => {
  const { token } = useContext(AuthContext);
  const [team, setTeam] = useState({ departmentName: null, users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get('/api/Manager/team', { headers: { Authorization: `Bearer ${token}` } });
      setTeam({ departmentName: response.data?.departmentName || null, users: Array.isArray(response.data?.users) ? response.data.users : [] });
    } catch { setError(true); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadTeam(); }, [loadTeam]);

  return <Layout title="Department Team" wide>
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m16-10a4 4 0 1 0-2-7.5M22 21v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Department Team</h1>
            <p className="mt-0.5 text-sm text-slate-600">Users in your department.</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm">
          <svg aria-hidden="true" className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m16-10a4 4 0 1 0-2-7.5M22 21v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>
          {team.users.length} {team.users.length === 1 ? 'user' : 'users'}
        </div>
      </div>

      {error ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">Team members could not be loaded.<button onClick={loadTeam} className="ml-2 font-semibold underline">Try again</button></div>
        : <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-[0_10px_20px_rgba(30,41,59,.12)] backdrop-blur">
          {loading ? <div className="p-12 text-center text-sm text-slate-500">Loading team…</div>
            : team.users.length === 0 ? <div className="p-12 text-center"><p className="text-sm font-semibold text-slate-800">No department members found</p><p className="mt-1 text-sm text-slate-500">Ask an administrator to assign your account to a department.</p></div>
              : <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead className="bg-white/55 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr><th className="w-[29%] px-5 py-4">User</th><th className="w-[17%] px-5 py-4">Role</th><th className="w-[26%] px-5 py-4">Department</th><th className="w-[12%] px-5 py-4">Status</th><th className="w-[16%] px-5 py-4">Joined</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {team.users.map(user => {
                      const role = String(user.role || '').toUpperCase();
                      const active = String(user.status || '').toUpperCase() === 'ACTIVE';
                      return <tr key={user.userId} className="transition hover:bg-white/55">
                        <td className="px-5 py-3.5"><div className="flex items-center gap-3">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-500/15">{(user.name || user.email || '?').charAt(0).toUpperCase()}</span>
                          <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{user.name || 'Unnamed user'}</span><span className="block truncate text-xs text-slate-500">{user.email}</span></span>
                        </div></td>
                        <td className="px-5 py-3.5"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${roleColors[role] || 'border-slate-200 bg-slate-100 text-slate-700'}`}>{role === 'USER' ? 'Employee' : role.charAt(0) + role.slice(1).toLowerCase()}</span></td>
                        <td className="px-5 py-3.5 text-sm text-slate-700">{user.departmentName || team.departmentName || '—'}</td>
                        <td className="px-5 py-3.5"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${active ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>{active ? 'Active' : (user.status || 'Unknown').toLowerCase()}</span></td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-500">{dateLabel(user.createdAt)}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>}
        </div>}
    </div>
  </Layout>;
};

export default ManagerTeam;
