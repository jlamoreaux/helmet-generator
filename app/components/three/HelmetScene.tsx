"use client";

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { 
  blobMaskVertexShader, 
  blobMaskFragmentShader,
  depthParallaxVertexShader,
  depthParallaxFragmentShader 
} from './shaders';
import { rotateImage, analyzeImageOrientation } from '../../lib/imageRotation';

interface HelmetSceneProps {
  originalImage: File | string;
  helmetImage: string;
  faceDepthMap: string | null;
  helmetDepthMap: string | null;
  onSceneReady?: () => void;
  // Helmet adjustment props
  helmetSize?: number;
  helmetX?: number;
  helmetY?: number;
  helmetZ?: number;
  // Effect adjustment props
  faceDepthScale?: number;
  helmetDepthScale?: number;
  cursorAreaSize?: number;
  cursorSoftness?: number;
  // Cursor trail props (hardcoded defaults, no UI controls)
  trailLength?: number;
  trailSpeed?: number;
}

export default function HelmetScene({
  originalImage,
  helmetImage,
  faceDepthMap,
  helmetDepthMap,
  onSceneReady,
  helmetSize = 2.0,
  helmetX = 0,
  helmetY = 0.2,
  helmetZ = 0.001,
  faceDepthScale = 0.1,
  helmetDepthScale = 0.15,
  cursorAreaSize = 0.2,
  cursorSoftness = 0.1,
  trailLength = 5,
  trailSpeed = 0.8
}: HelmetSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const mousePrevRef = useRef({ x: 0, y: 0 });
  const mouseVelocityRef = useRef(0);
  const mouseDirectionRef = useRef({ x: 0, y: 0 });
  const trailPositionsRef = useRef<Array<{ x: number, y: number, time: number }>>([]);
  const [currentTrailPositions, setCurrentTrailPositions] = useState<Array<{ x: number, y: number, time: number }>>([]);
  const [mouseInitialized, setMouseInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track processed assets with fresh blob URLs (like demo does)
  const [processedAssets, setProcessedAssets] = useState<{
    faceImage: string | null;
    helmetImage: string | null;
  }>({ faceImage: null, helmetImage: null });

  
  // Process assets: auto-detect rotation and create fresh blob URLs
  useEffect(() => {
    const processAssets = async () => {
      try {
        // Process face image with rotation detection
        const faceUrl = typeof originalImage === 'string' ? originalImage : URL.createObjectURL(originalImage);
        
        const faceAnalysis = await analyzeImageOrientation(faceUrl);
        
        // Apply suggested rotation or minimal processing for fresh blob URL
        const faceRotation = faceAnalysis.confidence === 'high' ? faceAnalysis.suggestedRotation : 0;
        const processedFace = await rotateImage(faceUrl, faceRotation);
        
        // Process helmet image - minimal processing for fresh blob URL
        const processedHelmet = await rotateImage(helmetImage, 0);
        
        setProcessedAssets({
          faceImage: processedFace,
          helmetImage: processedHelmet
        });
        
        
        // Clean up temporary object URL if created
        if (typeof originalImage !== 'string') {
          URL.revokeObjectURL(faceUrl);
        }
      } catch (error) {
        console.error('❌ Failed to process assets:', error);
        // Fallback to minimal processing for fresh blob URLs
        try {
          const faceUrl = typeof originalImage === 'string' ? originalImage : URL.createObjectURL(originalImage);
          const fallbackFace = await rotateImage(faceUrl, 0);
          const fallbackHelmet = await rotateImage(helmetImage, 0);
          
          setProcessedAssets({
            faceImage: fallbackFace,
            helmetImage: fallbackHelmet
          });
        } catch (fallbackError) {
          console.error('❌ Fallback processing failed:', fallbackError);
          setIsLoading(false);
        }
      }
    };
    
    processAssets();
  }, [originalImage, helmetImage]);
  
  // Main scene effect - rebuilds when processed assets are ready
  useEffect(() => {
    // Wait for processed assets to be ready
    if (!processedAssets.faceImage || !processedAssets.helmetImage) {
      return;
    }
    
    if (!mountRef.current) return;

    initializeScene();
    
    // Handle async asset loading properly
    loadAssets().catch((error) => {
      console.error('Failed to load 3D assets:', error);
      setIsLoading(false);
    });

    return () => {
      cleanup();
    };
  }, [processedAssets.faceImage, processedAssets.helmetImage, faceDepthMap, helmetDepthMap]); // Rebuild when processed assets change

  // Effect for cursor area and softness - updates shader uniforms without rebuilding
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const helmetMesh = sceneRef.current.getObjectByName('helmet') as THREE.Mesh;
    if (helmetMesh && helmetMesh.material instanceof THREE.ShaderMaterial) {
      helmetMesh.material.uniforms.uMaskSoftness.value = cursorSoftness;
    }
  }, [cursorSoftness]);

  // Store cursorAreaSize in a ref so updateScene can access current value
  const cursorAreaSizeRef = useRef(cursorAreaSize);
  useEffect(() => {
    cursorAreaSizeRef.current = cursorAreaSize;
  }, [cursorAreaSize]);


  // Effect for helmet position and size - updates mesh transform without rebuilding
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const helmetMesh = sceneRef.current.getObjectByName('helmet') as THREE.Mesh;
    if (helmetMesh) {
      helmetMesh.position.set(helmetX, helmetY, helmetZ);
      helmetMesh.scale.set(helmetSize / 2.0, helmetSize / 2.0, 1);
    }
  }, [helmetX, helmetY, helmetZ, helmetSize]);

  // Effect for depth scales - updates shader uniforms without rebuilding
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const faceMesh = sceneRef.current.getObjectByName('face') as THREE.Mesh;
    const helmetMesh = sceneRef.current.getObjectByName('helmet') as THREE.Mesh;
    
    if (faceMesh && faceMesh.material instanceof THREE.ShaderMaterial) {
      faceMesh.material.uniforms.uDepthScale.value = faceDepthScale;
    }
    
    if (helmetMesh && helmetMesh.material instanceof THREE.ShaderMaterial) {
      helmetMesh.material.uniforms.uDepthScale.value = helmetDepthScale;
    }
  }, [faceDepthScale, helmetDepthScale]);

  const initializeScene = () => {
    if (!mountRef.current) {
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Mouse tracking with velocity calculation and trail
    const handleMouseMove = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Initialize mouse position on first move
      if (!mouseInitialized) {
        setMouseInitialized(true);
      }

      // Store previous position
      mousePrevRef.current.x = mouseRef.current.x;
      mousePrevRef.current.y = mouseRef.current.y;

      // Update current position
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Calculate velocity and direction
      const dx = mouseRef.current.x - mousePrevRef.current.x;
      const dy = mouseRef.current.y - mousePrevRef.current.y;
      mouseVelocityRef.current = Math.sqrt(dx * dx + dy * dy);
      
      // Store normalized movement direction
      if (mouseVelocityRef.current > 0.001) {
        mouseDirectionRef.current.x = dx / mouseVelocityRef.current;
        mouseDirectionRef.current.y = dy / mouseVelocityRef.current;
      }

      // Update trail positions - only add if movement is significant
      const currentTime = Date.now();
      const lastPosition = trailPositionsRef.current[0];
      
      // Only add new position if we've moved enough or enough time has passed
      const shouldAddPosition = !lastPosition || 
        Math.sqrt(
          Math.pow(mouseRef.current.x - lastPosition.x, 2) + 
          Math.pow(mouseRef.current.y - lastPosition.y, 2)
        ) > 0.02 || 
        (currentTime - lastPosition.time) > 50; // 50ms minimum interval
      
      if (shouldAddPosition) {
        const newTrail = [
          { x: mouseRef.current.x, y: mouseRef.current.y, time: currentTime },
          ...trailPositionsRef.current.filter(pos => currentTime - pos.time < 1000) // Keep positions for 1 second
        ].slice(0, trailLength);
        
        trailPositionsRef.current = newTrail;
        setCurrentTrailPositions([...newTrail]);
      }
    };

    mountRef.current.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let frameCount = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      updateScene();
      renderer.render(scene, camera);
      
      // Log every 60 frames (roughly every 1 second at 60fps)
      frameCount++;
      if (frameCount % 60 === 0) {
      }
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
  };

  const loadAssets = async () => {
    setIsLoading(true);
    
    try {
      const textureLoader = new THREE.TextureLoader();
      // Enable CORS for external URLs
      textureLoader.setCrossOrigin('anonymous');
      
      // Helper function to load texture with timeout
      const loadTextureWithTimeout = (url: string, timeoutMs = 10000): Promise<THREE.Texture> => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Texture loading timeout: ${url}`));
          }, timeoutMs);
          
          textureLoader.load(
            url, 
            (texture) => {
              clearTimeout(timeout);
              resolve(texture);
            },
            undefined,
            (error) => {
              console.error(`Failed to load texture: ${url}`, error);
              clearTimeout(timeout);
              reject(error);
            }
          );
        });
      };
      
      // Load processed face image (fresh blob URL)
      const faceTexture = await loadTextureWithTimeout(processedAssets.faceImage!);

      // Load processed helmet texture (fresh blob URL)
      const helmetTexture = await loadTextureWithTimeout(processedAssets.helmetImage!);

      // Load depth maps if available
      let faceDepthTexture: THREE.Texture | null = null;
      let helmetDepthTexture: THREE.Texture | null = null;

      if (faceDepthMap) {
        try {
          faceDepthTexture = await loadTextureWithTimeout(faceDepthMap);
        } catch (error) {
          console.warn('Failed to load face depth map:', error);
          console.warn('Face depth map URL was:', faceDepthMap);
        }
      }

      if (helmetDepthMap) {
        try {
          helmetDepthTexture = await loadTextureWithTimeout(helmetDepthMap);
        } catch (error) {
          console.warn('Failed to load helmet depth map:', error);
          console.warn('Helmet depth map URL was:', helmetDepthMap);
        }
      }

      createDepthBasedMeshes(faceTexture, helmetTexture, faceDepthTexture, helmetDepthTexture);
      
      setIsLoading(false);
      onSceneReady?.();
    } catch (error) {
      console.error('Error loading assets:', error);
      setIsLoading(false);
    }
  };

  const createDepthBasedMeshes = (
    faceTexture: THREE.Texture,
    helmetTexture: THREE.Texture,
    faceDepthTexture: THREE.Texture | null,
    helmetDepthTexture: THREE.Texture | null
  ) => {
    
    if (!sceneRef.current) {
      console.error('❌ Scene not available for mesh creation');
      return;
    }

    const scene = sceneRef.current;
    
    // Clear any existing meshes to prevent duplicates
    const existingFace = scene.getObjectByName('face');
    const existingHelmet = scene.getObjectByName('helmet');
    if (existingFace) {
      scene.remove(existingFace);
    }
    if (existingHelmet) {
      scene.remove(existingHelmet);
    }

    // Calculate aspect ratios to prevent squishing
    const faceAspect = faceTexture.image.width / faceTexture.image.height;
    const helmetAspect = helmetTexture.image.width / helmetTexture.image.height;

    // Create face plane with correct aspect ratio and no background artifacts
    const faceGeometry = new THREE.PlaneGeometry(2 * faceAspect, 2, 128, 128);
    const faceMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: faceTexture },
        uDepthMap: { value: faceDepthTexture },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uTime: { value: 0 },
        uDepthScale: { value: faceDepthTexture ? faceDepthScale : 0 }
      },
      vertexShader: depthParallaxVertexShader,
      fragmentShader: depthParallaxFragmentShader,
      transparent: true,
      alphaTest: 0.1 // Remove white background artifacts
    });
    
    // Force shader compilation and check for errors
    if (rendererRef.current) {
      rendererRef.current.compile(sceneRef.current!, cameraRef.current!);
      
      // Check if the program compiled successfully
      setTimeout(() => {
        const program = (faceMaterial as any).program?.program;
        if (program) {
          const gl = rendererRef.current!.getContext();
          if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
          } else {
            console.error('❌ Face shader compilation failed:', gl.getProgramInfoLog(program));
          }
        }
      }, 100);
    }

    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    faceMesh.name = 'face';
    faceMesh.position.set(0, 0, 0); // Keep face at center
    scene.add(faceMesh);

    // Create helmet plane with base aspect ratio (scale will be applied via useEffect)
    const helmetGeometry = new THREE.PlaneGeometry(helmetAspect * 2.0, 2.0, 128, 128);
    
    const helmetMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: helmetTexture },
        uDepthMap: { value: helmetDepthTexture },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uTime: { value: 0 },
        uDepthScale: { value: helmetDepthTexture ? helmetDepthScale : 0 },
        uMaskRadius: { value: 0.0 },
        uMaskCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uMaskSoftness: { value: cursorSoftness },
        uMouseVelocity: { value: 0.0 },
        uMouseDirection: { value: new THREE.Vector2(0, 0) },
        uTrailLength: { value: trailLength },
        uTrailDecay: { value: trailSpeed },
        uTrailPositions: { value: new Array(15).fill(new THREE.Vector2(0, 0)) },
        uTrailTimes: { value: new Array(15).fill(0) },
        uCurrentTime: { value: 0 }
      },
      vertexShader: blobMaskVertexShader,
      fragmentShader: blobMaskFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending,
      alphaTest: 0.1 // Remove background artifacts
    });

    const helmetMesh = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmetMesh.name = 'helmet';
    helmetMesh.position.set(helmetX, helmetY, helmetZ); // Use adjustable position
    helmetMesh.scale.set(1, 1, 1); // Base scale (helmetSize will be applied via useEffect)
    scene.add(helmetMesh);    
  };

  const updateScene = () => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const faceMesh = scene.getObjectByName('face') as THREE.Mesh;
    const helmetMesh = scene.getObjectByName('helmet') as THREE.Mesh;

    if (faceMesh && faceMesh.material instanceof THREE.ShaderMaterial) {
      faceMesh.material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
      faceMesh.material.uniforms.uTime.value = Date.now() * 0.001;
    }

    if (helmetMesh && helmetMesh.material instanceof THREE.ShaderMaterial) {
      const currentTime = Date.now();
      
      helmetMesh.material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
      helmetMesh.material.uniforms.uTime.value = currentTime * 0.001;
      helmetMesh.material.uniforms.uCurrentTime.value = currentTime;
      helmetMesh.material.uniforms.uMouseVelocity.value = mouseVelocityRef.current;
      helmetMesh.material.uniforms.uMouseDirection.value.set(mouseDirectionRef.current.x, mouseDirectionRef.current.y);
      
      // Update trail positions array
      const positions = new Array(15).fill(new THREE.Vector2(0, 0));
      const times = new Array(15).fill(0);
      
      trailPositionsRef.current.forEach((pos, index) => {
        if (index < 15) {
          positions[index] = new THREE.Vector2(pos.x, pos.y);
          times[index] = pos.time;
        }
      });
      
      helmetMesh.material.uniforms.uTrailPositions.value = positions;
      helmetMesh.material.uniforms.uTrailTimes.value = times;
      
      // Update mask based on mouse position with fluid motion
      const mouseDistance = Math.sqrt(mouseRef.current.x ** 2 + mouseRef.current.y ** 2);
      const baseRadius = cursorAreaSizeRef.current;
      const velocityInfluence = mouseVelocityRef.current * 10;
      const maskRadius = Math.min(baseRadius + velocityInfluence, 0.9);
      
      helmetMesh.material.uniforms.uMaskRadius.value = maskRadius;
      helmetMesh.material.uniforms.uMaskCenter.value.set(
        (mouseRef.current.x + 1) * 0.5,
        (mouseRef.current.y + 1) * 0.5
      );
      
      // Note: Trail parameters use hardcoded defaults (no UI controls)
      
      // Decay velocity for smooth transitions
      mouseVelocityRef.current *= 0.95;
    }
  };

  const cleanup = () => {
    // Remove event listeners
    if (mountRef.current) {
      mountRef.current.removeEventListener('mousemove', () => {});
    }
    window.removeEventListener('resize', () => {});
    
    // Dispose of Three.js resources
    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (mountRef.current && rendererRef.current.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    }
    
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            // Dispose of textures in material uniforms
            if ('uniforms' in object.material && object.material.uniforms) {
              const uniforms = object.material.uniforms as Record<string, { value: any }>;
              Object.values(uniforms).forEach((uniform) => {
                if (uniform?.value instanceof THREE.Texture) {
                  uniform.value.dispose();
                }
              });
            }
            object.material.dispose();
          }
        }
      });
      sceneRef.current.clear();
    }
    
    // Reset refs
    sceneRef.current = null;
    rendererRef.current = null;
    cameraRef.current = null;
  };

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ cursor: 'none' }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-lg">Loading 3D Scene...</div>
        </div>
      )}
      
      {/* Simple cursor */}
      <div 
        className="absolute pointer-events-none w-8 h-8 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        style={{
          left: `${((mouseRef.current.x + 1) * 0.5) * 100}%`,
          top: `${((-mouseRef.current.y + 1) * 0.5) * 100}%`,
        }}
      />
    </div>
  );
}