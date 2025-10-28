interface Step {
  id: string;
  label: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: string;
}

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="flex justify-center mb-8">
      <div className="flex space-x-4">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < currentIndex;
          
          return (
            <div
              key={step.id}
              className={`flex items-center space-x-2 ${
                isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-zinc-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isCompleted
                    ? "bg-green-600 text-white"
                    : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className="hidden sm:inline capitalize">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}