import { useEffect, useRef, useState } from 'react';
import api from '../api';

let scriptPromise;
const loadCaptcha = () => {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => {
    window.whistleCaptchaReady = () => resolve(window.grecaptcha);
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=whistleCaptchaReady&render=explicit';
    script.async = true; script.defer = true;
    script.onerror = () => { scriptPromise = null; reject(new Error('Could not load verification.')); };
    document.head.appendChild(script);
  });
  return scriptPromise;
};

export default function Recaptcha({ onChange, resetKey }) {
  const container = useRef(null);
  const widget = useRef(null);
  const callback = useRef(onChange);
  const [error, setError] = useState('');
  callback.current = onChange;
  useEffect(() => {
    let active = true;
    Promise.all([api.get('/api/Anonymous/captcha-config'), loadCaptcha()]).then(([response, google]) => {
      if (!active || !container.current) return;
      widget.current = google.render(container.current, { sitekey: response.data.siteKey, callback: token => callback.current(token), 'expired-callback': () => callback.current(''), 'error-callback': () => { callback.current(''); setError('Verification could not load. Please refresh the page.'); } });
    }).catch(() => { if (active) setError('Verification is unavailable. Please try again later.'); });
    return () => { active = false; widget.current = null; };
  }, []);
  useEffect(() => { if (resetKey && widget.current !== null && window.grecaptcha) window.grecaptcha.reset(widget.current); }, [resetKey]);
  return <div className="rounded-2xl border border-slate-200 bg-white/80 p-4"><p className="mb-3 text-xs font-semibold text-slate-800">Verify you are human <span className="text-red-500">*</span></p><div ref={container} />{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}</div>;
}
