import { getToken } from './authUtils';

const SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024,     // 10 MB
  DOCUMENT: 15 * 1024 * 1024,  // 15 MB
  VIDEO: 50 * 1024 * 1024     // 50 MB
};

/**
  Upload a single file to Cloudinary via backend API
  @param {File} file - DOM File object
  @param {String} endpoint - '/api/upload/single' or '/api/upload/avatar'
  @returns {Promise<Object>} Object containing secure Cloudinary URL & metadata
 */
export async function uploadFileToCloudinary(file, endpoint = '/api/upload/single') {
  if (!file) throw new Error('No file selected');

  const mime = file.type;
  const isImage = mime.startsWith('image/');
  const isVideo = mime.startsWith('video/') || mime.startsWith('audio/');
  const isDocument = mime.includes('pdf') || mime.includes('word') || mime.includes('text');

  // Client-side size limit validation
  if (isImage && file.size > SIZE_LIMITS.IMAGE) {
    throw new Error(`Image '${file.name}' exceeds the 10 MB limit (Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
  }

  if (isDocument && file.size > SIZE_LIMITS.DOCUMENT) {
    throw new Error(`Document '${file.name}' exceeds the 15 MB limit (Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
  }

  if (isVideo && file.size > SIZE_LIMITS.VIDEO) {
    throw new Error(`Video '${file.name}' exceeds the 50 MB limit (Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
  }

  const formData = new FormData();
  const fieldName = endpoint.includes('avatar') ? 'avatar' : 'file';
  formData.append(fieldName, file);

  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`http://localhost:5001${endpoint}`, {
    method: 'POST',
    headers,
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload file to Cloudinary');
  }

  return data;
}
