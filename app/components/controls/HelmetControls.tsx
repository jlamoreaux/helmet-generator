"use client";

import Button from "../ui/Button";

interface HelmetControlsProps {
  helmetSize: number;
  setHelmetSize: (size: number) => void;
  helmetX: number;
  setHelmetX: (x: number) => void;
  helmetY: number;
  setHelmetY: (y: number) => void;
  helmetZ: number;
  setHelmetZ: (z: number) => void;
}

export default function HelmetControls({
  helmetSize,
  setHelmetSize,
  helmetX,
  setHelmetX,
  helmetY,
  setHelmetY,
  helmetZ,
  setHelmetZ
}: HelmetControlsProps) {
  const resetToDefault = () => {
    setHelmetSize(2.0);
    setHelmetX(0);
    setHelmetY(0.2);
    setHelmetZ(0.001);
  };

  const copyValues = () => {
    navigator.clipboard.writeText(
      `Size: ${helmetSize}, X: ${helmetX}, Y: ${helmetY}, Z: ${helmetZ}`
    );
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
        Helmet Adjustments
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Size: {helmetSize.toFixed(1)}
            </label>
            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.1"
              value={helmetSize}
              onChange={(e) => setHelmetSize(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              X Position: {helmetX.toFixed(2)}
            </label>
            <input
              type="range"
              min="-1.0"
              max="1.0"
              step="0.05"
              value={helmetX}
              onChange={(e) => setHelmetX(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-600"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Y Position: {helmetY.toFixed(2)}
            </label>
            <input
              type="range"
              min="-1.0"
              max="1.0"
              step="0.05"
              value={helmetY}
              onChange={(e) => setHelmetY(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Z Position: {helmetZ.toFixed(3)}
            </label>
            <input
              type="range"
              min="-0.1"
              max="0.1"
              step="0.001"
              value={helmetZ}
              onChange={(e) => setHelmetZ(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-600"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <Button
          onClick={resetToDefault}
          variant="outline"
          size="sm"
        >
          Reset to Default
        </Button>
        <Button
          onClick={copyValues}
          variant="outline"
          size="sm"
        >
          Copy Values
        </Button>
      </div>
    </div>
  );
}