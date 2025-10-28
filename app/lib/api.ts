import type { ReplicateImageResponse } from './types';

export async function generateHelmet(imageFile: File, description: string): Promise<ReplicateImageResponse> {
  try {
    // Convert image to base64
    const imageData = await fileToBase64(imageFile);

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate helmet');
    }

    const result: ReplicateImageResponse = await response.json();
    
    return result;
  } catch (error) {
    console.error('Error in generateHelmet:', error);
    throw error;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}