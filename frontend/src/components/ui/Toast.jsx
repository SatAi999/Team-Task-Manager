import { useEffect, useState } from 'react';

let addToast;
export const toast = {
  success: (msg) => addToast?.({ type: 'success', message: msg }),
  error: (msg) => addToast?.({ type: 'error', message: msg }),
  info: (msg) => addToast?.({ type: 'info', message: msg }),
};

const icons = {
  success: (
    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
    </svg>
  ),
};

const ToastProvider = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToast = (t) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3500);
    };
    return () => { addToast = null; };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3 min-w-[260px] pointer-events-auto animate-in slide-in-from-right"
        >
          {icons[t.type]}
          <span className="text-sm text-slate-800 font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastProvider;
