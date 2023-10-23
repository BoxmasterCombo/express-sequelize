const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

// This is a protected route
module.exports = catchAsync(async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  });
});