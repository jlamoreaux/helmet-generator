/**
 * Server-side development bypass utilities
 * Contains Node.js specific functionality (fs, path, etc.)
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { DevAssets, DevBypassResult } from './devBypass';

/**
 * Check if dev bypass is enabled via environment variable
 */
export function isDevBypassEnabled(): boolean {
  return process.env.USE_DEV_IMAGES === 'true';
}

/**
 * Get the base URL for serving dev assets
 */
export function getDevAssetsBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
}

/**
 * Check which dev assets are available in public/dev/
 */
export async function checkDevAssets(): Promise<DevBypassResult> {
  const devEnabled = isDevBypassEnabled();
  
  if (!devEnabled) {
    return {
      shouldBypass: false,
      availableAssets: {},
      missingAssets: [],
      reason: 'Dev bypass disabled (USE_DEV_IMAGES=false)'
    };
  }

  const devPath = path.join(process.cwd(), 'public/dev');
  const baseUrl = getDevAssetsBaseUrl();
  
  // Define expected dev asset files
  const assetFiles = {
    faceImage: 'face.png',
    helmetImage: 'helmet.png', 
    faceDepthMap: 'face-depth-map.png',
    helmetDepthMap: 'helmet-depth-map.png'
  };

  const availableAssets: DevAssets = {};
  const missingAssets: string[] = [];

  // Check each asset file
  for (const [assetKey, filename] of Object.entries(assetFiles)) {
    // Security: Validate filename to prevent path traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.warn(`Invalid filename detected: ${filename}`);
      missingAssets.push(filename);
      continue;
    }
    
    const filePath = path.join(devPath, filename);
    
    // Security: Ensure the resolved path is still within devPath
    if (!filePath.startsWith(devPath)) {
      console.warn(`Path traversal attempt detected: ${filename}`);
      missingAssets.push(filename);
      continue;
    }
    
    try {
      await fs.access(filePath);
      // File exists, add to available assets
      availableAssets[assetKey as keyof DevAssets] = `${baseUrl}/dev/${filename}`;
    } catch {
      // File doesn't exist
      missingAssets.push(filename);
    }
  }

  // Determine if we should bypass based on what's available
  const hasRequiredAssets = availableAssets.faceImage && availableAssets.helmetImage;
  
  if (hasRequiredAssets) {
    return {
      shouldBypass: true,
      availableAssets,
      missingAssets,
      reason: `Using dev assets: ${Object.keys(availableAssets).join(', ')}`
    };
  } else {
    return {
      shouldBypass: false,
      availableAssets,
      missingAssets,
      reason: `Missing required dev assets: ${missingAssets.filter(f => 
        f === 'face.png' || f === 'helmet.png'
      ).join(', ')}`
    };
  }
}

/**
 * Server-side function to process uploaded image for dev bypass
 * Saves the uploaded face image to public/dev/face.png for consistent dev workflow
 */
export async function saveUploadedImageForDev(imageData: string): Promise<string | null> {
  if (!isDevBypassEnabled()) {
    return null;
  }

  try {
    const devPath = path.join(process.cwd(), 'public/dev');
    
    // Ensure dev directory exists
    try {
      await fs.access(devPath);
    } catch {
      await fs.mkdir(devPath, { recursive: true });
    }

    // Security: Validate base64 image data format
    const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
    if (!base64Regex.test(imageData)) {
      console.warn('Invalid image data format provided');
      return null;
    }
    
    // Extract base64 data and convert to buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Security: Validate base64 string
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
      console.warn('Invalid base64 data provided');
      return null;
    }
    
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Security: Basic file size check (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      console.warn('Image file too large for dev bypass');
      return null;
    }
    
    // Save as face.png (fixed filename for security)
    const facePath = path.join(devPath, 'face.png');
    await fs.writeFile(facePath, buffer);
    
    const baseUrl = getDevAssetsBaseUrl();
    return `${baseUrl}/dev/face.png`;
  } catch (error) {
    console.error('Failed to save uploaded image for dev:', error);
    return null;
  }
}