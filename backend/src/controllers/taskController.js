const prisma = require('../prisma/client');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// GET /api/tasks
const getTasks = catchAsync(async (req, res) => {
  const { projectId, status, assignedTo, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};

  if (req.user.role === 'MEMBER') {
    // Members only see tasks from their projects
    where.assignee = {
      members: { some: { userId: req.user.id } },
    };
  }

  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (assignedTo) where.assignedTo = assignedTo;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        assigned: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        assignee: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.task.count({ where }),
  ]);

  res.json({
    status: 'success',
    count: tasks.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    tasks,
  });
});

// GET /api/tasks/:id
const getTask = catchAsync(async (req, res, next) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: {
      assigned: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } },
      assignee: { select: { id: true, title: true } },
    },
  });

  if (!task) return next(new AppError('Task not found', 404));

  if (req.user.role === 'MEMBER') {
    const project = await prisma.project.findFirst({
      where: { id: task.projectId, members: { some: { userId: req.user.id } } },
    });
    if (!project) return next(new AppError('Access denied', 403));
  }

  res.json({ status: 'success', task });
});

// POST /api/tasks — admin only
const createTask = catchAsync(async (req, res, next) => {
  const { title, description, status, dueDate, assignedTo, projectId } = req.body;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return next(new AppError('Project not found', 404));

  if (assignedTo) {
    const isMember = await prisma.projectMember.findFirst({
      where: { projectId, userId: assignedTo },
    });
    if (!isMember) return next(new AppError('Assignee is not a member of this project', 400));
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || 'TODO',
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedTo || null,
      projectId,
      createdBy: req.user.id,
    },
    include: {
      assigned: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } },
      assignee: { select: { id: true, title: true } },
    },
  });

  res.status(201).json({ status: 'success', task });
});

// PUT /api/tasks/:id
const updateTask = catchAsync(async (req, res, next) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return next(new AppError('Task not found', 404));

  // Members can only update status of their own assigned tasks
  if (req.user.role === 'MEMBER') {
    if (task.assignedTo !== req.user.id) {
      return next(new AppError('You can only update tasks assigned to you', 403));
    }
    const { status } = req.body;
    if (!status) return next(new AppError('Members can only update task status', 400));

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        assigned: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        assignee: { select: { id: true, title: true } },
      },
    });
    return res.json({ status: 'success', task: updated });
  }

  // Admin can update everything
  const { title, description, status, dueDate, assignedTo, projectId } = req.body;

  if (assignedTo) {
    const pid = projectId || task.projectId;
    const isMember = await prisma.projectMember.findFirst({
      where: { projectId: pid, userId: assignedTo },
    });
    if (!isMember) return next(new AppError('Assignee is not a member of this project', 400));
  }

  const updated = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assignedTo !== undefined && { assignedTo: assignedTo || null }),
      ...(projectId !== undefined && { projectId }),
    },
    include: {
      assigned: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } },
      assignee: { select: { id: true, title: true } },
    },
  });

  res.json({ status: 'success', task: updated });
});

// DELETE /api/tasks/:id — admin only
const deleteTask = catchAsync(async (req, res, next) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return next(new AppError('Task not found', 404));

  await prisma.task.delete({ where: { id: req.params.id } });

  res.status(204).json({ status: 'success', data: null });
});

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
