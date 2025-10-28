# Helmet Generator

An interactive 3D helmet visualization application that combines AI image generation with WebGL rendering to create immersive helmet experiences.

## ✨ Features

- **AI-Powered Generation**: Upload a headshot and describe your dream helmet
- **Interactive 3D Scene**: WebGL-powered cursor effects with fluid trail animations
- **Automatic Rotation Correction**: Detects and fixes rotated AI-generated images
- **Real-time Adjustments**: Live controls for helmet positioning and visual effects
- **Export Ready**: Generate ZIP packages with standalone HTML/JS/CSS for web embedding

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd helmet-generator
   bun install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Add your Replicate API token
   ```

3. **Development**
   ```bash
   bun dev
   ```
   Open [http://localhost:3001](http://localhost:3001) to view the application.

4. **Production**
   ```bash
   bun run build
   bun start
   ```

## 🔧 Configuration

### Required Environment Variables

```env
REPLICATE_API_TOKEN=your_replicate_api_token_here
REPLICATE_HELMET_MODEL=bytedance/seedream-4
REPLICATE_DEPTH_MODEL=cjwbw/midas
REPLICATE_BACKGROUND_REMOVAL_MODEL=bria/remove-background
```

### Development Mode

Set `USE_DEV_IMAGES=true` to bypass AI generation:

```env
USE_DEV_IMAGES=true
```

Add test images to `public/dev/`:
- `face.png` (required)
- `helmet.png` (required)
- `face-depth-map.png` (optional)
- `helmet-depth-map.png` (optional)

## 🛠 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Runtime**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **3D Graphics**: Three.js with custom GLSL shaders
- **AI Integration**: Replicate API
- **Package Manager**: Bun

## 📁 Project Structure

```
app/
├── components/
│   ├── three/              # 3D scene components
│   ├── ui/                 # Reusable UI components
│   └── *.tsx              # Page components
├── lib/
│   ├── api.ts             # Replicate API integration
│   ├── imageRotation.ts   # Auto-rotation correction
│   ├── devBypass*.ts      # Development mode utilities
│   └── *.ts               # Utilities and types
└── api/                   # API routes
```

## 🎮 Usage

1. **Upload** a front-facing headshot
2. **Describe** your ideal helmet design
3. **Generate** using AI models
4. **Adjust** positioning and effects in real-time
5. **Export** as standalone web package

## 🔒 Security Features

- Path traversal protection for dev assets
- Base64 validation for uploaded images
- File size limits and format validation
- Environment variable isolation

## 📝 Development

See [CLAUDE.md](./CLAUDE.md) for detailed development documentation and architecture notes.

## 📄 License

[Add your license here]
