import imageCompression from 'browser-image-compression';
import { Area } from 'react-easy-crop';

/**
 * Get the maximum photo size in KB from environment variable
 * @returns Maximum photo size in KB
 */
export function getMaxPhotoKB(): number {
  return parseInt(import.meta.env.VITE_MAX_PHOTO_KB || '100', 10);
}

/**
 * Compress an image file to meet the target size specified in environment variable
 * @param file The image file to compress
 * @returns Compressed file as Blob
 */
export async function compressImage(file: File): Promise<Blob> {
  const maxSizeKB = getMaxPhotoKB();
  const maxSizeMB = maxSizeKB / 1024;

  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.8,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Convert a File or Blob to base64 data URI
 * @param file The file to convert
 * @returns Base64 data URI string
 */
export function convertToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Crop an image using canvas based on crop coordinates from react-easy-crop
 * @param imageSrc The source image (base64 or URL)
 * @param crop The crop area from react-easy-crop
 * @returns Cropped image as Blob
 */
export async function cropImage(imageSrc: string, crop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = crop.width;
      canvas.height = crop.height;
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        'image/jpeg',
        0.95
      );
    };
    image.onerror = () => reject(new Error('Failed to load image'));
  });
}

/**
 * Validate if a string is a valid photo URL (http:// or https://)
 * @param url The URL to validate
 * @returns True if valid URL format
 */
export function isValidPhotoUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url);
}

/**
 * Validate if a string is a valid base64 data URI
 * @param dataUri The data URI to validate
 * @returns True if valid base64 data URI format
 */
export function isValidBase64DataUri(dataUri: string): boolean {
  return /^data:image\/(jpeg|jpg|png|webp|gif);base64,/.test(dataUri);
}

/**
 * Test if a data object can be written to localStorage (for quota checking)
 * @param data The data to test
 * @returns True if write succeeds, throws QuotaExceededError if quota exceeded
 */
export function testLocalStorageWrite(data: any): boolean {
  const testKey = `family-grid:test-${Date.now()}`;
  try {
    localStorage.setItem(testKey, JSON.stringify(data));
    localStorage.removeItem(testKey);
    return true;
  } catch (e: any) {
    if (e.name === 'QuotaExceededError') {
      throw e;
    }
    // For other errors, assume it would fail
    return false;
  }
}

/**
 * Check current localStorage usage percentage
 * @returns Object with usage info, or null if API not supported
 */
export async function checkStorageUsage(): Promise<{
  usagePercent: number;
  usage?: number;
  quota?: number;
} | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage !== undefined && estimate.quota !== undefined) {
        const usagePercent = (estimate.usage / estimate.quota) * 100;
        return {
          usagePercent,
          usage: estimate.usage,
          quota: estimate.quota,
        };
      }
    } catch (error) {
      console.error('Error checking storage usage:', error);
    }
  }
  return null;
}
