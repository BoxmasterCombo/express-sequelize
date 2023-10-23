const mime = require('mime-types');
const catchAsync = require('../utils/catchAsync');
const { File } = require('../db');

exports.uploadFile = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Extract file details
  const { originalname, mimetype, size, filename } = req.file;

  // Create a new entry in the database
  const file = await File.create({
    name: originalname,
    extension: mime.extension(mimetype),
    mimeType: mimetype,
    size,
    dateUploaded: new Date(),
    filename,
  });

  res.status(201).json(file);
});