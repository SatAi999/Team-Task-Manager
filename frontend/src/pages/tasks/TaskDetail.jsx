import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { taskService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatDate, isOverdue, getApiError } from '../../utils';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { PageLoader } from '../../components/ui/Spinner';
import { ConfirmModal } from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';
import Select from '../../components/ui/Select';

const TaskDetail = () => {
  const { id } = useParams();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    taskService.getOne(id)
      .then(({ data }) => setTask(data.task))
      .catch(() => navigate('/tasks'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskService.delete(id);
      toast.success('Task deleted');
      navigate('/tasks');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (status) => {
    setStatusUpdating(true);
    try {
      const { data } = await taskService.update(id, { status });
      setTask(data.task);
      toast.success('Status updated');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!task) return null;

  const overdue = isOverdue(task.dueDate, task.status);
  const canUpdateStatus = isAdmin || task.assignedTo === user?.id;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/tasks" className="hover:text-indigo-600">Tasks</Link>
        <span>/</span>
        <span className="text-slate-600 truncate">{task.title}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-slate-900">
            {task.title}
            {overdue && <span className="ml-3 text-sm text-red-500 font-medium">Overdue</span>}
          </h2>
          {task.description && <p className="text-slate-500 mt-2">{task.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex gap-2 flex-shrink-0">
            <Link to={`/tasks/${id}/edit`}>
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Delete</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Task Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status</span>
              <StatusBadge status={task.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Project</span>
              <Link to={`/projects/${task.projectId}`} className="font-medium text-indigo-600 hover:underline">
                {task.assignee?.title}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assignee</span>
              <span className="font-medium text-slate-800">{task.assigned?.name || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Created by</span>
              <span className="font-medium text-slate-800">{task.creator?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Due date</span>
              <span className={`font-medium ${overdue ? 'text-red-600' : 'text-slate-800'}`}>
                {formatDate(task.dueDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Created</span>
              <span className="font-medium text-slate-800">{formatDate(task.createdAt)}</span>
            </div>
          </div>
        </Card>

        {canUpdateStatus && (
          <Card>
            <h3 className="font-semibold text-slate-900 mb-4">Update Status</h3>
            <Select
              label="Task Status"
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusUpdating}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </Select>
            {statusUpdating && <p className="text-xs text-slate-400 mt-2">Updating...</p>}
          </Card>
        )}
      </div>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Task"
        message={`Delete "${task.title}"? This cannot be undone.`}
      />
    </div>
  );
};

export default TaskDetail;
