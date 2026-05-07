const prisma = require('../prisma/client');
const catchAsync = require('../utils/catchAsync');

const getDashboard = catchAsync(async (req, res) => {
  const now = new Date();
  const isAdmin = req.user.role === 'ADMIN';

  const projectWhere = isAdmin
    ? {}
    : { members: { some: { userId: req.user.id } } };

  const taskWhere = isAdmin
    ? {}
    : { assignee: { members: { some: { userId: req.user.id } } } };

  const [
    totalProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    overdueTasks,
    recentTasks,
    tasksByStatus,
  ] = await Promise.all([
    prisma.project.count({ where: projectWhere }),
    prisma.task.count({ where: taskWhere }),
    prisma.task.count({ where: { ...taskWhere, status: 'COMPLETED' } }),
    prisma.task.count({ where: { ...taskWhere, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { ...taskWhere, status: 'TODO' } }),
    prisma.task.count({
      where: {
        ...taskWhere,
        status: { not: 'COMPLETED' },
        dueDate: { lt: now },
      },
    }),
    prisma.task.findMany({
      where: taskWhere,
      include: {
        assigned: { select: { id: true, name: true } },
        assignee: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: taskWhere,
      _count: { status: true },
    }),
  ]);

  res.json({
    status: 'success',
    dashboard: {
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        completionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      tasksByStatus: tasksByStatus.map((t) => ({
        status: t.status,
        count: t._count.status,
      })),
      recentTasks,
    },
  });
});

module.exports = { getDashboard };
