
import React from 'react';
import { Progress } from '@/components/ui/progress';
import TokenSummary from '../TokenSummary';

interface CreationProgressProps {
  progress: number;
  creationTxHash: string | null;
  tokenAddress: string | null;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenSupply: number;
  selectedNetwork: 'devnet' | 'mainnet-beta';
}

const CreationProgress: React.FC<CreationProgressProps> = ({
  progress,
  creationTxHash,
  tokenAddress,
  tokenName,
  tokenSymbol,
  tokenDecimals,
  tokenSupply,
  selectedNetwork
}) => {
  return (
    <div className="py-8 text-center space-y-6">
      <h3 className="text-lg font-semibold">Creating Your Token</h3>
      <Progress value={progress} className="w-full max-w-md mx-auto" />
      <p className="text-sm text-crypto-light">
        {progress < 50 ? "Preparing transaction..." : 
         progress < 90 ? "Confirming on blockchain..." : 
         "Token creation success!"}
      </p>
      {creationTxHash && tokenAddress && (
        <TokenSummary 
          name={tokenName}
          symbol={tokenSymbol}
          decimals={tokenDecimals}
          totalSupply={tokenSupply}
          txId={creationTxHash}
          mintAddress={tokenAddress}
          cluster={selectedNetwork}
        />
      )}
    </div>
  );
};

export default CreationProgress;
