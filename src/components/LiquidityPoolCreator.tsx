
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Droplets, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { createLiquidityPool, getRaydiumPoolUrl, LiquidityPoolParams } from '@/lib/services/raydiumService';

interface LiquidityPoolCreatorProps {
  tokenMint: string;
  tokenSymbol: string;
}

const LiquidityPoolCreator: React.FC<LiquidityPoolCreatorProps> = ({ tokenMint, tokenSymbol }) => {
  const { publicKey, signTransaction } = useWallet();
  const [tokenAmount, setTokenAmount] = useState<string>('0');
  const [solAmount, setSolAmount] = useState<string>('0');
  const [isCreating, setIsCreating] = useState(false);
  const [poolCreated, setPoolCreated] = useState(false);
  const [poolId, setPoolId] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const handleCreatePool = async () => {
    if (!publicKey || !signTransaction) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (parseFloat(tokenAmount) <= 0 || parseFloat(solAmount) <= 0) {
      toast.error("Token and SOL amounts must be greater than zero");
      return;
    }

    setIsCreating(true);

    try {
      // Connect to Solana devnet
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

      const params: LiquidityPoolParams = {
        tokenMint,
        tokenAmount: parseFloat(tokenAmount),
        solAmount: parseFloat(solAmount)
      };

      const result = await createLiquidityPool(
        connection,
        { publicKey, signTransaction },
        params
      );

      if (result.success && result.poolId && result.txId) {
        setPoolId(result.poolId);
        setTxId(result.txId);
        setPoolCreated(true);
        toast.success("Liquidity pool created successfully!");
      } else {
        toast.error(result.error || "Failed to create liquidity pool");
      }
    } catch (error) {
      console.error("Error creating pool:", error);
      toast.error(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="border border-gray-800 bg-crypto-dark/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="text-blue-400" /> Create Liquidity Pool
        </CardTitle>
        <CardDescription className="text-crypto-light">
          Pair your {tokenSymbol} token with SOL to create a liquidity pool on Raydium
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!poolCreated ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-crypto-light">
                {tokenSymbol} token amount:
              </label>
              <Input 
                type="number"
                min="0"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                className="bg-crypto-gray border-gray-700"
                placeholder="Enter token amount"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-crypto-light">
                SOL amount:
              </label>
              <Input 
                type="number"
                min="0"
                step="0.01"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
                className="bg-crypto-gray border-gray-700"
                placeholder="Enter SOL amount"
              />
              <p className="text-xs text-gray-400">
                * You'll need SOL in your wallet to create the pool
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800 text-white space-y-3">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 size={18} />
              <span className="font-medium">Pool Created Successfully!</span>
            </div>
            
            <div className="text-sm space-y-2">
              <p><span className="text-gray-400">Pool ID:</span> {poolId}</p>
              <p><span className="text-gray-400">Transaction:</span> {txId?.substring(0, 8)}...{txId?.substring(txId.length - 8)}</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <a 
                href={`https://explorer.solana.com/tx/${txId}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer" 
                className="text-blue-400 flex items-center gap-1 text-sm hover:text-blue-300"
              >
                <ExternalLink size={14} /> View transaction on Solana Explorer
              </a>
              
              {poolId && (
                <a 
                  href={getRaydiumPoolUrl(poolId)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 flex items-center gap-1 text-sm hover:text-blue-300"
                >
                  <ExternalLink size={14} /> View pool on Raydium
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        {!poolCreated ? (
          <Button 
            onClick={handleCreatePool}
            disabled={isCreating || !publicKey || parseFloat(tokenAmount) <= 0 || parseFloat(solAmount) <= 0}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Pool...
              </>
            ) : (
              "Create Liquidity Pool"
            )}
          </Button>
        ) : (
          <Button 
            onClick={() => {setPoolCreated(false); setPoolId(null); setTxId(null);}}
            variant="outline"
            className="w-full border-blue-500 text-blue-400"
          >
            Create Another Pool
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default LiquidityPoolCreator;
