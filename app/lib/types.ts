export type Step = "upload" | "describe" | "generate" | "results";

export interface HelmetPreset {
  id: string;
  name: string;
  description: string;
  preview: string;
}

export interface GenerationResult {
  helmetUrl: string;
  faceDepthMapUrl: string | null;
  helmetDepthMapUrl: string | null;
  originalImage: File;
  description: string;
}

export interface ReplicateImageResponse {
  helmetUrl: string;
  faceImageUrl: string;
  faceDepthMapUrl: string | null;
  helmetDepthMapUrl: string | null;
  devBypass?: boolean;
  devReason?: string;
}

export interface AppState {
  currentStep: Step;
  uploadedImage: File | null;
  helmetDescription: string;
  generatedHelmet: string | null;
  faceDepthMap: string | null;
  helmetDepthMap: string | null;
  isGenerating: boolean;
}