"use client";

import { useState, useEffect } from "react";
import HelmetScene from "../components/three/HelmetScene";
import Button from "../components/ui/Button";
import { rotateImage } from "../lib/imageRotation";

export default function DemoPage() {
  const [sceneReady, setSceneReady] = useState(false);
  const [assetStatus, setAssetStatus] = useState<any>(null);
  const [checkingAssets, setCheckingAssets] = useState(true);
  
  // Helmet adjustment controls
  const [helmetSize, setHelmetSize] = useState(2.0);
  const [helmetX, setHelmetX] = useState(0);
  const [helmetY, setHelmetY] = useState(0.2);
  const [helmetZ, setHelmetZ] = useState(0.001);
  
  // Effect adjustment controls
  const [faceDepthScale, setFaceDepthScale] = useState(0.1);
  const [helmetDepthScale, setHelmetDepthScale] = useState(0.15);
  const [cursorAreaSize, setCursorAreaSize] = useState(0.2);
  const [cursorSoftness, setCursorSoftness] = useState(0.1);
  
  
  // Image rotation controls
  const [faceRotation, setFaceRotation] = useState(90); // Fix the 90-degree rotation for face
  const [helmetRotation, setHelmetRotation] = useState(0);
  const [faceDepthRotation, setFaceDepthRotation] = useState(0);
  const [helmetDepthRotation, setHelmetDepthRotation] = useState(0);

  // Demo assets - using real generated URLs for testing
  const originalAssets = {
    faceImage: 'https://replicate.delivery/xezq/eIMfbkWEnmrjsUpRAbYFLNYlMU3TLc0oVh1wSvWrXFAFNcjVA/tmp3ocarqid.png',
    helmetImage: 'https://replicate.delivery/xezq/UF22qwPiLkoyGhl4BxlTGah91jKRu4S8R1ucndiK38GSD3YF/tmp9ef1zrz4.jpg', 
    faceDepthMap: 'https://replicate.delivery/czjl/fRBY17IIXzXcOaLJSmaQR9XKpENWHXQzsXmOL6sjec2MQcjVA/out.png',
    helmetDepthMap: 'https://replicate.delivery/czjl/ExVd6eI15KyzNKSfj3L2IC0khcZvnRMMUq5fEjSqJpHdg4GrA/out.png'
  };

  // Corrected/rotated image states
  const [correctedAssets, setCorrectedAssets] = useState(originalAssets);

  useEffect(() => {
    checkAssets();
  }, []);

  // Apply initial face rotation fix
  useEffect(() => {
    const applyFaceRotation = async () => {
      if (faceRotation > 0) {
        try {
          const rotatedFace = await rotateImage(originalAssets.faceImage, faceRotation);
          setCorrectedAssets(prev => ({
            ...prev,
            faceImage: rotatedFace
          }));
        } catch (error) {
          console.error('Failed to rotate face:', error);
        }
      }
    };
    
    applyFaceRotation();
  }, []); // Run once on mount

  const checkAssets = async () => {
    setCheckingAssets(true);
    try {
      const response = await fetch('/api/check-assets');
      const data = await response.json();
      setAssetStatus(data);
    } catch (error) {
      console.error('Failed to check assets:', error);
      setAssetStatus({ error: 'Failed to check assets' });
    } finally {
      setCheckingAssets(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Helmet Scene Demo
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Testing the 3D interactive helmet scene with local assets
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                Demo Assets Status
              </h2>
              
              {checkingAssets ? (
                <div className="text-center py-4">
                  <p className="text-zinc-500">Checking assets...</p>
                </div>
              ) : assetStatus?.error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200">Error: {assetStatus.error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg ${assetStatus?.allPresent 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                  }`}>
                    <p className={`font-medium ${assetStatus?.allPresent 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {assetStatus?.allPresent ? '✅ All assets found' : '⚠️ Missing assets'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {assetStatus?.files && Object.entries(assetStatus.files).map(([filename, status]: [string, any]) => (
                      <div key={filename} className="flex items-center space-x-2">
                        <span className={status.exists ? 'text-green-600' : 'text-red-600'}>
                          {status.exists ? '✅' : '❌'}
                        </span>
                        <span className="font-mono text-zinc-600 dark:text-zinc-400">{filename}</span>
                        {status.exists && (
                          <span className="text-xs text-zinc-500">({Math.round(status.size / 1024)}KB)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Helmet Adjustment Controls */}
            <div className="mb-6 bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
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
                  onClick={() => {
                    setHelmetSize(2.0);
                    setHelmetX(0);
                    setHelmetY(0.2);
                    setHelmetZ(0.001);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Reset to Default
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Size: ${helmetSize}, X: ${helmetX}, Y: ${helmetY}, Z: ${helmetZ}`
                    );
                  }}
                  variant="outline"
                  size="sm"
                >
                  Copy Values
                </Button>
              </div>
            </div>

            {/* Effects Adjustment Controls */}
            <div className="mb-6 bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
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
                  onClick={() => {
                    setFaceDepthScale(0.1);
                    setHelmetDepthScale(0.15);
                    setCursorAreaSize(0.2);
                    setCursorSoftness(0.1);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Reset Effects
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Face Depth: ${faceDepthScale}, Helmet Depth: ${helmetDepthScale}, Cursor Size: ${cursorAreaSize}, Softness: ${cursorSoftness}`
                    );
                  }}
                  variant="outline"
                  size="sm"
                >
                  Copy Effect Values
                </Button>
              </div>
            </div>

            {/* Image Rotation Controls */}
            <div className="mb-6 bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                Image Rotation Correction
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-md font-medium mb-3 text-zinc-900 dark:text-zinc-50">Face Image</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={async () => {
                        try {
                          const rotated = await rotateImage(correctedAssets.faceImage, 90);
                          setCorrectedAssets(prev => ({ ...prev, faceImage: rotated }));
                          setFaceRotation(prev => (prev + 90) % 360);
                        } catch (error) {
                          console.error('Rotation failed:', error);
                        }
                      }}
                      variant="outline"
                      size="sm"
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
                      onClick={async () => {
                        try {
                          const rotated = await rotateImage(correctedAssets.helmetImage, 90);
                          setCorrectedAssets(prev => ({ ...prev, helmetImage: rotated }));
                          setHelmetRotation(prev => (prev + 90) % 360);
                        } catch (error) {
                          console.error('Rotation failed:', error);
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      🔄 Rotate Helmet 90°
                    </Button>
                    <span className="text-sm text-zinc-500">Current: {helmetRotation}°</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Button
                  onClick={() => {
                    setCorrectedAssets(originalAssets);
                    setFaceRotation(90); // Keep the initial face fix
                    setHelmetRotation(0);
                    setFaceDepthRotation(0);
                    setHelmetDepthRotation(0);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Reset Rotations
                </Button>
              </div>
            </div>

            {/* 3D Scene Container */}
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4 mb-6">
              <div className="w-full h-96 rounded-lg bg-black overflow-hidden relative">
                <HelmetScene
                  originalImage={correctedAssets.faceImage}
                  helmetImage={correctedAssets.helmetImage}
                  faceDepthMap={correctedAssets.faceDepthMap}
                  helmetDepthMap={correctedAssets.helmetDepthMap}
                  helmetSize={helmetSize}
                  helmetX={helmetX}
                  helmetY={helmetY}
                  helmetZ={helmetZ}
                  faceDepthScale={faceDepthScale}
                  helmetDepthScale={helmetDepthScale}
                  cursorAreaSize={cursorAreaSize}
                  cursorSoftness={cursorSoftness}
                  onSceneReady={() => setSceneReady(true)}
                />
              </div>
              
              {/* Scene Status */}
              <div className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {sceneReady ? (
                  <div className="space-y-1">
                    <p className="font-medium text-green-600 dark:text-green-400">
                      ✅ 3D Scene Loaded Successfully
                    </p>
                    <p>Move your cursor around to test the parallax effects</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-medium text-yellow-600 dark:text-yellow-400">
                      ⏳ Loading 3D Scene...
                    </p>
                    <p>Check browser console for detailed loading logs</p>
                  </div>
                )}
              </div>
            </div>

            {/* Debug Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-zinc-50 dark:bg-zinc-700 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Debug Info</h3>
                <div className="space-y-1 text-zinc-600 dark:text-zinc-400 font-mono">
                  <p>Face: {originalAssets.faceImage}</p>
                  <p>Helmet: {originalAssets.helmetImage}</p>
                  <p>Face Depth: {originalAssets.faceDepthMap}</p>
                  <p>Helmet Depth: {originalAssets.helmetDepthMap}</p>
                </div>
              </div>
              
              <div className="bg-zinc-50 dark:bg-zinc-700 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Instructions</h3>
                <div className="space-y-1 text-zinc-600 dark:text-zinc-400">
                  <p>1. Add your test images to public/dev/</p>
                  <p>2. Open browser console (F12)</p>
                  <p>3. Watch for loading logs and errors</p>
                  <p>4. Test mouse movement over the scene</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={checkAssets}
                loading={checkingAssets}
                disabled={checkingAssets}
              >
                🔍 Check Assets
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                🔄 Reload Scene
              </Button>
              <Button 
                onClick={() => window.open('/dev/', '_blank')}
                variant="outline"
              >
                📁 View Dev Assets
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="secondary"
              >
                ← Back to Main App
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}