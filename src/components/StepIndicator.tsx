
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStepConfig } from '@/contexts/StepConfigContext';

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const { visibleSteps } = useStepConfig();
  
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center w-full max-w-3xl mx-auto">
        {visibleSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="relative flex items-center justify-center flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 z-10",
                  index < currentStep - 1
                    ? "bg-solana border-solana text-white"
                    : index === currentStep - 1
                    ? "border-solana text-solana bg-crypto-dark"
                    : "border-gray-600 text-gray-600 bg-crypto-dark"
                )}
              >
                {index < currentStep - 1 ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              <span 
                className={cn(
                  "absolute -bottom-6 text-xs whitespace-nowrap",
                  index < currentStep - 1
                    ? "text-solana"
                    : index === currentStep - 1
                    ? "text-solana"
                    : "text-crypto-light"
                )}
              >
                {step.title}
              </span>
            </div>
            
            {/* Connector Line */}
            {index < visibleSteps.length - 1 && (
              <div 
                className={cn(
                  "h-0.5 flex-1",
                  index < currentStep - 1
                    ? "bg-solana" 
                    : "bg-gray-600"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
