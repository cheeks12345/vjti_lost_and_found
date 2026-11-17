const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOptions = {
  folder: 'vjti-lost-found',
  transformation: [{ width: 1080, crop: 'limit', quality: 'auto' }],
};

// Upload an image buffer (from multer) to Cloudinary
const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) =>
      err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });

// Upload a base64 image ("data:image/jpeg;base64,....") sent by the app
const uploadBase64Image = (dataUri) => cloudinary.uploader.upload(dataUri, uploadOptions);

const deleteImage = (publicId) => cloudinary.uploader.destroy(publicId);

// One-time signature so the app can upload a photo directly to Cloudinary
// (the API secret never leaves the server)
const getUploadSignature = () => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = uploadOptions.folder;
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET);
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  };
};

// Only accept image URLs from our own Cloudinary account
const isOwnCloudinaryUrl = (url) =>
  typeof url === 'string' && url.startsWith(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`);

module.exports = { uploadImage, uploadBase64Image, deleteImage, getUploadSignature, isOwnCloudinaryUrl };
