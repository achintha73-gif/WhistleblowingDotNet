import Recaptcha from '../components/Recaptcha';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';

const categories = ['Harassment', 'Discrimination', 'Fraud', 'Corruption', 'Safety', 'Financial', 'Misconduct', 'Other'];
const allowedFileName = /\.(jpe?g|png|gif|webp|txt|pdf)$/i;

const SubmitComplaint = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', isAnonymous: false });
  const [files, setFiles] = useState([]);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaReset, setCaptchaReset] = useState(0);

  const headers = { Authorization: `Bearer ${token}` };
  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

  const chooseFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    const combined = [...files, ...incoming];
    if (combined.length > 5) return setMessage('Attach up to 5 files.');
    if (incoming.some(file => file.size > 10 * 1024 * 1024) || combined.reduce((sum, file) => sum + file.size, 0) > 25 * 1024 * 1024) {
      return setMessage('Each file can be up to 10 MB, with a 25 MB total limit.');
    }
    if (incoming.some(file => !allowedFileName.test(file.name))) return setMessage('Use image files, PDF, or TXT files only.');
    setMessage('');
    setFiles(combined);
  };

  const uploadEvidence = async (complaintId, referenceCode) => {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const data = new FormData();
      data.append('File', file);
      if (evidenceNote.trim()) data.append('Description', evidenceNote.trim());
      const url = form.isAnonymous
        ? `/api/Evidence/anonymous/${encodeURIComponent(referenceCode)}/upload`
        : `/api/Evidence/complaint/${complaintId}/upload`;
      try {
        await api.post(url, data, { headers: form.isAnonymous ? {} : headers });
      } catch {
        return files.slice(index);
      }
    }
    return [];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.isAnonymous && !captchaToken) { setMessage('Please complete the verification.'); return; }
    setLoading(true);
    setMessage('');
    try {
      let complaintId;
      let referenceCode;
      if (form.isAnonymous) {
        const response = await api.post('/api/anonymous/report', {
          title: form.title,
          category: form.category,
          description: form.description,
          recaptchaToken: captchaToken,
        });
        complaintId = response.data.complaintId;
        referenceCode = response.data.referenceCode;
      } else {
        const response = await api.post('/api/Complaints', form, { headers });
        complaintId = response.data.complaintId;
      }

      const remainingEvidence = files.length ? await uploadEvidence(complaintId, referenceCode) : [];
      const evidenceWarning = remainingEvidence.length > 0;

      if (form.isAnonymous) {
        navigate('/anonymous/success', { state: { code: referenceCode, evidenceWarning, remainingEvidence, evidenceNote } });
      } else if (evidenceWarning) {
        navigate(`/complaint/${complaintId}`, { state: { evidenceWarning, remainingEvidence, evidenceNote } });
      } else {
        navigate('/my-complaints');
      }
    } catch (error) {
      if (form.isAnonymous) { setCaptchaToken(''); setCaptchaReset(value => value + 1); }
      const serverMessage = error.response?.data?.error;
      setMessage(serverMessage || 'Could not submit your concern. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Submit a Concern">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link to="/my-complaints" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18-6-6 6-6M9 12h12"/></svg>Back to My Concerns
        </Link>

        <header className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-600/20"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg></span>
          <div><h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Submit a Concern</h1><p className="mt-0.5 text-xs text-slate-600 sm:text-sm">Report unethical, illegal, or unsafe behavior securely.</p></div>
        </header>

        <section className="rounded-3xl border border-white/90 bg-white/85 p-5 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-7 lg:p-8">
          {message && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="concern-title" className="mb-1.5 block text-xs font-semibold text-slate-800">Title <span className="text-red-500">*</span></label>
              <input id="concern-title" type="text" maxLength={200} placeholder="Brief summary of your concern" className={fieldClass} value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} required />
            </div>

            <div>
              <label htmlFor="concern-category" className="mb-1.5 block text-xs font-semibold text-slate-800">Category <span className="font-normal text-slate-400">(optional)</span></label>
              <select id="concern-category" className={`${fieldClass} appearance-none`} value={form.category} onChange={event => setForm(current => ({ ...current, category: event.target.value }))}>
                <option value="">Select a category</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3"><label htmlFor="concern-description" className="text-xs font-semibold text-slate-800">Description <span className="text-red-500">*</span></label><span className="text-[10px] text-slate-400">{form.description.length}/5000</span></div>
              <textarea id="concern-description" rows={7} maxLength={5000} placeholder="Describe what happened, when, and any relevant details." className={`${fieldClass} min-h-40 resize-y leading-6`} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} required />
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5">
            {form.isAnonymous && <Recaptcha onChange={setCaptchaToken} resetKey={captchaReset} />}

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><label htmlFor="concern-evidence" className="cursor-pointer text-xs font-semibold text-slate-800">Attach Evidence <span className="font-normal text-slate-500">(optional)</span></label><span className="text-[10px] text-slate-500">Max 10 MB each Â· 25 MB total</span></div>
              <label htmlFor="concern-evidence" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); chooseFiles(event.dataTransfer.files); }} className="mt-3 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/80 px-4 py-4 text-center transition hover:border-blue-400 hover:bg-white">
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5"/></svg></span>
                <span className="text-xs font-semibold text-slate-700">Drag and drop files here</span><span className="mt-1 text-[10px] text-slate-500">or click to browse Â· PDF, images, TXT Â· up to 5 files</span>
              </label>
              <input id="concern-evidence" type="file" accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.txt,text/plain" multiple className="sr-only" onChange={event => { chooseFiles(event.target.files); event.target.value = ''; }} />
              {files.length > 0 && <ul className="mt-3 space-y-2">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"><span className="min-w-0 truncate font-medium text-slate-700">{file.name}<span className="ml-2 text-[10px] font-normal text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span></span><button type="button" onClick={() => setFiles(current => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove ${file.name}`} className="shrink-0 rounded px-2 py-1 text-slate-500 hover:bg-red-50 hover:text-red-700">Remove</button></li>)}</ul>}
              <label htmlFor="concern-evidence-note" className="mb-1.5 mt-3 block text-[11px] font-medium text-slate-700">Evidence note <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="concern-evidence-note" type="text" maxLength={500} placeholder="Briefly describe the attached files" className={`${fieldClass} py-2.5 text-xs`} value={evidenceNote} onChange={event => setEvidenceNote(event.target.value)} />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:bg-slate-50">
              <input type="checkbox" checked={form.isAnonymous} onChange={event => setForm(current => ({ ...current, isAnonymous: event.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span><span className="flex items-center gap-2 text-xs font-semibold text-slate-800"><svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V7a5 5 0 0 1 10 0v3m-12 0h14v11H5V10Z"/></svg>Submit anonymously</span><span className="mt-1 block text-[10px] leading-4 text-slate-500">Your name and email will not be linked to this concern. A reference code will be provided.</span></span>
            </label>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link to="/my-complaints" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</Link>
              <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-wait disabled:opacity-60">{loading ? 'Submitting...' : form.isAnonymous ? 'Submit concern anonymously' : 'Submit Concern'}{!loading && <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-6-6 6 6-6 6"/></svg>}</button>
            </div>
          {form.isAnonymous && <Recaptcha onChange={setCaptchaToken} resetKey={captchaReset} />}
          </form>
        </section>
      </div>
    </Layout>
  );
};

export default SubmitComplaint;
