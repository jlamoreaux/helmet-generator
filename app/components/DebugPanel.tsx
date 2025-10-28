"use client";

interface DebugPanelProps {
  onQuickTest: () => void;
}

export default function DebugPanel({ onQuickTest }: DebugPanelProps) {
  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
      <div className="text-center">
        <button
          onClick={onQuickTest}
          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          🚀 Quick Test Results (Debug)
        </button>
        <p className="text-xs text-zinc-500 mt-2">Skip generation and test 3D scene directly</p>
      </div>
    </div>
  );
}