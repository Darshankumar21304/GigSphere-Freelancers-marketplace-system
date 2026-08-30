const { uploadToCloudinary } = require('../config/cloudinary');
const { User } = require('../models');

// Helper to determine Cloudinary target folder & resource type
const getCloudinaryOptions = (file, customFolder = null) => {
  const mime = file.mimetype;
  let folder = customFolder || 'gigsphere/uploads';
  let resource_type = 'auto';

  if (mime.startsWith('image/')) {
    folder = customFolder || 'gigsphere/images';
    resource_type = 'image';
  } else if (mime.startsWith('video/') || mime.startsWith('audio/')) {
    folder = customFolder || 'gigsphere/videos';
    resource_type = 'video';
  } else if (mime.includes('pdf') || mime.includes('word') || mime.includes('text')) {
    folder = customFolder || 'gigsphere/documents';
    resource_type = 'raw';
  }

  return { folder, resource_type };
};

// 1. Single File Upload to Cloudinary
exports.uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided for upload' });
    }

    const { folder, resource_type } = getCloudinaryOptions(req.file);

    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      resource_type
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format || req.file.mimetype.split('/')[1],
      resourceType: result.resource_type,
      bytes: result.bytes,
      originalName: req.file.originalname,
      message: 'File uploaded to Cloudinary successfully'
    });
  } catch (error) {
    console.error('Single Cloudinary upload error:', error);
    res.status(500).json({ message: error.message || 'Error uploading file to Cloudinary' });
  }
};

// 2. Multiple Files Upload to Cloudinary
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files provided for upload' });
    }

    const uploadPromises = req.files.map(file => {
      const { folder, resource_type } = getCloudinaryOptions(file);
      return uploadToCloudinary(file.buffer, { folder, resource_type }).then(result => ({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format || file.mimetype.split('/')[1],
        resourceType: result.resource_type,
        bytes: result.bytes,
        originalName: file.originalname
      }));
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      success: true,
      files: uploadedFiles,
      count: uploadedFiles.length,
      message: 'All files uploaded to Cloudinary successfully'
    });
  } catch (error) {
    console.error('Multiple Cloudinary upload error:', error);
    res.status(500).json({ message: error.message || 'Error uploading multiple files to Cloudinary' });
  }
};

// 3. User Avatar Profile Photo Upload
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided for avatar update' });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Avatar file must be an image (JPG, PNG, WEBP, GIF)' });
    }

    // Upload with face-centered crop transformation
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'gigsphere/avatars',
      resource_type: 'image',
      transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }]
    });

    // Update avatar URL in Mongo DB if user is authenticated
    if (req.user && req.user.id) {
      await User.findByIdAndUpdate(req.user.id, { avatar: result.secure_url, profilePhoto: result.secure_url });
    }

    res.json({
      success: true,
      avatarUrl: result.secure_url,
      publicId: result.public_id,
      message: 'Profile photo updated successfully on Cloudinary!'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: error.message || 'Error updating profile photo' });
  }
};
