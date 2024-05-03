const multer = require('multer');
const storage = multer.memoryStorage();

const limits = {
  fileSize: 10 * 1024 * 1024,
  files: 10,
};

/**
 * Filters the files based on their extension and returns whether they are valid images.
 *
 * @param {Object} req - The request object.
 * @param {Object} file - The file object.
 * @param {Function} cb - The callback function.
 * @return {void}
 */
const fileFilter = (req, file, cb) => {
  const imageExtensions = /\.(jpeg|jpg|png|gif)$/i;
  const isValidImage = imageExtensions.test(file.originalname);
  cb(
    isValidImage ? null : new Error('Only image files are allowed!'),
    isValidImage,
  );
};

const upload = multer({
  storage: storage,
  limits: limits,
  fileFilter: fileFilter,
});

module.exports = upload;
