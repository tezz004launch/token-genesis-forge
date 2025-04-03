
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenCreator from '@/components/TokenCreator';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';
import ConnectWalletPrompt from '@/components/ConnectWalletPrompt';
import { useWallet } from '@solana/wallet-adapter-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { StepConfigProvider } from '@/contexts/StepConfigContext';

const TokenCreationPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const { connected, connecting, publicKey } = useWallet();
  const [connectionAttempted, setConnectionAttempted] = useState(false);

  // Monitor wallet connection attempts
  useEffect(() => {
    if (connecting) {
      setConnectionAttempted(true);
    }
  }, [connecting]);

  // Handle connection errors
  useEffect(() => {
    if (connectionAttempted && !connected && !connecting) {
      toast({
        title: "Wallet Connection Issue",
        description: "There was a problem connecting to your wallet. Please try again.",
        variant: "destructive"
      });
      setConnectionAttempted(false);
    }
  }, [connectionAttempted, connected, connecting]);

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="flex items-center text-crypto-light hover:text-white" 
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={16} className="mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold ml-4">Create Token</h1>
          </div>
        </div>

        <Alert className="bg-blue-900/20 border-blue-800/30 mb-6">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription>
            If you experience network connectivity issues or balance update problems, use the "Change RPC" button to connect to a different Solana endpoint.
          </AlertDescription>
        </Alert>

        <StepConfigProvider>
          {!connected ? (
            <ConnectWalletPrompt>
              Please connect your wallet to create a token. Once created, 100% of the token supply will be sent to your wallet.
            </ConnectWalletPrompt>
          ) : (
            <TokenCreator />
          )}
        </StepConfigProvider>
      </div>
    </div>
  );
};

export default TokenCreationPage;
