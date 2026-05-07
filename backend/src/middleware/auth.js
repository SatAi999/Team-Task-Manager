const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const prisma = require('../prisma/client');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authenticated. Please login.', 401));
  }

  const decoded = verifyToken(token);

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    return next(new AppError('User no longer exists', 401));
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

module.exports = { protect, restrictTo };
