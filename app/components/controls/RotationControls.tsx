"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Button from "../ui/Button";
import { rotateImage } from "../../lib/imageRotation";

interface RotatableAssets {
  faceImage: string;
  helmetImage: string;
  faceDepthMap: string | null;
  helmetDepthMap: string | null;
}

interface RotationControlsProps {
  correctedAssets: RotatableAssets;
  setCorrectedAssets: Dispatch<SetStateAction<RotatableAssets>>;
  faceRotation: number;
  setFaceRotation: (rotation: number | ((prev: number) => number)) => void;
  helmetRotation: number;
  setHelmetRotation: (rotation: number | ((prev: number) => number)) => void;
  originalAssets: RotatableAssets;
}

export default function RotationControls({
  correctedAssets,
  setCorrectedAssets,
  faceRotation,
  setFaceRotation,
  helmetRotation,
  setHelmetRotation,
  originalAssets
}: RotationControlsProps) {
  const [isRotating, setIsRotating] = useState<string | null>(null);

  const rotateFace = async () => {
    setIsRotating('face');
    try {
      const rotated = await rotateImage(correctedAssets.faceImage, 90);
      setCorrectedAssets((prev) => ({ ...prev, faceImage: rotated }));
      setFaceRotation(prev => (prev + 90) % 360);
    } catch (error) {
      console.error('Face rotation failed:', error);
    } finally {
      setIsRotating(null);
    }
  };

  const rotateHelmet = async () => {
    setIsRotating('helmet');
    try {
      const rotated = await rotateImage(correctedAssets.helmetImage, 90);
      setCorrectedAssets((prev) => ({ ...prev, helmetImage: rotated }));
      setHelmetRotation(prev => (prev + 90) % 360);
    } catch (error) {
      console.error('Helmet rotation failed:', error);
    } finally {
      setIsRotating(null);
    }
  };

  const resetRotations = () => {
    setCorrectedAssets(originalAssets);
    setFaceRotation(0); // No automatic rotation
    setHelmetRotation(0);
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
        Image Rotation Correction
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-md font-medium mb-3 text-zinc-900 dark:text-zinc-50">Face Image</h4>
          <div className="flex items-center gap-2">
            <Button
              onClick={rotateFace}
              variant="outline"
              size="sm"
              loading={isRotating === 'face'}
              disabled={!!isRotating}
            >
              🔄 Rotate Face 90°
            </Button>
            <span className="text-sm text-zinc-500">Current: {faceRotation}°</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium mb-3 text-zinc-900 dark:text-zinc-50">Helmet Image</h4>
          <div className="flex items-center gap-2">
            <Button
              onClick={rotateHelmet}
              variant="outline"
              size="sm"
              loading={isRotating === 'helmet'}
              disabled={!!isRotating}
            >
              🔄 Rotate Helmet 90°
            </Button>
            <span className="text-sm text-zinc-500">Current: {helmetRotation}°</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <Button
          onClick={resetRotations}
          variant="outline"
          size="sm"
          disabled={!!isRotating}
        >
          Reset Rotations
        </Button>
      </div>
    </div>
  );
}