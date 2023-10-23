const fs = require('fs');
const path = require('path');
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

exports.listFiles = catchAsync(async (req, res) => {
  const { list_size = 10, page = 1 } = req.query;

  const files = await File.findAll({
    limit: list_size,
    offset: (page - 1) * list_size,
  });

  res.status(200).json(files);
});

exports.getFile = catchAsync(async (req, res) => {
  const { id } = req.params;

  const file = await File.findByPk(id);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.status(200).json(file);
});

exports.deleteFile = catchAsync(async (req, res) => {
  const { id } = req.params;

  const file = await File.findByPk(id);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  await file.destroy();

  fs.unlinkSync(path.join(__dirname, `../uploads/${file.filename}`));

  res.status(204).json({
    message: 'File deleted successfully',
  });
});