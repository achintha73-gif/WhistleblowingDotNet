import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const categories = ['Harassment', 'Discrimination', 'Fraud', 'Corruption', 'Safety', 'Financial', 'Misconduct', 'Other'];

const AnonymousSubmit = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [files, setFiles] = useState([]);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const selectFiles = (selectedFiles) => {
    const nextFiles = Array.from(selectedFiles || []);
    const allFiles = [...files, ...nextFiles];
    const totalBytes = allFiles.reduce((sum, file) => sum + file.size, 0);
    if (allFiles.length > 5) {
      setError('You can attach up to 5 files.');
      return;
    }
    if (nextFiles.some(file => file.size > 10 * 1024 * 1024) || totalBytes > 25 * 1024 * 1024) {
      setError('Each file must be 10 MB or smaller, with a maximum total of 25 MB.');
      return;
    }
    const allowed = /\.(jpe?g|png|gif|webp|txt|pdf)$/i;
    if (nextFiles.some(file => !allowed.test(file.name))) {
      setError('Only image files, PDF, and TXT files are supported.');
      return;
    }
    setError('');
    setFiles(allFiles);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/anonymous/report', form);
      const code = response.data.referenceCode;
      let evidenceWarning = false;
      let remainingEvidence = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const data = new FormData();
        data.append('File', file);
        if (evidenceNote.trim()) data.append('Description', evidenceNote.trim());
        try {
          await axios.post(`/api/Evidence/anonymous/${encodeURIComponent(code)}/upload`, data);
        } catch {
          evidenceWarning = true;
          remainingEvidence = files.slice(index);
          break;
        }
      }
      navigate('/anonymous/success', { state: { code, evidenceWarning, remainingEvidence, evidenceNote } });
    } catch {
      setError('We could not submit your concern. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/70 to-violet-50 px-4 py-7 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/anonymous" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18-6-6 6-6M9 12h12"/></svg>Back to anonymous portal
        </Link>

        <header className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m-7-7h14"/></svg></span>
          <div><h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Submit a concern anonymously</h1><p className="mt-0.5 text-xs text-slate-600 sm:text-sm">Share your concern securely. A reference code will be provided.</p></div>
        </header>

        <section className="rounded-3xl border border-white/90 bg-white/85 p-5 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-7 lg:p-8">
          <div className="mb-5 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-3.5 sm:p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 3 8 3v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 12 2 2 4-4"/></svg></span>
            <div><h2 className="text-xs font-bold text-blue-950 sm:text-sm">Anonymous submission</h2><p className="mt-1 text-[11px] leading-5 text-blue-800 sm:text-xs">Your identity will not be recorded. After submitting, you will receive a reference code to track your concern.</p></div>
          </div>

          {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="anonymous-title" className="mb-1.5 block text-xs font-semibold text-slate-800">Title <span className="text-red-500">*</span></label>
              <input id="anonymous-title" name="title" type="text" maxLength={200} placeholder="Brief summary of your concern" className={fieldClass} value={form.title} onChange={updateField} required />
            </div>

            <div>
              <label htmlFor="anonymous-category" className="mb-1.5 block text-xs font-semibold text-slate-800">Category <span className="font-normal text-slate-400">(optional)</span></label>
              <select id="anonymous-category" name="category" className={`${fieldClass} appearance-none`} value={form.category} onChange={updateField}>
                <option value="">Select a category (optional)</option>
                {categories.map(category => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3"><label htmlFor="anonymous-description" className="block text-xs font-semibold text-slate-800">Description <span className="text-red-500">*</span></label><span className="text-[10px] text-slate-400">{form.description.length}/5000</span></div>
              <textarea id="anonymous-description" name="description" rows={6} maxLength={5000} placeholder="Provide details about what happened, when, where, and any other relevant information. Avoid including details that could identify you." className={`${fieldClass} min-h-36 resize-y leading-6`} value={form.description} onChange={updateField} required />
              <p className="mt-1.5 text-[10px] leading-4 text-slate-500">Include dates and relevant details. Avoid information that could reveal your identity.</p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><label htmlFor="anonymous-evidence" className="cursor-pointer text-xs font-semibold text-slate-800">Attach Evidence <span className="font-normal text-slate-500">(optional)</span></label><span className="text-[10px] text-slate-500">Max 10 MB each · 25 MB total</span></div>
              <label htmlFor="anonymous-evidence" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); selectFiles(event.dataTransfer.files); }} className="mt-3 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/80 px-4 py-4 text-center transition hover:border-blue-400 hover:bg-white">
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5"/></svg></span>
                <span className="text-xs font-semibold text-slate-700">Drag and drop files here</span><span className="mt-1 text-[10px] text-slate-500">or click to browse · PDF, images, TXT · up to 5 files</span>
              </label>
              <input id="anonymous-evidence" type="file" accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.txt,text/plain" multiple className="sr-only" onChange={event => { selectFiles(event.target.files); event.target.value = ''; }} />
              {files.length > 0 && <ul className="mt-3 space-y-2">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"><span className="min-w-0 truncate font-medium text-slate-700">{file.name}<span className="ml-2 text-[10px] font-normal text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span></span><button type="button" onClick={() => setFiles(current => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove ${file.name}`} className="shrink-0 rounded px-2 py-1 text-slate-500 hover:bg-red-50 hover:text-red-700">Remove</button></li>)}</ul>}
              <label htmlFor="evidence-note" className="mb-1.5 mt-3 block text-[11px] font-medium text-slate-700">Evidence note <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="evidence-note" type="text" maxLength={500} placeholder="Briefly describe the attached files" className={`${fieldClass} py-2.5 text-xs`} value={evidenceNote} onChange={event => setEvidenceNote(event.target.value)} />
            </div>

            <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5"><svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z"/></svg><p className="text-[11px] leading-5 text-amber-900"><strong>Important:</strong> Save your reference code after submitting. You will need it to track your concern or add information later.</p></div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link to="/anonymous" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</Link>
              <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-violet-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-wait disabled:opacity-60">{loading ? 'Submitting…' : 'Submit concern anonymously'}{!loading && <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-6-6 6 6-6 6"/></svg>}</button>
            </div>
          </form>
        </section>
        <p className="mt-4 text-center text-[10px] text-slate-500">Already submitted? <Link to="/anonymous/track" className="font-semibold text-blue-700 hover:text-blue-900">Track your concern →</Link></p>
      </div>
    </main>
  );
};

export default AnonymousSubmit;
