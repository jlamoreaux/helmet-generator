import { HelmetPreset } from './types';

export const HELMET_PRESETS: HelmetPreset[] = [
  {
    id: "racing",
    name: "Racing Helmet",
    description: "A sleek racing helmet with aerodynamic design, racing stripes, and sponsor logos",
    preview: "🏎️"
  },
  {
    id: "motorcycle",
    name: "Motorcycle Helmet",
    description: "A protective motorcycle helmet with a dark visor and matte black finish",
    preview: "🏍️"
  },
  {
    id: "space",
    name: "Space Helmet",
    description: "A futuristic space helmet with a reflective gold visor and white shell",
    preview: "🚀"
  },
  {
    id: "medieval",
    name: "Medieval Knight",
    description: "A medieval knight's helmet with metal plating and chain mail details",
    preview: "⚔️"
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Helmet",
    description: "A futuristic cyberpunk helmet with neon accents and digital displays",
    preview: "🤖"
  },
  {
    id: "custom",
    name: "Custom Design",
    description: "Describe your own unique helmet design",
    preview: "✨"
  }
];

export const UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp']
  }
};

export const STEPS = [
  { id: "upload", label: "Upload" },
  { id: "describe", label: "Describe" },
  { id: "generate", label: "Generate" },
  { id: "results", label: "Results" }
];