import { forwardRef } from 'react';

const Select = forwardRef(({ label, error, className = '', children, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <select
      ref={ref}
      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
        error ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
));
Select.displayName = 'Select';

export default Select;
