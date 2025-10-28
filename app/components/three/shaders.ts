// Enhanced shaders for blob masking and fluid cursor effects

export const blobMaskVertexShader = `
  uniform sampler2D uDepthMap;
  uniform vec2 uMouse;
  uniform float uDepthScale;
  uniform float uTime;
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    
    if (uDepthScale > 0.0) {
      float depth = texture2D(uDepthMap, uv).r;
      float displacement = depth * uDepthScale;
      
      // Apply parallax based on mouse position with easing
      float mouseInfluence = 1.0 - distance(uv, vec2(0.5, 0.5)) * 0.5;
      pos.x += uMouse.x * displacement * 0.15 * mouseInfluence;
      pos.y += uMouse.y * displacement * 0.15 * mouseInfluence;
      pos.z += displacement;
      
      vDisplacement = displacement;
    }
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const blobMaskFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uMaskRadius;
  uniform vec2 uMaskCenter;
  uniform float uMaskSoftness;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uMouseVelocity;
  uniform vec2 uMouseDirection;
  uniform float uTrailLength;
  uniform float uTrailDecay;
  uniform vec2 uTrailPositions[15];
  uniform float uTrailTimes[15];
  uniform float uCurrentTime;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Noise function for organic blob shapes
  float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  // Smooth noise
  float smoothNoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(noise(i + vec2(0.0,0.0)), 
                   noise(i + vec2(1.0,0.0)), u.x),
               mix(noise(i + vec2(0.0,1.0)), 
                   noise(i + vec2(1.0,1.0)), u.x), u.y);
  }

  void main() {
    vec4 color = texture2D(uTexture, vUv);
    
    // Remove white background artifacts by checking if the pixel is mostly white
    float brightness = (color.r + color.g + color.b) / 3.0;
    if (brightness > 0.95 && color.a > 0.9) {
      // If it's very bright (white background), make it transparent
      color.a = 0.0;
    }
    
    float finalMask = 0.0;
    
    // Create multiple trailing reveal areas using actual stored positions
    for (float i = 0.0; i < 15.0; i++) {
      if (i >= uTrailLength) break;
      
      int index = int(i);
      vec2 trailCenter = uTrailPositions[index];
      float trailTime = uTrailTimes[index];
      
      // Skip if this position is invalid/unset
      if (trailTime == 0.0) continue;
      
      // Convert trail position from normalized coordinates (-1 to 1) to UV coordinates (0 to 1)
      vec2 trailUV = (trailCenter + 1.0) * 0.5;
      
      // Calculate age of this trail position
      float age = (uCurrentTime - trailTime) / 1000.0; // Convert to seconds
      float maxAge = 1.0; // 1 second max trail lifetime
      
      if (age > maxAge) continue;
      
      vec2 toTrail = vUv - trailUV;
      float trailDist = length(toTrail);
      
      // Calculate intensity based on position in trail and age
      float positionFactor = i / uTrailLength;
      float ageFactor = 1.0 - (age / maxAge);
      float trailIntensity = ageFactor * (1.0 - positionFactor * 0.8);
      
      // Add organic distortion for each trail segment
      float velocityFactor = clamp(uMouseVelocity * 2.0, 0.5, 3.0);
      float noiseScale = 0.015 + velocityFactor * 0.005;
      float noiseOffset = smoothNoise(vUv * 10.0 + uTime * 0.3 + i * 0.2) * noiseScale;
      
      // Calculate radius based on whether this is the main cursor or a trail segment
      float trailRadius;
      if (i == 0.0) {
        // Main reveal area at current cursor position
        trailRadius = uMaskRadius;
      } else {
        // Trail segments are progressively smaller and fade based on age
        trailRadius = uMaskRadius * (0.4 + trailIntensity * 0.3);
      }
      
      // Add slight elongation based on movement direction for fluid effect
      float elongation = uMouseVelocity * 0.08 * trailIntensity;
      float adjustedRadius = trailRadius + elongation;
      
      float adjustedDist = trailDist + noiseOffset;
      float trailMask = 1.0 - smoothstep(
        adjustedRadius - uMaskSoftness, 
        adjustedRadius + uMaskSoftness, 
        adjustedDist
      );
      
      // Apply intensity falloff
      trailMask *= trailIntensity;
      
      // For trail segments (not the main cursor), apply additional fading
      if (i > 0.0) {
        trailMask *= 0.7;
      }
      
      // Combine with final mask using max to create additive effect
      finalMask = max(finalMask, trailMask);
    }
    
    color.a *= finalMask;
    
    gl_FragColor = color;
  }
`;

export const depthParallaxVertexShader = `
  uniform sampler2D uDepthMap;
  uniform vec2 uMouse;
  uniform float uDepthScale;
  uniform float uTime;
  varying vec2 vUv;
  varying float vDisplacement;

  void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    if (uDepthScale > 0.0) {
      float depth = texture2D(uDepthMap, uv).r;
      float displacement = depth * uDepthScale;
      
      // Subtle parallax effect based on depth
      float parallaxStrength = 0.1;
      pos.x += uMouse.x * displacement * parallaxStrength;
      pos.y += uMouse.y * displacement * parallaxStrength;
      pos.z += displacement * 0.1;
      
      // Add subtle wave motion
      pos.z += sin(uTime + pos.x * 5.0) * 0.01;
      
      vDisplacement = displacement;
    }
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const depthParallaxFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  varying vec2 vUv;
  varying float vDisplacement;
  
  void main() {
    vec4 color = texture2D(uTexture, vUv);
    
    // Remove white background artifacts by checking if the pixel is mostly white
    float brightness = (color.r + color.g + color.b) / 3.0;
    if (brightness > 0.95 && color.a > 0.9) {
      // If it's very bright (white background), make it transparent
      color.a = 0.0;
    }
    
    // Add subtle depth-based shading
    float shading = 1.0 - vDisplacement * 0.1;
    color.rgb *= shading;
    
    gl_FragColor = color;
  }
`;