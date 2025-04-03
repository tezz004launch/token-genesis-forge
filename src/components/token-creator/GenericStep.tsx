
import React from 'react';
import { FileEdit } from 'lucide-react';
import { TokenCreationStep } from '@/types/steps';

interface GenericStepProps {
  step: TokenCreationStep;
  currentStep: number;
}

const GenericStep: React.FC<GenericStepProps> = ({ step, currentStep }) => {
  const StepComponent = step.component;
  
  return StepComponent ? (
    <StepComponent />
  ) : (
    <div className="py-4 text-center">
      <FileEdit className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">Step {currentStep}: {step.title}</h3>
      <p className="text-muted-foreground">
        {step.description || "This step is included as a placeholder."}
      </p>
    </div>
  );
};

export default GenericStep;
