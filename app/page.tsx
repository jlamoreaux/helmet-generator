"use client";

import { useState, useEffect } from "react";
import ImageUpload from "./components/ImageUpload";
import HelmetForm from "./components/HelmetForm";
import ResultsDisplay from "./components/ResultsDisplay";
import DebugPanel from "./components/DebugPanel";
import Card from "./components/ui/Card";
import ProgressSteps from "./components/ui/ProgressSteps";
import Loading from "./components/ui/Loading";
import ProgressiveLoading from "./components/ui/ProgressiveLoading";
import { Step } from "./lib/types";
import { STEPS } from "./lib/constants";
import { generateHelmet } from "./lib/api";
import { checkDevAssetsClient } from "./lib/devBypass";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [helmetDescription, setHelmetDescription] = useState("");
  const [generatedHelmet, setGeneratedHelmet] = useState<string | null>(null);
  const [processedFaceImage, setProcessedFaceImage] = useState<string | null>(null);
  const [faceDepthMap, setFaceDepthMap] = useState<string | null>(null);
  const [helmetDepthMap, setHelmetDepthMap] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<{message: string; type?: string; timestamp?: string} | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [devBypassStatus, setDevBypassStatus] = useState<string | null>(null);

  // Check dev bypass status on mount
  useEffect(() => {
    const checkDevStatus = async () => {
      const devStatus = await checkDevAssetsClient();
      if (devStatus.shouldBypass) {
        setDevBypassStatus(`🚀 DEV MODE: ${devStatus.reason}`);
      }
    };
    checkDevStatus();
  }, []);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setCurrentStep("describe");
  };

  const handleHelmetSubmit = async (description: string) => {
    setHelmetDescription(description);
    setCurrentStep("generate");
    setIsGenerating(true);
    setError(null);
    setWarning(null);

    try {
      if (!uploadedImage) throw new Error("No image uploaded");
      
      const result = await generateHelmet(uploadedImage, description);
      
      setGeneratedHelmet(result.helmetUrl);
      setProcessedFaceImage(result.faceImageUrl);
      setFaceDepthMap(result.faceDepthMapUrl);
      setHelmetDepthMap(result.helmetDepthMapUrl);
      
      // Check if depth maps failed but generation succeeded
      if (!result.faceDepthMapUrl || !result.helmetDepthMapUrl) {
        setWarning("Depth maps could not be generated. Your helmet will work but without 3D parallax effects.");
      } else {
        setWarning(null);
      }
      
      // Update dev bypass status if returned
      if (result.devBypass && result.devReason) {
        setDevBypassStatus(`🚀 DEV BYPASS: ${result.devReason}`);
      }
      
      setCurrentStep("results");
    } catch (err: any) {
      console.error("Generation error:", err);
      
      // Extract error details from API response
      let errorDetails = {
        message: "Failed to generate helmet",
        type: "unknown_error",
        timestamp: new Date().toISOString()
      };
      
      if (err instanceof Error) {
        errorDetails.message = err.message;
      } else if (typeof err === 'string') {
        errorDetails.message = err;
      } else if (err?.message) {
        errorDetails.message = err.message;
        errorDetails.type = err.type || "unknown_error";
        errorDetails.timestamp = err.timestamp || new Date().toISOString();
      }
      
      setError(errorDetails);
      setCurrentStep("describe");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetState = () => {
    setCurrentStep("upload");
    setUploadedImage(null);
    setHelmetDescription("");
    setGeneratedHelmet(null);
    setProcessedFaceImage(null);
    setFaceDepthMap(null);
    setHelmetDepthMap(null);
    setError(null);
    setWarning(null);
    setDevBypassStatus(null);
  };

  const handleQuickTest = () => {
    // Set dummy data and go straight to results
    setUploadedImage(new File([""], "test.jpg", { type: "image/jpeg" }));
    setHelmetDescription("Test helmet");
    setGeneratedHelmet("https://replicate.delivery/xezq/UF22qwPiLkoyGhl4BxlTGah91jKRu4S8R1ucndiK38GSD3YF/tmp9ef1zrz4.jpg");
    setProcessedFaceImage("https://replicate.delivery/xezq/eIMfbkWEnmrjsUpRAbYFLNYlMU3TLc0oVh1wSvWrXFAFNcjVA/tmp3ocarqid.png");
    setFaceDepthMap("https://replicate.delivery/czjl/fRBY17IIXzXcOaLJSmaQR9XKpENWHXQzsXmOL6sjec2MQcjVA/out.png");
    setHelmetDepthMap("https://replicate.delivery/czjl/ExVd6eI15KyzNKSfj3L2IC0khcZvnRMMUq5fEjSqJpHdg4GrA/out.png");
    setCurrentStep("results");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Helmet Generator
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Upload your headshot, describe your dream helmet, and generate an interactive 3D experience
          </p>
          
          {devBypassStatus && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
              {devBypassStatus}
            </div>
          )}
        </header>

        <div className="max-w-4xl mx-auto">
          <ProgressSteps steps={STEPS} currentStep={currentStep} />

          <Card padding="lg">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-800 dark:text-red-200 font-medium mb-1">
                      Generation Failed
                    </p>
                    <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                      {error.message}
                    </p>
                    {error.type && error.type !== 'unknown_error' && (
                      <p className="text-red-600 dark:text-red-400 text-xs">
                        Error type: {error.type.replace('_', ' ')}
                      </p>
                    )}
                    {error.timestamp && (
                      <p className="text-red-500 dark:text-red-500 text-xs mt-1">
                        Time: {new Date(error.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="ml-2 text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-100"
                    aria-label="Dismiss error"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {warning && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                      Partial Success
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      {warning}
                    </p>
                  </div>
                  <button
                    onClick={() => setWarning(null)}
                    className="ml-2 text-yellow-400 hover:text-yellow-600 dark:text-yellow-300 dark:hover:text-yellow-100"
                    aria-label="Dismiss warning"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {currentStep === "upload" && (
              <div>
                <ImageUpload onImageUpload={handleImageUpload} />
                <DebugPanel onQuickTest={handleQuickTest} />
              </div>
            )}
            
            {currentStep === "describe" && (
              <HelmetForm 
                onSubmit={handleHelmetSubmit}
                onBack={() => setCurrentStep("upload")}
                isLoading={isGenerating}
              />
            )}
            
            {currentStep === "generate" && (
              <ProgressiveLoading 
                title="Generating Your Helmet"
                subtitle="Our AI is creating your custom helmet design..."
              />
            )}
            
            {currentStep === "results" && (
              <ResultsDisplay 
                originalImage={uploadedImage}
                processedFaceImage={processedFaceImage}
                generatedHelmet={generatedHelmet}
                faceDepthMap={faceDepthMap}
                helmetDepthMap={helmetDepthMap}
                description={helmetDescription}
                onStartOver={resetState}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
