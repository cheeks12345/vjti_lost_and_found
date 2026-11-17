const multer = require('multer');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 10 MB' : err.message;
    return res.status(400).json({ message });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Photo is too large. Please choose a smaller one.' });
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Not found' });
  }

  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
};

module.exports = errorHandler;
