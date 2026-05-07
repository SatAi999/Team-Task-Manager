import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService, userService } from '../../services';
import { getApiError } from '../../utils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { toast } from '../../components/ui/Toast';
import { PageLoader } from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';

const ProjectForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', description: '' });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    userService.getAll().then(({ data }) => setAllUsers(data.users));
    if (isEdit) {
      projectService.getOne(id)
        .then(({ data }) => {
          setForm({ title: data.project.title, description: data.project.description || '' });
          setSelectedMembers(data.project.members.map((m) => m.userId));
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await projectService.update(id, form);
        await projectService.updateMembers(id, selectedMembers);
        toast.success('Project updated');
      } else {
        await projectService.create({ ...form, memberIds: selectedMembers });
        toast.success('Project created');
      }
      navigate('/projects');
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
        <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Project' : 'Create Project'}</h2>
        <p className="text-sm text-slate-500 mt-1">{isEdit ? 'Update project details and members' : 'Set up a new project for your team'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Project Details</h3>
          <div className="space-y-4">
            <Input
              label="Project Title *"
              name="title"
              placeholder="e.g. Website Redesign"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              error={errors.title}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                placeholder="Describe what this project is about..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Team Members</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allUsers.map((user) => (
              <label key={user.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user.id)}
                  onChange={() => toggleMember(user.id)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <Avatar name={user.name} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                  {user.role}
                </span>
              </label>
            ))}
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={() => navigate('/projects')}>Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Save Changes' : 'Create Project'}</Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
