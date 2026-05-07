import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatDate, isOverdue, getApiError } from '../../utils';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/Spinner';
import { ConfirmModal } from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';

const Tasks = () => {
  const { isAdmin, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const load = (p = 1) => {
    setLoading(true);
    const params = { page: p, limit: 15 };
    if (filters.status) params.status = filters.status;
    taskService.getAll(params)
      .then(({ data }) => {
        setTasks(data.tasks);
        setPagination({ total: data.total, pages: data.pages });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page, filters.status]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskService.delete(deleteTarget.id);
      toast.success('Task deleted');
      setDeleteTarget(null);
      load(page);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tasks</h2>
          <p className="text-sm text-slate-500">{pagination.total} total tasks</p>
        </div>
        {isAdmin && (
          <Link to="/tasks/new">
            <Button size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
        />
        <select
          value={filters.status}
          onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}
          className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No tasks found"
          description={isAdmin ? 'Create your first task' : 'No tasks assigned to you yet'}
          action={isAdmin ? <Link to="/tasks/new"><Button>Create Task</Button></Link> : null}
        />
      ) : (
        <>
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Project</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Assignee</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Due Date</th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((task) => {
                    const overdue = isOverdue(task.dueDate, task.status);
                    return (
                      <tr key={task.id} className={`hover:bg-slate-50 transition-colors ${overdue ? 'bg-red-50/40' : ''}`}>
                        <td className="px-6 py-3.5">
                          <Link to={`/tasks/${task.id}`} className="text-sm font-medium text-slate-900 hover:text-indigo-600 block max-w-xs truncate">
                            {task.title}
                            {overdue && <span className="ml-1.5 text-xs text-red-500">Overdue</span>}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-sm text-slate-500 max-w-[120px] truncate block">{task.assignee?.title || '—'}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-sm text-slate-500">{task.assigned?.name || 'Unassigned'}</span>
                        </td>
                        <td className={`px-4 py-3.5 hidden lg:table-cell text-sm ${overdue ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                          {formatDate(task.dueDate)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1 justify-end">
                            <Link to={`/tasks/${task.id}`}>
                              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </Link>
                            {isAdmin && (
                              <>
                                <Link to={`/tasks/${task.id}/edit`}>
                                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                </Link>
                                <button
                                  onClick={() => setDeleteTarget(task)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm text-slate-600">Page {page} of {pagination.pages}</span>
              <Button variant="secondary" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Task"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
};

export default Tasks;
