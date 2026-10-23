import { useEffect, useRef, useState } from 'react';
import api from '../api';

const previewTypes = { pdf: 'application/pdf', txt: 'text/plain', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };

export default function EvidenceList({ items = [], token }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  const urls = useRef([]);
  useEffect(() => () => { urls.current.forEach(URL.revokeObjectURL); }, []);

  const openFile = async (item, preview) => {
    const extension = (item.fileName || '').split('.').pop().toLowerCase();
    if (preview && !previewTypes[extension]) { setError('Preview is unavailable for this file. Download it instead.'); return; }
    const tab = preview ? window.open('', '_blank') : null;
    if (preview && !tab) { setError('Allow pop-ups to view this file.'); return; }
    setError(''); setBusy(item.evidenceId);
    try {
      const response = await api.get(`/api/Evidence/${item.evidenceId}/download`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const blob = preview ? new Blob([response.data], { type: previewTypes[extension] }) : response.data;
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      if (tab) { tab.opener = null; tab.location.href = url; }
      else {
        const link = document.createElement('a'); link.href = url; link.download = item.fileName || 'evidence';
        document.body.appendChild(link); link.click(); link.remove();
      }
    } catch {
      if (tab) tab.close();
      setError('Could not open this evidence file. Check your access and try again.');
    } finally { setBusy(null); }
  };

  return <div>
    {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
    {items.length ? <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white/80">{items.map(item =>
      <li key={item.evidenceId} className="flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="min-w-0"><p className="break-all text-sm font-medium text-slate-800">{item.fileName}</p><p className="mt-1 text-xs text-slate-500">{item.description || item.uploaderName || 'Evidence'}{item.uploadedAt ? ` · ${new Date(item.uploadedAt).toLocaleString()}` : ''}</p></div>
        <div className="flex gap-2"><button type="button" disabled={!item.hasFile || busy === item.evidenceId} onClick={() => openFile(item, true)} className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 disabled:opacity-40">View</button><button type="button" disabled={!item.hasFile || busy === item.evidenceId} onClick={() => openFile(item, false)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">{item.hasFile ? 'Download' : 'File unavailable'}</button></div>
      </li>)}</ul> : <p className="mt-3 rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500">No evidence files attached.</p>}
  </div>;
}
