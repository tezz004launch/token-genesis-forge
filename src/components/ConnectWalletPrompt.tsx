
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Coins, Lock, Wallet, AlertTriangle, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConnectWalletPromptProps {
  children?: React.ReactNode;
}

const ConnectWalletPrompt: React.FC<ConnectWalletPromptProps> = ({ children }) => {
  const { connecting, wallet, wallets } = useWallet();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Clear error when starting to connect
  React.useEffect(() => {
    if (connecting) {
      setConnectionError(null);
    }
  }, [connecting]);
  
  // Check if wallet adapters are available
  const hasWalletAdapters = wallets && wallets.length > 0;

  return (
    <Card className="border border-solana/20 bg-crypto-gray/50 backdrop-blur-sm shadow-lg max-w-xl mx-auto">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="text-solana" /> Connect Your Wallet to Begin
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {connectionError && (
          <Alert className="mb-4 bg-red-900/20 border-red-500/30">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-300">
              {connectionError}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-center space-y-6 py-6">
          <div className="w-20 h-20 mx-auto rounded-full border-2 border-solana/30 flex items-center justify-center bg-crypto-gray">
            <Lock className="h-10 w-10 text-solana" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-medium">First Step to Creating Your Token</h3>
            <p className="text-crypto-light">
              {children || "To create your own SPL token on Solana, you need to connect your wallet first. This allows us to interact with the Solana blockchain on your behalf."}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-crypto-dark/50 p-3 rounded-lg">
              <Coins className="text-crypto-green" />
              <span>You'll need at least 0.06 SOL for token creation + fees</span>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg mt-4">
            <h4 className="text-sm font-medium text-solana mb-2 flex items-center">
              <ShieldAlert className="h-4 w-4 mr-1" /> Wallet Authorization
            </h4>
            <div className="text-sm text-left space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-crypto-light">We will be able to view your SOL balance to ensure you have enough for gas fees</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-crypto-light">We will send transaction requests to your wallet, but you will always need to review and authorize them</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-crypto-light">By connecting your wallet, you agree to our terms of service</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-center">
            {connecting ? (
              <div className="flex items-center gap-2 bg-solana/80 text-white py-2 px-4 rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              <WalletMultiButton className="!bg-gradient-to-r from-solana to-crypto-blue hover:opacity-90 transition-opacity" />
            )}
          </div>
          
          {!hasWalletAdapters && (
            <div className="mt-4 text-sm text-amber-400">
              No wallet adapters detected. Please install a Solana wallet extension like Phantom or Solflare.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectWalletPrompt;
