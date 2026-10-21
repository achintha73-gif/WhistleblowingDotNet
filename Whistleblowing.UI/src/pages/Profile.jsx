import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setMessage('Profile update is not connected to API yet.'); // API එකේ මේකට endpoint එකක් තාම නෑ
  };

  return (
    <Layout title="My Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-600">Update your contact details and password.</p>
        </div>

        {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Avatar Card */}
          <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <h2 className="mt-4 text-lg font-bold text-gray-900">{user?.name}</h2>
              <p className="mt-1 break-all text-sm text-gray-600">{user?.email}</p>
              <span className="mt-3 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{user?.roleName || 'USER'}</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-base font-semibold text-gray-900">Account details</h2>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
                <input type="text" defaultValue={user?.name} className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input type="text" defaultValue={user?.email} readOnly className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-500" />
                <p className="mt-1 text-xs text-gray-400">Contact an administrator to change your email.</p>
              </div>
              <div className="flex justify-end border-t border-gray-100 pt-4">
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">Save profile</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Profile;