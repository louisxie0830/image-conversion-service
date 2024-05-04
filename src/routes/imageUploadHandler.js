const upload = require('../middleware/multerConfig');
const archiver = require('archiver');
const sharp = require('sharp');
const path = require('path');

/**
 * Compresses an image buffer to JPEG format with specified quality.
 *
 * @param {string} conversionImage - The type of image conversion to perform.
 * @param {Object} file - The file object containing the image buffer.
 * @return {Buffer} The compressed image buffer.
 */
const compressImage = async (conversionImage, file) => {
  try {
    switch (conversionImage.toLowerCase()) {
      case 'jpeg':
        return await sharp(file.buffer).jpeg({ quality: 50 }).toBuffer();
      case 'png':
        return await sharp(file.buffer).png({ compressionLevel: 9 }).toBuffer();
      case 'webp':
        return await sharp(file.buffer).webp({ quality: 80 }).toBuffer();
      case 'gif':
        return await sharp(file.buffer).gif({ quality: 80 }).toBuffer();
      case 'avif':
        return await sharp(file.buffer).avif({ quality: 50 }).toBuffer();
      case 'tiff':
        return await sharp(file.buffer).tiff({ quality: 50 }).toBuffer();
      default:
        throw new Error('Unsupported image format');
    }
  } catch (error) {
    throw new Error('Failed to compress image');
  }
};
/**
 * Generates a safe file name by appending the current timestamp, a random
 * number, and the file extension.
 *
 * @param {string} originalName - The original name of the file.
 * @return {string} The safe file name.
 */
const getSafeFileName = (originalName) => {
  const timestamp = Date.now().toString();
  const randomNumber = Math.round(Math.random() * 1e9).toString();
  const fileExtension = path.extname(originalName);

  return `${timestamp}-${randomNumber}${fileExtension}`;
};

/**
 * Handles the upload of images, compresses and archives them.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const imageUploadHandler = (req, res) => {
  upload.array('images', Number.MAX_SAFE_INTEGER)(req, res, async (error) => {
    if (error) {
      return res.status(500).send('Error uploading files');
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="compressed_images.zip"',
    );

    const archive = archiver('zip');
    archive.pipe(res);

    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.warn('Archiving warning:', err);
      } else {
        throw err;
      }
    });

    archive.on('error', function (err) {
      res.status(500).send('Failed to create archive');
    });

    try {
      for (const file of req.files) {
        const compressedBuffer = await compressImage(
          file.mimetype.replace('image/', ''),
          file,
        );
        if (!compressedBuffer || !(compressedBuffer instanceof Buffer)) {
          console.error(
            'Invalid or missing buffer for file:',
            file.originalname,
          );
          continue; // Skip this file or handle the error appropriately
        }
        archive.append(compressedBuffer, {
          name: `compressed-${getSafeFileName(file.originalname)}`,
        });
      }

      await archive.finalize();
    } catch (error) {
      res.status(500).send('Failed to process images');
    }
  });
};

module.exports = { imageUploadHandler };
