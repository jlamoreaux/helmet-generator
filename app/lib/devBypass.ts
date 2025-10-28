/**
 * Development bypass utilities for using local images instead of AI generation
 * This file contains client-safe functions only
 */

export interface DevAssets {
  faceImage?: string;
  helmetImage?: string;
  faceDepthMap?: string;
  helmetDepthMap?: string;
}

export interface DevBypassResult {
  shouldBypass: boolean;
  availableAssets: DevAssets;
  missingAssets: string[];
  reason: string;
}

/**
 * Get the base URL for serving dev assets (client-safe version)
 */
export function getDevAssetsBaseUrl(): string {
  // On client side, we can only access NEXT_PUBLIC_ env vars
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
}

// Server-side functions are moved to a separate file to avoid fs imports in client code

/**
 * Client-side function to check dev assets availability
 */
export async function checkDevAssetsClient(): Promise<DevBypassResult> {
  // On client side, we can't directly check env vars, so always check the API
  // The API will handle the USE_DEV_IMAGES check

  try {
    const response = await fetch('/api/check-dev-assets');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to check dev assets:', error);
    return {
      shouldBypass: false,
      availableAssets: {},
      missingAssets: [],
      reason: 'Failed to check dev assets'
    };
  }
}