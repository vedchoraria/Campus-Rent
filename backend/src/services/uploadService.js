import cloudinary from '../config/cloudinary.js';

export const uploadImageToCloudinary = async (file) => {
  if (!file) {
    const error = new Error('Image file is required.');
    error.statusCode = 400;
    throw error;
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'campusrent/listings',
    resource_type: 'image'
  });

  return {
    url: result.secure_url,
    publicId: result.public_id
  };
};
