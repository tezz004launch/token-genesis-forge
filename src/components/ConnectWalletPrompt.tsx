
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Coins, Lock, Wallet } from 'lucide-react';

const ConnectWalletPrompt = () => {
  return (
    <Card className="border border-solana/20 bg-crypto-gray/50 backdrop-blur-sm shadow-lg max-w-xl mx-auto">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="text-solana" /> Connect Your Wallet to Begin
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center space-y-6 py-6">
          <div className="w-20 h-20 mx-auto rounded-full border-2 border-solana/30 flex items-center justify-center bg-crypto-gray">
            <Lock className="h-10 w-10 text-solana" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-medium">First Step to Creating Your Token</h3>
            <p className="text-crypto-light">
              To create your own SPL token on Solana, you need to connect your wallet first.
              This allows us to interact with the Solana blockchain on your behalf.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-crypto-dark/50 p-3 rounded-lg">
              <Coins className="text-crypto-green" />
              <span>You'll need at least 0.06 SOL for token creation + fees</span>
            </div>
          </div>
          
          <div className="pt-4 flex justify-center">
            <WalletMultiButton className="!bg-gradient-to-r from-solana to-crypto-blue hover:opacity-90 transition-opacity" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectWalletPrompt;
