const bcrypt = require('bcrypt');
const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/appError");
const { createAccessToken, createRefreshToken } = require('../helpers/jwt');
const jwt = require('jsonwebtoken');

const { User, RevokedTokens } = require('../db');

exports.signUp = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  const { id, password } = req.body;

  if (!id || !password) {
    return next(new AppError('Please provide id and password!', 400));
  }

  const user = await User.count({ where: { id } });

  if (user) {
    return next(new AppError('User already exists!', 400));
  }

  // Hash the password before saving it to the database
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ id, password: hashedPassword });

  // Generate and set access and refresh tokens as cookies
  const accessToken = createAccessToken(newUser);
  const refreshToken = createRefreshToken(newUser);

  res.cookie('accessToken', accessToken, { httpOnly: true });
  res.cookie('refreshToken', refreshToken, { httpOnly: true });

  res.status(200).json({
    accessToken,
    refreshToken,
  });
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return next(new AppError('Please provide id and password!', 400));
  }

  const user = await User.findOne({ where: { id } });

  if (!user) {
    return next(new AppError('User does not exist!', 404));
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return next(new AppError('Password is incorrect!', 400));
  }

  // Generate and set access and refresh tokens as cookies
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  res.cookie('accessToken', accessToken, { httpOnly: true });
  res.cookie('refreshToken', refreshToken, { httpOnly: true });

  res.status(200).json({
    accessToken,
    refreshToken,
  });
});

exports.newToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 401));
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return next(new AppError('Invalid refresh token', 403));
    }

    // Generate and set access and refresh tokens as cookies
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    res.status(200).json({
      accessToken,
      refreshToken,
    });
  });
});

exports.getInfo = catchAsync(async (req, res, next) => {
  return res.status(200).json({
    id: req.user.id,
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;

  const decodedAccessToken = jwt.decode(accessToken);
  const decodedRefreshToken = jwt.decode(refreshToken);

  await RevokedTokens.create({
    accessToken,
    refreshToken,
    accessTokenExpiresAt: new Date(decodedAccessToken.exp * 1000),
    refreshTokenExpiresAt: new Date(decodedRefreshToken.exp * 1000),
  }).then(() => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'Logged out successfully' });
  }).catch((err) => {
    console.log(err);
    return next(new AppError('Unable to logout', 500));
  });
});
