import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StepIndicator from './StepIndicator';
import { STEPS } from '@/constants/tokenCreation';
import { useTokenCreation } from '@/hooks/useTokenCreation';

// Step Components
import BasicInfoStep from './token-creation/BasicInfoStep';
import TokenParametersStep from './token-creation/TokenParametersStep';
import SocialsStep from './token-creation/SocialsStep';
import PermissionsStep from './token-creation/PermissionsStep';
import ImageUploadStep from './token-creation/ImageUploadStep';
import NetworkSelectionStep from './token-creation/NetworkSelectionStep';
import ReviewStep from './token-creation/ReviewStep';
import PaymentStep from './token-creation/PaymentStep';
import ConfirmationStep from './token-creation/ConfirmationStep';
import AuthStep from './token-creation/AuthStep';

const TokenCreator: React.FC = () => {
  const {
    form,
    errors,
    currentStep,
    isCreating,
    progress,
    creationTxHash,
    tokenAddress,
    walletBalance,
    selectedNetwork,
    securityLevel,
    setSelectedNetwork,
    handleInputChange,
    handleCheckboxChange,
    handleImageUpload,
    nextStep,
    prevStep,
    resetCreator
  } = useTokenCreation();

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="text-center space-y-6 py-6">
          <h3 className="text-xl font-medium">Connect Your Wallet to Begin</h3>
          <p className="text-crypto-light">
            Please connect your Solana wallet to use our token creation service.
          </p>
        </div>
      );
    }

    if (currentStep === 1) {
      return <AuthStep />;
    }
    
    switch (currentStep) {
      case 2:
        return (
          <BasicInfoStep 
            name={form.name}
            symbol={form.symbol}
            description={form.description}
            errors={errors}
            handleInputChange={handleInputChange}
          />
        );
        
      case 3:
        return (
          <TokenParametersStep 
            supply={form.supply}
            decimals={form.decimals}
            errors={errors}
            handleInputChange={handleInputChange}
            handleDecimalsChange={(vals) => {
              handleCheckboxChange(vals[0], 'decimals');
            }}
          />
        );

      case 4:
        return (
          <SocialsStep 
            website={form.website}
            twitter={form.twitter}
            telegram={form.telegram}
            handleInputChange={handleInputChange}
          />
        );

      case 5:
        return (
          <PermissionsStep 
            revokeMintAuthority={form.revokeMintAuthority}
            revokeFreezeAuthority={form.revokeFreezeAuthority}
            immutableMetadata={form.immutableMetadata}
            securityLevel={securityLevel}
            handleCheckboxChange={handleCheckboxChange}
          />
        );

      case 6:
        return (
          <ImageUploadStep 
            image={form.image}
            handleImageUpload={handleImageUpload}
          />
        );

      case 7:
        return (
          <NetworkSelectionStep
            selectedNetwork={selectedNetwork}
            setSelectedNetwork={setSelectedNetwork}
          />
        );

      case 8:
        return (
          <ReviewStep 
            form={form}
            selectedNetwork={selectedNetwork}
            securityLevel={securityLevel}
          />
        );

      case 9:
        return (
          <PaymentStep 
            walletBalance={walletBalance}
            isCreating={isCreating}
            progress={progress}
            selectedNetwork={selectedNetwork}
            nextStep={nextStep}
          />
        );

      case 10:
        return (
          <ConfirmationStep 
            name={form.name}
            symbol={form.symbol}
            decimals={form.decimals}
            supply={form.supply}
            tokenAddress={tokenAddress}
            creationTxHash={creationTxHash}
            selectedNetwork={selectedNetwork}
            resetCreator={resetCreator}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="mb-12">
      <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />
      
      <Card className="border border-gray-800 bg-crypto-gray/30 backdrop-blur">
        <CardHeader className="border-b border-gray-800">
          <CardTitle>{STEPS[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
        {currentStep !== STEPS.length - 1 && currentStep !== 9 && !isCreating && (
          <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1 || (currentStep === 2 && isAuthenticated)}
            >
              Back
            </Button>
            <Button 
              onClick={nextStep}
              disabled={(currentStep === 1 && !isAuthenticated) || currentStep === STEPS.length - 2}
            >
              Continue
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default TokenCreator;
