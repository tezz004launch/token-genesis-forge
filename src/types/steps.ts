
export interface TokenCreationStep {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  isVisible: boolean;
  order: number;
  component?: React.ComponentType<any>;
}

export type StepVisibility = {
  [key: string]: boolean;
};

export type StepOrder = {
  [key: string]: number;
};

export interface StepConfigContextType {
  steps: TokenCreationStep[];
  visibleSteps: TokenCreationStep[];
  updateStepVisibility: (stepId: string, isVisible: boolean) => void;
  updateStepOrder: (stepId: string, newOrder: number) => void;
  resetStepConfig: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalVisibleSteps: number;
}
