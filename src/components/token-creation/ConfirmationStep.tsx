
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Shield, Check } from 'lucide-react';
import TokenSummary from '../TokenSummary';

interface ConfirmationStepProps {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  tokenAddress: string | null;
  creationTxHash: string | null;
  selectedNetwork: 'devnet' | 'mainnet-beta';
  resetCreator: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  name,
  symbol,
  decimals,
  supply,
  tokenAddress,
  creationTxHash,
  selectedNetwork,
  resetCreator
}) => {
  if (tokenAddress && creationTxHash) {
    return (
      <TokenSummary
        name={name}
        symbol={symbol}
        decimals={decimals}
        totalSupply={supply}
        mintAddress={tokenAddress}
        txId={creationTxHash}
        cluster={selectedNetwork}
        onBack={resetCreator}
      />
    );
  }
  
  return (
    <div className="text-center space-y-6 py-6">
      <div className="w-20 h-20 mx-auto rounded-full border-2 border-crypto-green/30 flex items-center justify-center bg-crypto-green/10">
        <Check className="h-10 w-10 text-crypto-green" />
      </div>
      
      <h3 className="text-2xl font-medium">Meme Coin Created Successfully!</h3>
      
      <Alert className="bg-green-900/20 border-green-500/20 max-w-md mx-auto">
        <Shield className="h-4 w-4 text-green-500" />
        <AlertTitle>Authenticated Creation Complete</AlertTitle>
        <AlertDescription>
          Your token was created securely with your authenticated wallet.
        </AlertDescription>
      </Alert>
      
      <div className="bg-crypto-gray/30 p-6 rounded-md max-w-md mx-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Token Name</p>
            <p className="font-medium">{name} ({symbol})</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Network</p>
            <p className="font-medium">{selectedNetwork === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Token Address</p>
            <a 
              href={`https://explorer.solana.com/address/${tokenAddress}?cluster=${selectedNetwork}`}
              target="_blank"
              rel="noopener noreferrer" 
              className="text-sm font-mono text-solana hover:underline break-all"
            >
              {tokenAddress || "Token address would appear here"}
            </a>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Transaction Hash</p>
            <a 
              href={`https://explorer.solana.com/tx/${creationTxHash}?cluster=${selectedNetwork}`}
              target="_blank"
              rel="noopener noreferrer" 
              className="text-sm font-mono text-solana hover:underline break-all"
            >
              {creationTxHash || "Transaction hash would appear here"}
            </a>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2 pt-4">
        <Button 
          variant="outline" 
          className="border-crypto-green text-crypto-green hover:bg-crypto-green/10"
          onClick={resetCreator}
        >
          Create Another Meme Coin
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
