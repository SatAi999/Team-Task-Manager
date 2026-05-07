import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { projectService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatDate, isOverdue, getApiError } from '../../utils';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Avatar from '../../components/ui/Avatar';
import { PageLoader } from '../../components/ui/Spinner';
import { ConfirmModal } from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';
import EmptyState from '../../components/ui/EmptyState';

const ProjectDetail = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    projectService.getOne(id)
      .then(({ data }) => setProject(data.project))
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await projectService.delete(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!project) return null;

  const completedCount = project.tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPct = project.tasks.length > 0 ? Math.round((completedCount / project.tasks.length) * 100) : 0;

  const filteredTasks = project.tasks.filter((t) => {
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link to="/projects" className="hover:text-indigo-600">Projects</Link>
            <span>/</span>
            <span className="text-slate-600">{project.title}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{project.title}</h2>
          {project.description && <p className="text-slate-500 mt-1">{project.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex gap-2 flex-shrink-0">
            <Link to={`/projects/${id}/edit`}>
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Delete</Button>
          </div>
        )}
      </div>

      {/* Progress */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Project Progress</span>
          <span className="text-sm font-bold text-indigo-600">{progressPct}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-1.5">{completedCount} of {project.tasks.length} tasks completed</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h3 className="font-semibold text-slate-900">Tasks ({project.tasks.length})</h3>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
              {isAdmin && (
                <Link to={`/tasks/new?projectId=${id}`}>
                  <Button size="sm">+ Task</Button>
                </Link>
              )}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState icon="✅" title="No tasks" description="No tasks match your filters" />
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <Card key={task.id} className={`flex items-center gap-4 py-3 px-4 ${overdue ? 'border-red-200 bg-red-50/30' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <Link to={`/tasks/${task.id}`} className="text-sm font-medium text-slate-900 hover:text-indigo-600 truncate block">
                        {task.title}
                        {overdue && <span className="ml-2 text-xs text-red-500">Overdue</span>}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {task.assigned ? task.assigned.name : 'Unassigned'}
                        {task.dueDate && ` · ${formatDate(task.dueDate)}`}
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Members */}
        <div>
          <Card>
            <h3 className="font-semibold text-slate-900 mb-4">Members ({project.members.length})</h3>
            <div className="space-y-3">
              {project.members.map(({ user }) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar name={user.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
            {isAdmin && (
              <Link to={`/projects/${id}/edit`} className="mt-4 block">
                <Button variant="secondary" size="sm" className="w-full">Manage Members</Button>
              </Link>
            )}
          </Card>
          <Card className="mt-4">
            <h3 className="font-semibold text-slate-900 mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Created by</span>
                <span className="font-medium text-slate-800">{project.creator?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created</span>
                <span className="font-medium text-slate-800">{formatDate(project.createdAt)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Project"
        message={`Delete "${project.title}"? All tasks will be permanently removed.`}
      />
    </div>
  );
};

export default ProjectDetail;
