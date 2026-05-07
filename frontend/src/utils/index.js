import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

export const timeAgo = (date) => {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'COMPLETED') return false;
  return isPast(new Date(dueDate));
};

export const dueDateLabel = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isToday(d)) return 'Due today';
  if (isTomorrow(d)) return 'Due tomorrow';
  if (isPast(d)) return `Overdue · ${formatDate(date)}`;
  return formatDate(date);
};

export const statusConfig = {
  TODO: { label: 'To Do', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getApiError = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong'
  );
};
