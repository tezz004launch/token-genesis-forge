
import React, { useState } from 'react';
import { useStepConfig } from '@/contexts/StepConfigContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MoveUp, MoveDown, Settings2, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

const StepConfigurator = () => {
  const {
    steps,
    updateStepVisibility,
    updateStepOrder,
    resetStepConfig,
  } = useStepConfig();
  
  const [isOpen, setIsOpen] = useState(false);
  const [localSteps, setLocalSteps] = useState(steps);

  // Apply local changes to the global context
  const saveChanges = () => {
    localSteps.forEach(step => {
      updateStepVisibility(step.id, step.isVisible);
      updateStepOrder(step.id, step.order);
    });
    setIsOpen(false);
  };

  // Update step visibility locally
  const handleVisibilityChange = (stepId: string, isVisible: boolean) => {
    setLocalSteps(prev =>
      prev.map(step => (step.id === stepId ? { ...step, isVisible } : step))
    );
  };

  // Move step up in order
  const moveStepUp = (index: number) => {
    if (index <= 0) return;
    const newSteps = [...localSteps];
    const currentOrder = newSteps[index].order;
    const prevOrder = newSteps[index - 1].order;
    
    newSteps[index] = { ...newSteps[index], order: prevOrder };
    newSteps[index - 1] = { ...newSteps[index - 1], order: currentOrder };
    
    // Sort steps by order
    newSteps.sort((a, b) => a.order - b.order);
    setLocalSteps(newSteps);
  };

  // Move step down in order
  const moveStepDown = (index: number) => {
    if (index >= localSteps.length - 1) return;
    const newSteps = [...localSteps];
    const currentOrder = newSteps[index].order;
    const nextOrder = newSteps[index + 1].order;
    
    newSteps[index] = { ...newSteps[index], order: nextOrder };
    newSteps[index + 1] = { ...newSteps[index + 1], order: currentOrder };
    
    // Sort steps by order
    newSteps.sort((a, b) => a.order - b.order);
    setLocalSteps(newSteps);
  };

  // Reset local changes
  const handleReset = () => {
    setLocalSteps(steps);
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    resetStepConfig();
    setLocalSteps([...steps.sort((a, b) => a.order - b.order)]);
  };

  React.useEffect(() => {
    if (isOpen) {
      setLocalSteps([...steps.sort((a, b) => a.order - b.order)]);
    }
  }, [isOpen, steps]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings2 className="h-4 w-4" />
          <span>Customize Steps</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Token Creation Steps</DialogTitle>
          <DialogDescription>
            Configure which steps are visible and in what order they appear.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Alert className="mb-4">
            <AlertDescription>
              Required steps cannot be disabled but can be reordered.
            </AlertDescription>
          </Alert>
          
          <ScrollArea className="h-[300px] pr-4">
            {localSteps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center justify-between py-2 border-b border-gray-800"
              >
                <div className="flex-1">
                  <div className="font-medium">{step.title}</div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Step order controls */}
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveStepUp(index)}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveStepDown(index)}
                      disabled={index === localSteps.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Step visibility toggle */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`step-${step.id}`}
                      checked={step.isVisible}
                      onCheckedChange={(checked) => handleVisibilityChange(step.id, checked)}
                      disabled={step.isRequired}
                    />
                    <Label htmlFor={`step-${step.id}`} className="sr-only">
                      {step.isVisible ? 'Visible' : 'Hidden'}
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleResetToDefaults}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset to Defaults
            </Button>
          </div>
          <Button onClick={saveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StepConfigurator;
