import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/Complaints', form, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Complaint submitted successfully!');
      setForm({ title: '', description: '', category: '' });
    } catch (err) { setMessage('Error submitting.'); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Employee Dashboard</h1>
        <button onClick={() => { logout(); navigate('/'); }} className="bg-red-500 px-4 py-2 rounded">Logout</button>
      </nav>
      <div className="p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">Submit a Complaint</h2>
        {message && <p className="mb-4 text-green-600 font-semibold">{message}</p>}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <input type="text" placeholder="Title" className="w-full border p-2 rounded" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <textarea placeholder="Description" className="w-full border p-2 rounded h-32" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          <input type="text" placeholder="Category (e.g. Fraud)" className="w-full border p-2 rounded" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
        </form>
      </div>
    </div>
  );
};
export default EmployeeDashboard;