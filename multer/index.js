const fs = require('fs');
const multer = require('multer');
const mime = require('mime-types');

// Function to create the 'uploads' directory if it doesn't exist
const createUploadsDirectory = () => {
  const uploadsDirectory = 'uploads';

  if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory);
  }
};

createUploadsDirectory();

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = mime.extension(file.mimetype);
    const filename = Date.now() + '.' + ext;
    cb(null, filename);
  },
});

const upload = multer({ storage });

module.exports = upload;