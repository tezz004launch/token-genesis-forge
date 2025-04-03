
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Coins, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import LiquidityPoolCreator from './LiquidityPoolCreator';

interface TokenSummaryProps {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  mintAddress: string;
  txId: string;
  cluster?: string;
}

const TokenSummary: React.FC<TokenSummaryProps> = ({
  name,
  symbol,
  decimals,
  totalSupply,
  mintAddress,
  txId,
  cluster = 'devnet'
}) => {
  const { toast } = useToast();
  
  const copyToClipboard = (text: string, itemName: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          description: `${itemName} copied to clipboard!`,
        });
      },
      () => {
        toast({
          variant: "destructive",
          description: `Failed to copy ${itemName.toLowerCase()}`,
        });
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-800 bg-crypto-dark/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="text-purple-400" /> Token Created Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Token Name</p>
              <p className="font-medium">{name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Symbol</p>
              <p className="font-medium">{symbol}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Decimals</p>
              <p className="font-medium">{decimals}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Supply</p>
              <p className="font-medium">{totalSupply.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Network</p>
              <p className="font-medium">{cluster === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}</p>
            </div>
          </div>
          
          <Separator className="my-2 bg-gray-800" />
          
          <div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Token Address</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => copyToClipboard(mintAddress, "Token address")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="font-mono text-sm break-all">{mintAddress}</p>
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Transaction</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => copyToClipboard(txId, "Transaction ID")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="font-mono text-sm break-all">{txId}</p>
            <a
              href={`https://explorer.solana.com/tx/${txId}?cluster=${cluster}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 flex items-center gap-1 mt-1 hover:text-blue-300"
            >
              <ExternalLink className="h-3 w-3" /> View on Solana Explorer
            </a>
          </div>
        </CardContent>
      </Card>
      
      <LiquidityPoolCreator tokenMint={mintAddress} tokenSymbol={symbol} />
    </div>
  );
};

export default TokenSummary;
