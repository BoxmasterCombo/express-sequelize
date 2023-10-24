const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { RevokedTokens } = require('../db');
const AppError = require("../utils/appError");

// This is a protected route
module.exports = catchAsync(async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return next(new AppError('Please login', 401));
  }

  // Check if token has been revoked
  const revokedTokens = await RevokedTokens.count({
    where: { accessToken },
  });

  if (revokedTokens) {
    return next(new AppError('Token has already been revoked', 401));
  }

  jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return next(new AppError('Invalid token', 401));
    }

    req.user = user;
    next();
  });
});