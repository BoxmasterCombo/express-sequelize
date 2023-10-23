const express = require('express');
const AuthController = require('../controllers/auth.controller');
const verifyAccessToken = require("../middleware/verify-access-token");

const router = express.Router();

router.post('/signup', AuthController.signUp);
router.post('/signin', AuthController.signIn);
router.post('/signin/new_token', AuthController.newToken);

// All routes below this middleware require a valid access token
router.use(verifyAccessToken);

router.get('/info', AuthController.getInfo);
router.get('/logout', AuthController.logout);

module.exports = router;
