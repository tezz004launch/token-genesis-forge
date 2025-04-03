
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TokenCreator from '@/components/TokenCreator';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';
import ConnectWalletPrompt from '@/components/ConnectWalletPrompt';
import { useWallet } from '@solana/wallet-adapter-react';
import TokenCreationInfo from '@/components/TokenCreationInfo';

const TokenCreationPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            className="flex items-center text-crypto-light hover:text-white" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold ml-4">Create Meme Coin</h1>
        </div>

        <TokenCreationInfo />

        {!connected ? (
          <ConnectWalletPrompt>
            Please connect your wallet to create a meme coin. Once created, 100% of the token supply will be sent to your wallet.
          </ConnectWalletPrompt>
        ) : (
          <TokenCreator />
        )}
      </div>
    </div>
  );
};

export default TokenCreationPage;
