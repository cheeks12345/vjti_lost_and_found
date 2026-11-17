import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { api } from '../api/client';

// 1. Shrink the photo (phone photos are 5-15 MB) to max 1080px JPEG (~150 KB)
async function compressToBase64(asset) {
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > 1080) context.resize({ width: 1080, height: null });
  const image = await context.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.6, base64: true });
  return `data:image/jpeg;base64,${result.base64}`;
}

// 2. Upload it straight from the phone to Cloudinary using a signature from our backend.
//    The photo never passes through the backend, so it's fast and reliable.
export async function uploadImage(asset) {
  const file = await compressToBase64(asset);
  const sig = await api.get('/items/upload-signature');

  let res;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        file,
        api_key: sig.apiKey,
        timestamp: sig.timestamp,
        signature: sig.signature,
        folder: sig.folder,
      }),
    });
  } catch (err) {
    console.log('Cloudinary upload failed:', err?.message);
    throw new Error('Photo upload failed. Check your internet connection and try again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.log('Cloudinary error:', data);
    throw new Error(data.error?.message || 'Photo upload failed');
  }
  return { url: data.secure_url, publicId: data.public_id };
}
