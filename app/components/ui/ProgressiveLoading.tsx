import { useState, useEffect } from 'react';

interface LoadingStep {
  id: string;
  title: string;
  description: string;
  duration: number; // estimated duration in seconds
}

interface ProgressiveLoadingProps {
  title?: string;
  subtitle?: string;
}

const GENERATION_STEPS: LoadingStep[] = [
  {
    id: 'parallel-generation',
    title: 'Processing & Designing',
    description: 'Removing background and generating helmet design in parallel...',
    duration: 12
  },
  {
    id: 'helmet-cleanup',
    title: 'Cleaning Helmet',
    description: 'Removing background from helmet for clean 3D effects...',
    duration: 8
  },
  {
    id: 'depth-maps',
    title: 'Creating 3D Effects',
    description: 'Generating depth maps for both images simultaneously...',
    duration: 15
  },
  {
    id: 'finalizing',
    title: 'Finalizing Your Helmet',
    description: 'Preparing your interactive 3D experience...',
    duration: 3
  }
];

export default function ProgressiveLoading({ 
  title = "Generating Your Helmet",
  subtitle = "Our AI is working its magic..."
}: ProgressiveLoadingProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 0.1);
      
      // Calculate total elapsed time and expected time for current step
      let totalExpectedTime = 0;
      for (let i = 0; i <= currentStepIndex; i++) {
        totalExpectedTime += GENERATION_STEPS[i].duration;
      }
      
      // If we've exceeded the expected time for current step, move to next
      if (timeElapsed >= totalExpectedTime && currentStepIndex < GENERATION_STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        setProgress(0);
      } else {
        // Update progress within current step
        const stepStartTime = GENERATION_STEPS.slice(0, currentStepIndex).reduce((sum, step) => sum + step.duration, 0);
        const stepProgress = Math.min(100, ((timeElapsed - stepStartTime) / GENERATION_STEPS[currentStepIndex].duration) * 100);
        setProgress(stepProgress);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentStepIndex, timeElapsed]);

  const currentStep = GENERATION_STEPS[currentStepIndex];
  const overallProgress = ((currentStepIndex * 100) + progress) / GENERATION_STEPS.length;

  return (
    <div className="text-center max-w-md mx-auto">
      {/* Main Title */}
      <h2 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        {subtitle}
      </p>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Step {currentStepIndex + 1} of {GENERATION_STEPS.length}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {Math.round(overallProgress)}%
          </span>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Current Step Details */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            {/* Animated Ring */}
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full" />
            <div 
              className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
            />
            {/* Step Number */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {currentStepIndex + 1}
              </span>
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          {currentStep.title}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
          {currentStep.description}
        </p>
        
        {/* Step Progress Bar */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1">
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Timeline */}
      <div className="grid grid-cols-4 gap-2">
        {GENERATION_STEPS.map((step, index) => (
          <div key={step.id} className="text-center">
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              index < currentStepIndex 
                ? 'bg-green-500 text-white' 
                : index === currentStepIndex 
                ? 'bg-blue-500 text-white animate-pulse' 
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
            }`}>
              {index < currentStepIndex ? '✓' : index + 1}
            </div>
            <p className={`text-xs transition-all duration-300 ${
              index <= currentStepIndex 
                ? 'text-zinc-700 dark:text-zinc-300' 
                : 'text-zinc-400 dark:text-zinc-600'
            }`}>
              {step.title.split(' ')[0]}
            </p>
          </div>
        ))}
      </div>

      {/* Estimated Time */}
      <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
        <p>This usually takes 30-50 seconds</p>
        <p className="mt-1">Time elapsed: {Math.round(timeElapsed)}s</p>
      </div>
    </div>
  );
}