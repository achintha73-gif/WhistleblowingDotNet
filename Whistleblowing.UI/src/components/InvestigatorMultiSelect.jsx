import { useEffect, useRef, useState } from 'react';

const InvestigatorMultiSelect = ({ investigators, selectedIds, onChange, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const closeOutside = event => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const closeOnEscape = event => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const toggle = userId => {
    const id = String(userId);
    onChange(selectedIds.includes(id) ? selectedIds.filter(selected => selected !== id) : [...selectedIds, id]);
  };

  const selectedUsers = investigators.filter(person => selectedIds.includes(String(person.userId)));

  return <div ref={rootRef} className="relative">
    <button type="button" aria-haspopup="listbox" aria-expanded={open} disabled={disabled} onClick={() => setOpen(value => !value)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm text-slate-800 shadow-sm transition hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70">
      <span className={selectedUsers.length ? 'truncate font-medium' : 'truncate text-slate-500'}>{selectedUsers.length ? selectedUsers.map(person => person.name).join(', ') : investigators.length ? 'Select one or more investigators' : 'No active investigators available'}</span>
      <svg aria-hidden="true" className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
    </button>
    {open && <div role="listbox" aria-multiselectable="true" className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
      {investigators.map(person => {
        const selected = selectedIds.includes(String(person.userId));
        return <button key={person.userId} type="button" role="option" aria-selected={selected} onClick={() => toggle(person.userId)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${selected ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50'}`}>
          <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'}`}>{selected && <svg aria-hidden="true" className="h-3 w-3" viewBox="0 0 16 16" fill="none"><path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>
          <span className="min-w-0"><span className="block truncate text-sm font-medium">{person.name}</span><span className="block truncate text-xs text-slate-500">{person.email}</span></span>
        </button>;
      })}
      {!investigators.length && <p className="px-3 py-3 text-sm text-slate-500">Add active investigator accounts before assigning this case.</p>}
    </div>}
    {selectedUsers.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{selectedUsers.map(person => <span key={person.userId} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-800"><span className="truncate">{person.name}</span><button type="button" aria-label={`Remove ${person.name}`} disabled={disabled} onClick={() => toggle(person.userId)} className="rounded-full text-blue-500 hover:text-rose-600 disabled:opacity-50">Ã—</button></span>)}</div>}
  </div>;
};

export default InvestigatorMultiSelect;
