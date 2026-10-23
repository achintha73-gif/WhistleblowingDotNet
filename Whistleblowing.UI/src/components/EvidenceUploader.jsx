import { useRef, useState } from 'react';
import api from '../api';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;
const ACCEPTED_FILE = /\.(jpe?g|png|gif|webp|txt|pdf)$/i;

const uploadErrorMessage = error => {
  const data = error.response?.data;
  const serverMessage = data?.error || data?.detail || data?.title || data?.message;
  if (serverMessage) return serverMessage;
  if (error.response?.status === 401) return 'Your session expired. Sign in again and retry the upload.';
  if (error.response?.status === 403) return 'You do not have permission to attach evidence here.';
  if (error.response?.status === 413) return 'The upload is too large. Each file must be 10 MB or smaller.';
  if (error.response) return `Upload failed (HTTP ${error.response.status}). Please try again.`;
  return 'Could not reach the server. Check that the API is running, then retry.';
};

const EvidenceUploader = ({ uploadUrl, token, maxFiles = 5, onUploaded, initialFiles = [], initialDescription = '' }) => {
  const inputRef = useRef(null);
  const [files, setFiles] = useState(initialFiles);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    const combined = [...files, ...incoming];
    if (combined.length > maxFiles) return setError(`Attach up to ${maxFiles} files.`);
    if (incoming.some(file => file.size > MAX_FILE_SIZE) || combined.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_SIZE) {
      return setError('Each file can be up to 10 MB, with a 25 MB total limit.');
    }
    if (incoming.some(file => !ACCEPTED_FILE.test(file.name))) return setError('Use image files, PDF, or TXT files only.');
    setError('');
    setStatus('');
    setFiles(combined);
  };

  const uploadFiles = async (event) => {
    event.preventDefault();
    if (!files.length) return setError('Choose at least one file to upload.');
    setUploading(true);
    setError('');
    setStatus('');
    try {
      for (const file of files) {
        const body = new FormData();
        body.append('File', file);
        if (description.trim()) body.append('Description', description.trim());
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await api.post(uploadUrl, body, { headers });
        setFiles(current => current.filter(queuedFile => queuedFile !== file));
      }
      setDescription('');
      if (inputRef.current) inputRef.current.value = '';
      setStatus('Evidence uploaded successfully.');
      onUploaded?.();
    } catch (uploadError) {
      setError(uploadErrorMessage(uploadError));
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-blue-200 bg-white/80 p-4 shadow-sm sm:p-5" aria-labelledby="evidence-upload-title">
      <form onSubmit={uploadFiles}>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><h2 id="evidence-upload-title" className="text-xs font-semibold text-slate-800">Attach Evidence <span className="font-normal text-slate-500">(optional)</span></h2><span className="text-[10px] text-slate-500">Max 10 MB each Â· 25 MB total</span></div>
        <label htmlFor="evidence-upload-input" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); addFiles(event.dataTransfer.files); }} className="mt-3 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-blue-300 bg-white px-4 py-4 text-center transition hover:border-blue-500 hover:bg-blue-50/40">
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5"/></svg></span>
          <span className="text-xs font-semibold text-slate-700">Drag and drop files here</span><span className="mt-1 text-[10px] text-slate-500">or click to browse Â· PDF, images, TXT Â· up to {maxFiles} files</span>
        </label>
        <input ref={inputRef} id="evidence-upload-input" type="file" accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.txt,text/plain" multiple className="sr-only" onChange={event => { addFiles(event.target.files); event.target.value = ''; }} />
        {files.length > 0 && <ul className="mt-3 space-y-2">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"><span className="min-w-0 truncate font-medium text-slate-700">{file.name}<span className="ml-2 text-[10px] font-normal text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span></span><button type="button" onClick={() => setFiles(current => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove ${file.name}`} className="shrink-0 rounded px-2 py-1 text-slate-500 hover:bg-red-50 hover:text-red-700">Remove</button></li>)}</ul>}
        <label htmlFor="evidence-upload-description" className="mb-1.5 mt-3 block text-[11px] font-medium text-slate-700">Evidence note <span className="font-normal text-slate-400">(optional)</span></label>
        <input id="evidence-upload-description" type="text" maxLength={500} placeholder="Briefly describe the attached files" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" value={description} onChange={event => setDescription(event.target.value)} />
        {error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        {status && <p role="status" className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{status}</p>}
        <div className="mt-3 flex justify-end"><button type="submit" disabled={uploading || !files.length} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/15 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{uploading ? 'Uploading...' : `Upload evidence${files.length ? ` (${files.length})` : ''}`}</button></div>
      </form>
    </section>
  );
};

export default EvidenceUploader;
