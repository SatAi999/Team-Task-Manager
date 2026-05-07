const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return next(new AppError('Email already in use', 409));

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signToken({ id: user.id, role: user.role });

  res.status(201).json({ status: 'success', token, user });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return next(new AppError('Invalid email or password', 401));

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return next(new AppError('Invalid email or password', 401));

  const token = signToken({ id: user.id, role: user.role });

  const { password: _, ...safeUser } = user;
  res.json({ status: 'success', token, user: safeUser });
});

const getMe = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  res.json({ status: 'success', user });
});

module.exports = { signup, login, getMe };
