import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface GenerationProgressProps {
  isGenerating: boolean;
  generationProgress: number;
  currentStep: string;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  isGenerating,
  generationProgress,
  currentStep
}) => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-900">Generating Schedule...</h3>
            <span className="text-sm text-blue-700">{Math.round(generationProgress)}%</span>
          </div>
          <Progress value={generationProgress} className="h-3" />
          <p className="text-sm text-blue-700">{currentStep || 'Preparing to generate schedule...'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
