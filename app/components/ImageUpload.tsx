"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UPLOAD_CONFIG } from "../lib/constants";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: UPLOAD_CONFIG.acceptedTypes,
    maxFiles: 1,
    maxSize: UPLOAD_CONFIG.maxSize,
  });

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50">
        Upload Your Headshot
      </h2>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-zinc-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-500"
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="w-16 h-16 text-zinc-400 dark:text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          
          <div>
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {isDragActive ? "Drop your image here" : "Drag & drop your headshot"}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              or click to browse files
            </p>
          </div>
          
          <div className="text-xs text-zinc-400 dark:text-zinc-500">
            Supports: JPEG, PNG, WebP • Max size: 10MB
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📸 Important: Use a front-facing headshot only
          </p>
          <p className="text-blue-800 dark:text-blue-200 text-xs">
            The helmet will be generated to match your face direction, so profile or angled photos won't work properly.
          </p>
        </div>
        
        <p className="mb-2">
          <strong>Tips for best results:</strong>
        </p>
        <ul className="text-left max-w-md mx-auto space-y-1">
          <li>• <strong>Must be directly front-facing</strong> (not profile or angled)</li>
          <li>• Use high-quality, well-lit photo</li>
          <li>• Face should be centered in the frame</li>
          <li>• Avoid shadows on face</li>
          <li>• Keep hair away from forehead area</li>
          <li>• Look directly at the camera</li>
        </ul>
      </div>
    </div>
  );
}