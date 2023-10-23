const express = require('express');
const FileController = require('../controllers/file.controller');
const verifyAccessToken = require("../middleware/verify-access-token");
const upload = require("../multer");

const router = express.Router();
// All routes below this middleware require a valid access token
router.use(verifyAccessToken);

router.post('/upload', upload.single('file'), FileController.uploadFile);

module.exports = router;
