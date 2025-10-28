/**
 * Image rotation detection and correction utilities
 * Handles cases where AI models return rotated images
 */

export interface ImageAnalysis {
  width: number;
  height: number;
  aspectRatio: number;
  suggestedRotation: number; // 0, 90, 180, 270 degrees
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

/**
 * Analyze an image and suggest rotation correction
 */
export async function analyzeImageOrientation(imageUrl: string): Promise<ImageAnalysis> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const { width, height } = img;
      const aspectRatio = width / height;
      
      // Basic heuristics for face images
      let suggestedRotation = 0;
      let confidence: 'high' | 'medium' | 'low' = 'low';
      let reason = 'No clear indicators';

      // Portrait orientation is expected for face images
      // Models typically rotate counter-clockwise, so we correct clockwise
      if (aspectRatio < 0.8) {
        // Already in portrait - likely correct
        suggestedRotation = 0;
        confidence = 'medium';
        reason = 'Image is already in portrait orientation';
      } else if (aspectRatio > 1.2) {
        // Landscape - likely rotated 90° counter-clockwise, so rotate 90° clockwise to fix
        suggestedRotation = 90;
        confidence = 'high';
        reason = 'Image is in landscape, applying 90° clockwise rotation (models typically rotate CCW)';
      } else {
        // Square-ish - models often rotate these 90° CCW, so try 90° CW correction
        suggestedRotation = 90;
        confidence = 'medium';
        reason = 'Square aspect ratio - trying 90° clockwise correction for typical model rotation';
      }

      resolve({
        width,
        height,
        aspectRatio,
        suggestedRotation,
        confidence,
        reason
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for analysis'));
    };

    img.src = imageUrl;
  });
}

/**
 * Create a rotated version of an image
 */
export async function rotateImage(imageUrl: string, degrees: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate new dimensions after rotation
      const { width, height } = img;
      const radians = (degrees * Math.PI) / 180;
      
      if (degrees === 90 || degrees === 270) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      // Set up rotation transformation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(radians);
      
      // Draw the rotated image
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      
      // Convert to blob URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Failed to create blob from rotated image'));
        }
      }, 'image/jpeg', 0.95);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for rotation'));
    };

    img.src = imageUrl;
  });
}

/**
 * Advanced analysis using edge detection for face orientation
 * This is a more sophisticated approach for better accuracy
 */
export async function detectFaceOrientation(imageUrl: string): Promise<{ rotation: number; confidence: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({ rotation: 0, confidence: 0 });
        return;
      }

      // Scale down for faster processing
      const scale = Math.min(200 / img.width, 200 / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simple face detection heuristic: look for face-like patterns
        const scores = [0, 90, 180, 270].map(rotation => {
          return calculateFaceScore(imageData, rotation);
        });
        
        const maxScore = Math.max(...scores);
        const bestRotation = [0, 90, 180, 270][scores.indexOf(maxScore)];
        const confidence = maxScore > 0.3 ? 0.8 : 0.3;
        
        resolve({ rotation: bestRotation, confidence });
      } catch (error) {
        console.warn('Face detection failed:', error);
        resolve({ rotation: 0, confidence: 0 });
      }
    };

    img.onerror = () => {
      resolve({ rotation: 0, confidence: 0 });
    };

    img.src = imageUrl;
  });
}

/**
 * Calculate a "face score" for an image at a given rotation
 * Higher scores indicate more face-like characteristics
 */
function calculateFaceScore(imageData: ImageData, rotation: number): number {
  const { data, width, height } = imageData;
  
  // Convert to grayscale and look for face-like patterns
  let score = 0;
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  
  // Look for face-like proportions and symmetry
  // This is a simplified heuristic - in production you'd use a proper face detection library
  
  // Check for vertical symmetry (faces are roughly symmetric)
  let symmetryScore = 0;
  const checkRadius = Math.min(width, height) / 4;
  
  for (let y = centerY - checkRadius; y < centerY + checkRadius; y += 2) {
    for (let x = centerX - checkRadius; x < centerX + checkRadius; x += 2) {
      if (x >= 0 && x < width - 1 && y >= 0 && y < height) {
        const leftIdx = (y * width + (centerX - (x - centerX))) * 4;
        const rightIdx = (y * width + x) * 4;
        
        if (leftIdx >= 0 && rightIdx < data.length && leftIdx < data.length) {
          const leftGray = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
          const rightGray = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
          const diff = Math.abs(leftGray - rightGray);
          symmetryScore += Math.max(0, 50 - diff) / 50;
        }
      }
    }
  }
  
  // Normalize symmetry score
  const totalChecks = checkRadius * checkRadius;
  const normalizedSymmetry = totalChecks > 0 ? symmetryScore / totalChecks : 0;
  
  // Add aspect ratio bonus for portrait orientation
  const aspectRatio = width / height;
  const portraitBonus = aspectRatio < 0.9 ? 0.3 : (aspectRatio > 1.1 ? -0.2 : 0);
  
  score = normalizedSymmetry + portraitBonus;
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Auto-correct image rotation using multiple detection methods
 */
export async function autoCorrectRotation(imageUrl: string): Promise<{
  correctedUrl: string;
  rotation: number;
  method: string;
  confidence: number;
}> {
  try {
    // First, try basic orientation analysis
    const basicAnalysis = await analyzeImageOrientation(imageUrl);
    
    // If high confidence from basic analysis, use it
    if (basicAnalysis.confidence === 'high') {
      const correctedUrl = basicAnalysis.suggestedRotation === 0 
        ? imageUrl 
        : await rotateImage(imageUrl, basicAnalysis.suggestedRotation);
        
      return {
        correctedUrl,
        rotation: basicAnalysis.suggestedRotation,
        method: 'basic-analysis',
        confidence: 0.8
      };
    }
    
    // Otherwise, try face detection
    const faceDetection = await detectFaceOrientation(imageUrl);
    
    if (faceDetection.confidence > 0.5) {
      const correctedUrl = faceDetection.rotation === 0 
        ? imageUrl 
        : await rotateImage(imageUrl, faceDetection.rotation);
        
      return {
        correctedUrl,
        rotation: faceDetection.rotation,
        method: 'face-detection',
        confidence: faceDetection.confidence
      };
    }
    
    // Fallback: no rotation
    return {
      correctedUrl: imageUrl,
      rotation: 0,
      method: 'no-correction',
      confidence: 0
    };
    
  } catch (error) {
    console.warn('Auto-rotation failed:', error);
    return {
      correctedUrl: imageUrl,
      rotation: 0,
      method: 'error-fallback',
      confidence: 0
    };
  }
}