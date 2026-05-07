import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatDate, isOverdue, statusConfig } from '../../utils';
import Card, { CardHeader } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { PageLoader } from '../../components/ui/Spinner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const StatCard = ({ label, value, icon, color }) => (
  <Card className="flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </Card>
);

const PIE_COLORS = { TODO: '#94a3b8', IN_PROGRESS: '#6366f1', COMPLETED: '#10b981' };

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.get().then(({ data }) => setData(data.dashboard)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return null;

  const { stats, tasksByStatus, recentTasks } = data;

  const pieData = tasksByStatus.map((t) => ({
    name: statusConfig[t.status]?.label || t.status,
    value: t.count,
    fill: PIE_COLORS[t.status] || '#94a3b8',
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Good day, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-slate-500 text-sm mt-1">Here's an overview of your workspace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Projects"
          value={stats.totalProjects}
          color="bg-indigo-50"
          icon={<svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h3.5a2 2 0 011.5.67L11 7h10a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>}
        />
        <StatCard
          label="Total Tasks"
          value={stats.totalTasks}
          color="bg-blue-50"
          icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>}
        />
        <StatCard
          label="Completed"
          value={stats.completedTasks}
          color="bg-emerald-50"
          icon={<svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        />
        <StatCard
          label="Overdue"
          value={stats.overdueTasks}
          color="bg-red-50"
          icon={<svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Completion rate */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Overall Completion Rate</span>
          <span className="text-sm font-bold text-indigo-600">{stats.completionRate}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1.5">
          <span>{stats.completedTasks} completed</span>
          <span>{stats.totalTasks - stats.completedTasks} remaining</span>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Tasks by Status" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pieData} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Task Distribution" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={10} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent tasks */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Recent Tasks</h3>
          <Link to="/tasks" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentTasks.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">No tasks yet</p>
          )}
          {recentTasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status);
            return (
              <div key={task.id} className="px-6 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${overdue ? 'text-red-700' : 'text-slate-900'}`}>
                    {task.title}
                    {overdue && <span className="ml-2 text-xs text-red-500 font-normal">Overdue</span>}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{task.assignee?.title} · {task.assigned?.name || 'Unassigned'}</p>
                </div>
                <StatusBadge status={task.status} />
                {task.dueDate && (
                  <span className={`text-xs hidden sm:block ${overdue ? 'text-red-500' : 'text-slate-400'}`}>
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
