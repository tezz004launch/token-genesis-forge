
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthWallet from '@/components/AuthWallet';
import { Check, Shield, AlertTriangle } from 'lucide-react';

interface AuthStepProps {
  connectionError: string | null;
}

const AuthStep: React.FC<AuthStepProps> = ({ connectionError }) => {
  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-4">
        <Shield className="h-16 w-16 text-solana mx-auto" />
        <h3 className="text-xl font-medium">Authenticate Your Wallet</h3>
        <p className="text-crypto-light max-w-lg mx-auto">
          For your security, we need to authenticate your wallet ownership.
          This requires signing a message (not a transaction) with your wallet.
        </p>
      </div>
      
      {connectionError && (
        <Alert className="max-w-md mx-auto bg-red-900/20 border-red-500/30 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            {connectionError}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="max-w-md mx-auto bg-crypto-gray/30 p-6 rounded-lg space-y-4">
        <p className="text-sm text-crypto-light">
          This signature:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-crypto-green" />
            <span>Verifies you control this wallet</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-crypto-green" />
            <span>Creates a secure session for token creation</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-crypto-green" />
            <span>Does NOT cost any gas fees</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-crypto-green" />
            <span>Does NOT approve any transactions</span>
          </li>
        </ul>
        
        <div className="pt-4 flex justify-center">
          <AuthWallet />
        </div>
      </div>
    </div>
  );
};

export default AuthStep;
