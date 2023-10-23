const jwt = require('jsonwebtoken');

// Helper function for creating an access token
const createAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN });
};

// Helper function for creating a refresh token
const createRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN });
};

module.exports = { createAccessToken, createRefreshToken };