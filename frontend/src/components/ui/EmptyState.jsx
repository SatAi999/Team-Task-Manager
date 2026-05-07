const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-3xl">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 mb-5 max-w-xs">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
