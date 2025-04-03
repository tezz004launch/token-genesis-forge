
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, ArrowRight, Droplets, BarChart3, Wallet, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TokenCreationInfo: React.FC = () => {
  return (
    <Card className="border border-gray-800 bg-crypto-gray/30 backdrop-blur-sm mb-8">
      <CardContent className="p-6">
        <h2 className="text-xl font-medium mb-4">How Token Creation Works</h2>
        
        <div className="space-y-6">
          <p className="text-sm text-crypto-light">
            Creating a meme coin on Solana involves these steps:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
            <div className="bg-crypto-dark/60 p-4 rounded-lg flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-purple-900/30 flex items-center justify-center mb-2">
                <Wallet className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-medium mb-1">1. Pay Fees</h3>
              <p className="text-xs text-crypto-light">Network fees + platform fee</p>
            </div>
            
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-gray-500" />
            </div>
            
            <div className="bg-crypto-dark/60 p-4 rounded-lg flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center mb-2">
                <Coins className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-medium mb-1">2. Create Token</h3>
              <p className="text-xs text-crypto-light">100% supply to your wallet</p>
            </div>
            
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-gray-500" />
            </div>
            
            <div className="bg-crypto-dark/60 p-4 rounded-lg flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-green-900/30 flex items-center justify-center mb-2">
                <Droplets className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-sm font-medium mb-1">3. Add Liquidity</h3>
              <p className="text-xs text-crypto-light">Make token tradable</p>
            </div>
          </div>
          
          <Alert className="bg-amber-900/20 border-amber-500/30 mt-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-sm">
              <strong>Balance Tip:</strong> Make sure you have enough SOL in your wallet. If you see "Insufficient Balance" but believe you have enough funds, try refreshing your balance or switching to "Show Exact Values" in the payment step.
            </AlertDescription>
          </Alert>
          
          <div className="bg-blue-900/20 border border-blue-800/30 p-4 rounded-md mt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" /> Tradable on Exchanges
            </h4>
            <p className="text-xs text-crypto-light">
              After creating a liquidity pool, your token will appear on Raydium and be tracked by platforms like Dexscreener,
              allowing anyone to buy, sell and trade your token.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCreationInfo;
