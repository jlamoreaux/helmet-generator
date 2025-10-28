# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 project called "helmet-generator" built with TypeScript, React 19, and Tailwind CSS v4. It uses the App Router architecture and is currently a fresh Create Next App template.

## Development Commands

- `bun dev` - Start development server on http://localhost:3001
- `bun run build` - Build production application
- `bun start` - Start production server
- `bun run lint` - Run ESLint for code linting

**Package Manager**: This project uses Bun as the package manager instead of npm.

## API Configuration

The application uses Replicate for AI image generation. Required environment variables in `.env.local`:

```
REPLICATE_API_TOKEN=your_token_here
USE_DEV_IMAGES=false
```

**Current Models Used:**
- Helmet Generation: Configured via `REPLICATE_HELMET_MODEL` env var (currently `bytedance/seedream-4`)
  - Returns: `string[]` array of image URLs
- Depth Maps: Configured via `REPLICATE_DEPTH_MODEL` env var (currently `cjwbw/midas` with version hash)  
  - Returns: `string[]` array of depth map URLs
- Background Removal: Required via `REPLICATE_BACKGROUND_REMOVAL_MODEL` env var (currently `bria/remove-background`)
  - Returns: `string[]` array of processed image URLs

**Important Notes:**
- All models are configured via environment variables
- Helmet generation uses enhanced prompting to avoid visor reflections and ensure clean backgrounds
- Background removal is required for both profile photo and helmet image for clean 3D effects
- Depth model may be cold and has fallback handling
- Users must upload front-facing headshots for proper helmet alignment

**Development Mode:**
- When `USE_DEV_IMAGES=true`, AI generation is bypassed entirely
- Uses local images from `public/dev/` for faster development:
  - `public/dev/face.png` - Profile photo (processed automatically)
  - `public/dev/helmet.png` - Generated helmet image
  - `public/dev/face-depth-map.png` - For profile photo depth
  - `public/dev/helmet-depth-map.png` - For helmet depth
- When `USE_DEV_IMAGES=false`, always uses AI generation (no local assets)
- Dev bypass requires at minimum: `face.png` and `helmet.png`
- Copy your test images to these filenames to bypass AI generation

## Architecture

### Framework Setup
- **Next.js 16** with App Router (app/ directory structure)
- **React 19** with TypeScript support
- **Tailwind CSS v4** for styling with custom theme configuration
- **ESLint** configured with Next.js TypeScript rules

### Project Structure
- `app/` - Next.js App Router pages and layouts
  - `page.tsx` - Home page component
  - `layout.tsx` - Root layout with font configuration
  - `globals.css` - Global styles and Tailwind imports
- `public/` - Static assets (SVG icons)
- TypeScript configuration includes path alias `@/*` pointing to project root

### Styling System
- Uses Tailwind CSS v4 with inline theme configuration
- Custom CSS variables for background/foreground colors
- Dark mode support via `prefers-color-scheme` media query
- Geist fonts (Sans and Mono) loaded via next/font/google

### Code Standards
- TypeScript strict mode enabled
- ESLint with Next.js and TypeScript configurations
- React JSX transform enabled
- Path aliases configured for clean imports

## Implementation Details

### Interactive 3D System
- **Three.js** for WebGL rendering and 3D scene management
- **Custom shaders** for depth-based parallax and blob masking effects
- **Fluid cursor tracking** with velocity-based blob deformation
- **Dual depth maps** for both face and helmet parallax layers

### Key Components
- `HelmetScene.tsx` - Main 3D scene with mouse tracking
- `shaders.ts` - Custom GLSL shaders for visual effects
- `zipGenerator.ts` - Complete package generation for download
- Reusable UI components in `components/ui/`

### Features Implemented
✅ File upload with validation and tips
✅ Helmet preset selection and custom descriptions  
✅ AI image generation via Replicate API
✅ Dual depth map generation (face + helmet)
✅ Interactive 3D cursor-following effects
✅ Fluid cursor trail effects with temporal persistence
✅ Automatic image rotation detection and correction
✅ Manual rotation controls for all images
✅ Development mode bypass with local assets
✅ Real-time 3D scene adjustment controls
✅ Helmet positioning and visual effects tuning
✅ Blob masking with velocity-responsive deformation
✅ ZIP package generation with standalone HTML/JS/CSS
✅ Embed code generation for websites

### Recent Enhancements

**Image Rotation Correction:**
- Automatic detection and correction of rotated AI-generated images
- Handles counter-clockwise rotations common in AI models
- Manual rotation controls for fine-tuning
- Supports both main images and depth maps
- Located in `app/lib/imageRotation.ts`

**Fluid Cursor Trail System:**
- Replaced mathematical trail calculation with real position tracking
- Temporal persistence with age-based fading
- Natural trail segments that follow mouse movement
- Enhanced shader system with actual position arrays
- Trail positions stored with timestamps for smooth decay

**Development Mode Bypass:**
- `USE_DEV_IMAGES=true` environment variable
- Bypasses AI generation entirely for faster development
- Security-hardened file handling with path traversal protection
- Base64 validation and file size limits
- Automatic dev asset detection and status reporting

**Real-time Scene Controls:**
- Collapsible adjustment panel in results view
- Helmet positioning (size, X/Y/Z coordinates)
- Visual effects tuning (depth scales, cursor area, trail settings)
- Live updates without scene rebuilding
- Separate rotation controls for each image/depth map

### File Structure
```
app/
├── components/
│   ├── three/              # 3D scene components
│   ├── ui/                 # Reusable UI components
│   ├── ImageUpload.tsx     # File upload with dropzone
│   ├── HelmetForm.tsx      # Description and presets
│   └── ResultsDisplay.tsx  # 3D scene and download
├── lib/
│   ├── api.ts             # Replicate API integration
│   ├── types.ts           # TypeScript interfaces
│   ├── constants.ts       # App constants and presets
│   └── zipGenerator.ts    # Download package creation
└── api/generate/          # API route for helmet generation
```