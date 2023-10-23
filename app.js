const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const cors = require('cors');

// Initialize database
require('./db');
require('./cron/cron');

const GlobalErrorHandler = require('./controllers/error.controller');

const AuthRouter = require('./routes/auth.router');
const FileRouter = require('./routes/file.router');

const app = express();

app.enable('trust proxy');

app.use('/uploads', express.static('uploads'));

app.use(morgan('dev'));
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));
// Set Security HTTP headers
app.use(helmet());
// Body parser, reading data from body into req.body
app.use(bodyParser.json());
app.use(express.json({limit: '10kb',}));
app.use(express.urlencoded({extended: true, limit: '10kb',}));
app.use(cookieParser());
app.use(
  expressSession({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
  })
);

// Routes
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/file', FileRouter);

app.all('*', (req, res, next) => {
    console.log(`Can't find ${req.originalUrl} on this server!`);
    next();
});

app.use(GlobalErrorHandler);

module.exports = app;