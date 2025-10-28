"use client";

import { useState, useEffect } from "react";
import HelmetScene from "./three/HelmetScene";
import Button from "./ui/Button";
import HelmetControls from "./controls/HelmetControls";
import EffectsControls from "./controls/EffectsControls";
import RotationControls from "./controls/RotationControls";
import { generateHelmetZip } from "../lib/zipGenerator";
import { rotateImage } from "../lib/imageRotation";

interface ResultsDisplayProps {
  originalImage: File | null;
  processedFaceImage: string | null;
  generatedHelmet: string | null;
  faceDepthMap: string | null;
  helmetDepthMap: string | null;
  description: string;
  onStartOver: () => void;
}

export default function ResultsDisplay({
  originalImage,
  processedFaceImage,
  generatedHelmet,
  faceDepthMap,
  helmetDepthMap,
  description,
  onStartOver
}: ResultsDisplayProps) {
  const [sceneReady, setSceneReady] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

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
  
  // Helmet reveal trail controls
  const [trailLength, setTrailLength] = useState(5);
  const [trailSpeed, setTrailSpeed] = useState(0.8);
  
  // Image rotation controls 
  const [faceRotation, setFaceRotation] = useState(0); // Disable again to isolate issue
  const [helmetRotation, setHelmetRotation] = useState(0);
  const [faceDepthRotation, setFaceDepthRotation] = useState(0);
  const [helmetDepthRotation, setHelmetDepthRotation] = useState(0);

  // Original assets
  const originalAssets = {
    faceImage: processedFaceImage || '',
    helmetImage: generatedHelmet || '',
    faceDepthMap: faceDepthMap,
    helmetDepthMap: helmetDepthMap
  };

  // Corrected/rotated image states
  const [correctedAssets, setCorrectedAssets] = useState(originalAssets);

  // Update corrected assets when props change
  useEffect(() => {
    setCorrectedAssets({
      faceImage: processedFaceImage || '',
      helmetImage: generatedHelmet || '',
      faceDepthMap: faceDepthMap,
      helmetDepthMap: helmetDepthMap
    });
  }, [processedFaceImage, generatedHelmet, faceDepthMap, helmetDepthMap]);

  // Preload all images before rendering HelmetScene
  useEffect(() => {
    const preloadImages = async () => {
      if (!processedFaceImage || !generatedHelmet) return;
      
      console.log('🖼️ Preloading images before HelmetScene...');
      setImagesLoaded(false);
      
      try {
        const imagesToLoad = [processedFaceImage, generatedHelmet];
        if (faceDepthMap) imagesToLoad.push(faceDepthMap);
        if (helmetDepthMap) imagesToLoad.push(helmetDepthMap);
        
        const imagePromises = imagesToLoad.map(src => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // For CORS
            img.onload = () => {
              console.log(`✅ Loaded: ${src.substring(0, 50)}...`);
              resolve(img);
            };
            img.onerror = () => {
              console.error(`❌ Failed to load: ${src.substring(0, 50)}...`);
              reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
          });
        });
        
        await Promise.all(imagePromises);
        console.log('🎉 All images preloaded successfully!');
        setImagesLoaded(true);
        
      } catch (error) {
        console.error('❌ Image preloading failed:', error);
        // Still allow rendering even if some images fail
        setImagesLoaded(true);
      }
    };
    
    preloadImages();
  }, [processedFaceImage, generatedHelmet, faceDepthMap, helmetDepthMap]);

  // Apply face rotation after images are preloaded
  useEffect(() => {
    const applyRotation = async () => {
      if (faceRotation > 0 && imagesLoaded && processedFaceImage) {
        try {
          console.log('🔄 Applying face rotation after preload:', faceRotation);
          const rotatedFace = await rotateImage(processedFaceImage, faceRotation);
          setCorrectedAssets(prev => ({
            ...prev,
            faceImage: rotatedFace
          }));
        } catch (error) {
          console.error('❌ Face rotation failed:', error);
        }
      }
    };
    
    if (imagesLoaded && faceRotation > 0) {
      applyRotation();
    }
  }, [imagesLoaded]); // Only run when images finish preloading

  const handleDownload = async () => {
    if (!originalImage || !generatedHelmet) return;

    setIsGeneratingZip(true);
    try {
      await generateHelmetZip({
        originalImage,
        helmetImageUrl: generatedHelmet,
        faceDepthMapUrl: faceDepthMap,
        helmetDepthMapUrl: helmetDepthMap,
        description
      });
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate download. Please try again.');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  // Debug logging
  console.log('🔍 ResultsDisplay render state:', {
    processedFaceImage: !!processedFaceImage,
    generatedHelmet: !!generatedHelmet,
    imagesLoaded,
    correctedAssets,
    faceRotation
  });

  // Validation - simplified, ignore preloading for now
  if (!processedFaceImage || !generatedHelmet) {
    console.log('⏳ Still waiting:', { 
      hasProcessedFace: !!processedFaceImage, 
      hasGeneratedHelmet: !!generatedHelmet, 
      imagesLoaded 
    });
    return (
      <div className="text-center text-zinc-500 dark:text-zinc-400 py-8">
        <p>{!imagesLoaded ? 'Preloading images...' : 'Loading your interactive helmet...'}</p>
        <div className="mt-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
          Your Interactive Helmet
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Move your cursor around to see the 3D effect
        </p>
      </div>

      {/* Interactive 3D Canvas */}
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-8 mb-8">
        <div className="w-full h-96 rounded-lg bg-black overflow-hidden relative">
          <HelmetScene
            key={`${processedFaceImage}-${generatedHelmet}`}
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
            trailLength={trailLength}
            trailSpeed={trailSpeed}
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
              <p>Setting up your interactive helmet experience</p>
            </div>
          )}
        </div>
        
        {/* Controls Toggle */}
        <div className="mt-4 text-center">
          <Button
            onClick={() => setShowControls(!showControls)}
            variant="outline"
            size="sm"
          >
            {showControls ? '🔽 Hide Controls' : '🔧 Show Adjustment Controls'}
          </Button>
        </div>
      </div>

      {/* Collapsible Controls Section */}
      {showControls && (
        <div className="space-y-6 mb-8">
          <HelmetControls
            helmetSize={helmetSize}
            setHelmetSize={setHelmetSize}
            helmetX={helmetX}
            setHelmetX={setHelmetX}
            helmetY={helmetY}
            setHelmetY={setHelmetY}
            helmetZ={helmetZ}
            setHelmetZ={setHelmetZ}
          />
          
          <EffectsControls
            faceDepthScale={faceDepthScale}
            setFaceDepthScale={setFaceDepthScale}
            helmetDepthScale={helmetDepthScale}
            setHelmetDepthScale={setHelmetDepthScale}
            cursorAreaSize={cursorAreaSize}
            setCursorAreaSize={setCursorAreaSize}
            cursorSoftness={cursorSoftness}
            setCursorSoftness={setCursorSoftness}
          />
          
          <RotationControls
            correctedAssets={correctedAssets}
            setCorrectedAssets={setCorrectedAssets}
            faceRotation={faceRotation}
            setFaceRotation={setFaceRotation}
            helmetRotation={helmetRotation}
            setHelmetRotation={setHelmetRotation}
            faceDepthRotation={faceDepthRotation}
            setFaceDepthRotation={setFaceDepthRotation}
            helmetDepthRotation={helmetDepthRotation}
            setHelmetDepthRotation={setHelmetDepthRotation}
            originalAssets={originalAssets}
          />
        </div>
      )}

      {/* Description */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Design Description
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
          {description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          onClick={handleDownload}
          loading={isGeneratingZip}
          disabled={isGeneratingZip || !sceneReady}
          size="lg"
        >
          {isGeneratingZip ? "Generating..." : "📦 Download Complete Package"}
        </Button>
        
        <Button
          onClick={onStartOver}
          variant="outline"
          size="lg"
        >
          🔄 Create Another Helmet
        </Button>
      </div>
    </div>
  );
}