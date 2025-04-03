
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { TokenCreationStep, StepVisibility, StepOrder, StepConfigContextType } from '@/types/steps';
import { DefaultSteps } from '@/lib/token/defaultSteps';

const StepConfigContext = createContext<StepConfigContextType | undefined>(undefined);

export const useStepConfig = () => {
  const context = useContext(StepConfigContext);
  if (!context) {
    throw new Error('useStepConfig must be used within a StepConfigProvider');
  }
  return context;
};

export const StepConfigProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Load step configuration from localStorage if available
  const loadStepConfig = () => {
    try {
      const savedVisibility = localStorage.getItem('tokenStepVisibility');
      const savedOrder = localStorage.getItem('tokenStepOrder');
      
      return {
        visibility: savedVisibility ? JSON.parse(savedVisibility) : {},
        order: savedOrder ? JSON.parse(savedOrder) : {}
      };
    } catch (error) {
      console.error('Error loading step config:', error);
      return { visibility: {}, order: {} };
    }
  };

  const [steps, setSteps] = useState<TokenCreationStep[]>(DefaultSteps);
  const [stepVisibility, setStepVisibility] = useState<StepVisibility>(() => {
    const config = loadStepConfig();
    return config.visibility;
  });
  
  const [stepOrder, setStepOrder] = useState<StepOrder>(() => {
    const config = loadStepConfig();
    return config.order;
  });

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Apply stored configuration to steps
  useEffect(() => {
    const updatedSteps = DefaultSteps.map(step => ({
      ...step,
      isVisible: stepVisibility[step.id] !== undefined ? stepVisibility[step.id] : step.isVisible,
      order: stepOrder[step.id] !== undefined ? stepOrder[step.id] : step.order
    }));
    
    // Sort steps by order
    updatedSteps.sort((a, b) => a.order - b.order);
    setSteps(updatedSteps);
  }, [stepVisibility, stepOrder]);

  // Save configuration to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('tokenStepVisibility', JSON.stringify(stepVisibility));
      localStorage.setItem('tokenStepOrder', JSON.stringify(stepOrder));
    } catch (error) {
      console.error('Error saving step config:', error);
    }
  }, [stepVisibility, stepOrder]);

  // Filter visible steps for the UI
  const visibleSteps = useMemo(() => {
    return steps.filter(step => step.isVisible);
  }, [steps]);

  // Calculate total visible steps
  const totalVisibleSteps = useMemo(() => {
    return visibleSteps.length;
  }, [visibleSteps]);

  // Update step visibility
  const updateStepVisibility = (stepId: string, isVisible: boolean) => {
    setStepVisibility(prev => ({
      ...prev,
      [stepId]: isVisible
    }));
  };

  // Update step order
  const updateStepOrder = (stepId: string, newOrder: number) => {
    setStepOrder(prev => ({
      ...prev,
      [stepId]: newOrder
    }));
  };

  // Reset to default configuration
  const resetStepConfig = () => {
    localStorage.removeItem('tokenStepVisibility');
    localStorage.removeItem('tokenStepOrder');
    setStepVisibility({});
    setStepOrder({});
    setCurrentStep(1);
  };

  const value = {
    steps,
    visibleSteps,
    updateStepVisibility,
    updateStepOrder,
    resetStepConfig,
    currentStep,
    setCurrentStep,
    totalVisibleSteps
  };

  return (
    <StepConfigContext.Provider value={value}>
      {children}
    </StepConfigContext.Provider>
  );
};
