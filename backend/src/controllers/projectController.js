const prisma = require('../prisma/client');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// GET /api/projects — admin sees all, member sees only their projects
const getProjects = catchAsync(async (req, res) => {
  let projects;

  if (req.user.role === 'ADMIN') {
    projects = await prisma.project.findMany({
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  res.json({ status: 'success', count: projects.length, projects });
});

// GET /api/projects/:id
const getProject = catchAsync(async (req, res, next) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      tasks: {
        include: {
          assigned: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) return next(new AppError('Project not found', 404));

  // Members can only view their own projects
  if (req.user.role === 'MEMBER') {
    const isMember = project.members.some((m) => m.userId === req.user.id);
    if (!isMember) return next(new AppError('Access denied', 403));
  }

  res.json({ status: 'success', project });
});

// POST /api/projects — admin only
const createProject = catchAsync(async (req, res) => {
  const { title, description, memberIds = [] } = req.body;

  const project = await prisma.project.create({
    data: {
      title,
      description,
      createdBy: req.user.id,
      members: {
        create: [
          { userId: req.user.id },
          ...memberIds
            .filter((id) => id !== req.user.id)
            .map((userId) => ({ userId })),
        ],
      },
    },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  res.status(201).json({ status: 'success', project });
});

// PUT /api/projects/:id — admin only
const updateProject = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;

  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return next(new AppError('Project not found', 404));

  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: { title, description },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  res.json({ status: 'success', project: updated });
});

// DELETE /api/projects/:id — admin only
const deleteProject = catchAsync(async (req, res, next) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return next(new AppError('Project not found', 404));

  await prisma.project.delete({ where: { id: req.params.id } });

  res.status(204).json({ status: 'success', data: null });
});

// PUT /api/projects/:id/members — admin only
const updateMembers = catchAsync(async (req, res, next) => {
  const { memberIds } = req.body;
  if (!Array.isArray(memberIds)) return next(new AppError('memberIds must be an array', 422));

  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return next(new AppError('Project not found', 404));

  // Ensure creator always stays
  const allIds = Array.from(new Set([project.createdBy, ...memberIds]));

  await prisma.projectMember.deleteMany({ where: { projectId: req.params.id } });
  await prisma.projectMember.createMany({
    data: allIds.map((userId) => ({ projectId: req.params.id, userId })),
    skipDuplicates: true,
  });

  const updated = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  res.json({ status: 'success', project: updated });
});

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, updateMembers };
