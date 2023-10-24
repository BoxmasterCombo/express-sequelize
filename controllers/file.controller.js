const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const catchAsync = require('../utils/catchAsync');
const { File } = require('../db');
const AppError = require("../utils/appError");

exports.uploadFile = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
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

exports.deleteFile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const file = await File.findByPk(id);

  if (!file) {
    return next(new AppError('File not found', 404));
  }

  await file.destroy();

  const existingFilePath = path.join(__dirname, `../uploads/${file.filename}`);
  fs.existsSync(existingFilePath) && fs.unlinkSync(path.join(__dirname, `../uploads/${file.filename}`));

  res.status(204).json({
    message: 'File deleted successfully',
  });
});

exports.getFile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const file = await File.findByPk(id);

  if (!file) {
    return next(new AppError('File not found', 404));
  }

  res.status(200).json(file);
});

exports.downloadFile = catchAsync(async (req, res, next) => {
  const fileId = req.params.id;

  // Retrieve file information from the database based on the ID
  const file = await File.findByPk(fileId);

  if (!file) {
    return next(new AppError('File not found', 404));
  }

  const filePath = 'uploads/' + file.filename;

  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.name}.${file.extension}"`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

exports.updateFile = catchAsync(async (req, res, next) => {
  const fileId = req.params.id;

  if (!req.file) {
    // res.status(400).json({ error: 'No file uploaded' });
    return next(new AppError('No file uploaded', 400));
  }

  // Retrieve file information from the database based on the ID
  const file = await File.findByPk(fileId);

  if (!file) {
   return next(new AppError('File not found', 404));
  }

  // Remove the existing document from local storage
  const existingFilePath = 'uploads/' + file.filename;
  fs.existsSync(existingFilePath) && fs.unlinkSync(existingFilePath);

  // Update the database entry with new file details
  const { originalname, mimetype, size, filename } = req.file;
  file.name = originalname;
  file.extension = mime.extension(mimetype);
  file.mimeType = mimetype;
  file.size = size;
  file.filename = filename;

  await file.save();

  res.status(200).json(file);
});