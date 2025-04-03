
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Shield, CreditCard, Coins, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PLATFORM_FEE_DISPLAY } from '@/constants/tokenCreation';

interface PaymentStepProps {
  walletBalance: number | null;
  isCreating: boolean;
  progress: number;
  selectedNetwork: 'devnet' | 'mainnet-beta';
  nextStep: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  walletBalance,
  isCreating,
  progress,
  selectedNetwork,
  nextStep
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Payment</h3>
        <p className="text-sm text-muted-foreground">
          Review payment details before creating your meme coin
        </p>
      </div>
      
      <Alert className="bg-green-900/20 border-green-500/20">
        <Shield className="h-4 w-4 text-green-500" />
        <AlertTitle>Secure Transaction</AlertTitle>
        <AlertDescription>
          This transaction is protected by wallet authentication and will require your approval.
        </AlertDescription>
      </Alert>
      
      <div className="bg-crypto-gray/30 p-6 rounded-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Platform Fee</span>
          <span className="font-medium">
            {PLATFORM_FEE_DISPLAY}
            <span className="text-sm text-green-400"> (FIXED FEE)</span>
          </span>
        </div>
        
        {walletBalance !== null && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Your Balance</span>
            <span className={`font-medium ${
              walletBalance < 0.05 ? 'text-red-500' : ''
            }`}>
              {walletBalance.toFixed(4)} SOL
            </span>
          </div>
        )}
        
        <div className="border-t border-gray-700 my-3" />
        
        <div className="flex items-center justify-between">
          <span className="font-medium">Total</span>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg">{PLATFORM_FEE_DISPLAY}</span>
            <Coins className="text-solana h-5 w-5" />
          </div>
        </div>
      </div>
      
      <div className="bg-crypto-gray/30 p-4 rounded-md flex items-start space-x-3">
        <CreditCard className="text-solana h-5 w-5 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm">
            This fee covers all costs associated with creating your meme coin on the Solana 
            {selectedNetwork === 'mainnet-beta' ? ' mainnet' : ' devnet'}. 
            Your wallet will be prompted to approve this transaction.
          </p>
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          className="w-full bg-solana hover:bg-solana-dark transition-colors"
          size="lg"
          disabled={
            isCreating || 
            (walletBalance !== null && walletBalance < 0.05)
          }
          onClick={nextStep}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Meme Coin...
            </>
          ) : (
            "Next"
          )}
        </Button>
        {walletBalance !== null && walletBalance < 0.05 && (
          <p className="text-red-500 text-sm text-center mt-2">
            Insufficient balance. You need at least {PLATFORM_FEE_DISPLAY}.
          </p>
        )}
        {isCreating && (
          <div className="mt-4">
            <Progress value={progress} className="bg-crypto-gray h-2" />
            <p className="text-xs text-center mt-2 text-muted-foreground">
              {progress < 100 ? "Processing your transaction..." : "Token created successfully!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;
