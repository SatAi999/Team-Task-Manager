import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { taskService, projectService, userService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { getApiError } from '../../utils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { toast } from '../../components/ui/Toast';
import { PageLoader } from '../../components/ui/Spinner';

const TaskForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultProjectId = searchParams.get('projectId') || '';
  const { isAdmin, user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    dueDate: '',
    assignedTo: '',
    projectId: defaultProjectId,
  });
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    projectService.getAll().then(({ data }) => setProjects(data.projects));
    if (isEdit) {
      taskService.getOne(id)
        .then(({ data }) => {
          const t = data.task;
          setForm({
            title: t.title,
            description: t.description || '',
            status: t.status,
            dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
            assignedTo: t.assignedTo || '',
            projectId: t.projectId,
          });
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  // Load members when project changes
  useEffect(() => {
    if (form.projectId) {
      projectService.getOne(form.projectId).then(({ data }) => {
        setMembers(data.project.members.map((m) => m.user));
      });
    } else {
      setMembers([]);
    }
  }, [form.projectId]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.projectId) errs.projectId = 'Project is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null };

      // Members can only update status
      if (!isAdmin) {
        await taskService.update(id, { status: form.status });
        toast.success('Task status updated');
        navigate(`/tasks/${id}`);
        return;
      }

      if (isEdit) {
        await taskService.update(id, payload);
        toast.success('Task updated');
        navigate(`/tasks/${id}`);
      } else {
        await taskService.create(payload);
        toast.success('Task created');
        navigate('/tasks');
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Task' : 'Create Task'}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {isEdit ? (isAdmin ? 'Update task details' : 'Update task status') : 'Add a new task to a project'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Task Details</h3>
          <div className="space-y-4">
            {isAdmin && (
              <>
                <Input
                  label="Task Title *"
                  name="title"
                  placeholder="e.g. Design landing page"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  error={errors.title}
                  disabled={!isAdmin}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    placeholder="Describe the task..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-400"
                  />
                </div>
                <Select
                  label="Project *"
                  value={form.projectId}
                  onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value, assignedTo: '' }))}
                  error={errors.projectId}
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </Select>
                <Select
                  label="Assign To"
                  value={form.assignedTo}
                  onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>
                <Input
                  label="Due Date"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </>
            )}
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Save Changes' : 'Create Task'}</Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
