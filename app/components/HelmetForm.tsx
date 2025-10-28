"use client";

import { useState } from "react";
import Button from "./ui/Button";
import { HELMET_PRESETS } from "../lib/constants";
import { HelmetPreset } from "../lib/types";

interface HelmetFormProps {
  onSubmit: (description: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function HelmetForm({ onSubmit, onBack, isLoading = false }: HelmetFormProps) {
  const [description, setDescription] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");

  const handlePresetSelect = (preset: HelmetPreset) => {
    setSelectedPreset(preset.id);
    if (preset.id !== "custom") {
      setDescription(preset.description);
    } else {
      setDescription("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit(description.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
          Describe Your Dream Helmet
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Choose a preset or describe your own custom design
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preset Options */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Choose a style:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {HELMET_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedPreset === preset.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500"
                }`}
              >
                <div className="text-2xl mb-2">{preset.preview}</div>
                <div className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                  {preset.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Helmet Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your helmet design in detail... colors, materials, style, special features, etc."
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400"
            rows={4}
            required
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Be specific about colors, materials, and style for better results
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={!description.trim() || isLoading}
            loading={isLoading}
            className="flex-1"
          >
            Generate Helmet
          </Button>
        </div>
      </form>

      {/* Tips */}
      <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-50 mb-2">
          Tips for better results:
        </h3>
        <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
          <li>• Be specific about colors and materials</li>
          <li>• Mention the intended use (racing, motorcycle, etc.)</li>
          <li>• Include details about logos, patterns, or decorations</li>
          <li>• Specify the helmet style (full face, open face, etc.)</li>
          <li>• <strong>Helmet will be generated in front view to match your photo</strong></li>
          <li>• Visor will be clean and clear without reflections for better results</li>
        </ul>
      </div>
    </div>
  );
}