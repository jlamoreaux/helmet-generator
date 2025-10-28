"use client";

import Button from "../ui/Button";

interface EffectsControlsProps {
  faceDepthScale: number;
  setFaceDepthScale: (scale: number) => void;
  helmetDepthScale: number;
  setHelmetDepthScale: (scale: number) => void;
  cursorAreaSize: number;
  setCursorAreaSize: (size: number) => void;
  cursorSoftness: number;
  setCursorSoftness: (softness: number) => void;
}

export default function EffectsControls({
  faceDepthScale,
  setFaceDepthScale,
  helmetDepthScale,
  setHelmetDepthScale,
  cursorAreaSize,
  setCursorAreaSize,
  cursorSoftness,
  setCursorSoftness,
}: EffectsControlsProps) {
  const resetEffects = () => {
    setFaceDepthScale(0.1);
    setHelmetDepthScale(0.15);
    setCursorAreaSize(0.2);
    setCursorSoftness(0.1);
  };

  const copyEffectValues = () => {
    navigator.clipboard.writeText(
      `Face Depth: ${faceDepthScale}, Helmet Depth: ${helmetDepthScale}, Cursor Size: ${cursorAreaSize}, Softness: ${cursorSoftness}`
    );
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
        Visual Effects
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Face Depth Effect: {faceDepthScale.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.01"
              value={faceDepthScale}
              onChange={(e) => setFaceDepthScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-600"
            />
            <p className="text-xs text-zinc-500 mt-1">How much the face moves with depth</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Helmet Depth Effect: {helmetDepthScale.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.01"
              value={helmetDepthScale}
              onChange={(e) => setHelmetDepthScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-600"
            />
            <p className="text-xs text-zinc-500 mt-1">How much the helmet moves with depth</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Cursor Area Size: {cursorAreaSize.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.05"
              max="0.8"
              step="0.05"
              value={cursorAreaSize}
              onChange={(e) => setCursorAreaSize(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-600"
            />
            <p className="text-xs text-zinc-500 mt-1">Size of the helmet reveal area</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Cursor Edge Softness: {cursorSoftness.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.01"
              max="0.3"
              step="0.01"
              value={cursorSoftness}
              onChange={(e) => setCursorSoftness(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-600"
            />
            <p className="text-xs text-zinc-500 mt-1">How soft the helmet edges are</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <Button
          onClick={resetEffects}
          variant="outline"
          size="sm"
        >
          Reset Effects
        </Button>
        <Button
          onClick={copyEffectValues}
          variant="outline"
          size="sm"
        >
          Copy Effect Values
        </Button>
      </div>
    </div>
  );
}