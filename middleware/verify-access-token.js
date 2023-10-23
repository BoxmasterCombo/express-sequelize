const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { RevokedTokens } = require('../db');

// This is a protected route
module.exports = catchAsync(async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if token has been revoked
  const revokedTokens = await RevokedTokens.findOne({
    where: { accessToken },
  });

  if (revokedTokens) {
    return res.status(401).json({ error: 'Token has already been revoked' });
  }

  jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  });
});