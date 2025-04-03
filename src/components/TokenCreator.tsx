
import React, { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StepIndicator from './StepIndicator';
import { useTokenCreator } from '@/hooks/useTokenCreator';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useStepConfig } from '@/contexts/StepConfigContext';
import { hasSufficientBalance } from '@/lib/token/tokenCreatorUtils';
import { RPC_ENDPOINTS } from '@/lib/token/tokenCreatorUtils';
import { useWallet } from '@solana/wallet-adapter-react';

// Import step components
import AuthStep from './token-creator/AuthStep';
import BasicInfoStep from './token-creator/BasicInfoStep';
import PaymentStep from './token-creator/PaymentStep';
import GenericStep from './token-creator/GenericStep';
import CreationProgress from './token-creator/CreationProgress';

const TokenCreator: React.FC = () => {
  const { publicKey } = useWallet(); // Get publicKey from useWallet hook
  
  const {
    form,
    errors,
    isCreating,
    progress,
    creationTxHash,
    tokenAddress,
    selectedNetwork,
    setSelectedNetwork,
    feeBreakdown,
    currentRpcIndex,
    setCurrentRpcIndex,
    connectionError,
    showAuthStep,
    readyToCreate,
    setReadyToCreate,
    handleInputChange,
    handleCheckboxChange,
    handleImageUpload,
    validateForm,
    handleCreateToken,
    resetCreator,
    switchRpcEndpoint
  } = useTokenCreator();

  const { 
    visibleSteps, 
    currentStep, 
    setCurrentStep, 
    totalVisibleSteps 
  } = useStepConfig();

  const {
    walletBalance,
    isLoadingBalance,
    connectionState,
    refreshWalletBalance,
    retryDelay,
    balanceRefreshAttempts,
    setConnectionState
  } = useWalletBalance({
    publicKey, // Pass the publicKey from useWallet hook
    selectedNetwork,
    currentRpcIndex
  });

  useEffect(() => {
    if (readyToCreate && !isCreating) {
      handleCreateToken(hasSufficientBalance(walletBalance, feeBreakdown));
      setReadyToCreate(false);
    }
  }, [readyToCreate, isCreating, handleCreateToken, walletBalance, feeBreakdown]);

  const nextStep = () => {
    if (visibleSteps[currentStep - 1]?.id === 'basic-info') {
      if (!validateForm()) {
        return;
      }
    }
    
    if (currentStep < totalVisibleSteps) {
      setCurrentStep(currentStep + 1);
      
      if (connectionState === 'failed' || connectionState === 'unstable') {
        switchRpcEndpoint();
      }
    } else if (currentStep === totalVisibleSteps) {
      setReadyToCreate(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    const currentStepData = visibleSteps[currentStep - 1];
    
    if (!currentStepData) return null;
    
    switch (currentStepData.id) {
      case 'auth':
        return <AuthStep connectionError={connectionError} />;
      case 'basic-info':
        return <BasicInfoStep 
          form={form} 
          errors={errors} 
          handleInputChange={handleInputChange} 
        />;
      case 'payment':
        return <PaymentStep 
          feeBreakdown={feeBreakdown}
          walletBalance={walletBalance}
          hasSufficientBalance={hasSufficientBalance(walletBalance, feeBreakdown)}
          connectionState={connectionState}
          isLoadingBalance={isLoadingBalance}
          refreshWalletBalance={refreshWalletBalance}
          switchRpcEndpoint={switchRpcEndpoint}
          currentRpcIndex={currentRpcIndex}
          selectedNetwork={selectedNetwork}
          onNext={nextStep}
        />;
      default:
        return <GenericStep step={currentStepData} currentStep={currentStep} />;
    }
  };

  return (
    <div>
      {(currentStep === 1 || showAuthStep) && <AuthStep connectionError={connectionError} />}
      {currentStep > 1 && !showAuthStep && (
        <Card className="border border-gray-800 bg-crypto-gray/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Create Your Meme Coin</CardTitle>
          </CardHeader>
          <CardContent>
            <StepIndicator 
              currentStep={currentStep} 
              totalSteps={totalVisibleSteps} 
            />
            
            {isCreating ? (
              <CreationProgress 
                progress={progress}
                creationTxHash={creationTxHash}
                tokenAddress={tokenAddress}
                tokenName={form.name}
                tokenSymbol={form.symbol}
                tokenDecimals={form.decimals}
                tokenSupply={form.supply}
                selectedNetwork={selectedNetwork}
              />
            ) : (
              <div className="space-y-6 py-4">
                {renderStepContent()}
              </div>
            )}
          </CardContent>
          {!isCreating && currentStep > 1 && currentStep < totalVisibleSteps + 1 && (
            <CardFooter className="justify-between border-t border-gray-800 p-4">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              {currentStep < totalVisibleSteps + 1 && (
                <Button onClick={nextStep}>
                  {currentStep === totalVisibleSteps ? "Create Token" : "Next"}
                </Button>
              )}
            </CardFooter>
          )}
          {currentStep === totalVisibleSteps + 1 && (
            <CardFooter className="justify-center border-t border-gray-800 p-4">
              <Button onClick={resetCreator}>
                Create Another Token
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
};

export default TokenCreator;
