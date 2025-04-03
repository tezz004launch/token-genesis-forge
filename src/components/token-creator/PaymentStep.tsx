
import React, { useState, useEffect } from 'react';
import { FeeBreakdown } from '@/lib/solana/tokenService';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Shield, Info, Coins, Loader2, RefreshCw, Zap, Clock, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from '@/components/ui/switch';
import ConnectionStatus from './ConnectionStatus';
import { RPC_ENDPOINTS, PLATFORM_FEE } from '@/lib/token/tokenCreatorUtils';

interface PaymentStepProps {
  feeBreakdown: FeeBreakdown | null;
  walletBalance: number | null;
  hasSufficientBalance: boolean;
  connectionState: 'connected' | 'unstable' | 'failed';
  isLoadingBalance: boolean;
  refreshWalletBalance: (force?: boolean) => Promise<void>;
  switchRpcEndpoint: () => void;
  currentRpcIndex: number;
  selectedNetwork: 'devnet' | 'mainnet-beta';
  onNext: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  feeBreakdown,
  walletBalance,
  hasSufficientBalance,
  connectionState,
  isLoadingBalance,
  refreshWalletBalance,
  switchRpcEndpoint,
  currentRpcIndex,
  selectedNetwork,
  onNext
}) => {
  const [showExactValues, setShowExactValues] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
  const [rateLimitDetected, setRateLimitDetected] = useState(false);
  
  // Listen for rate limiting errors in console logs
  useEffect(() => {
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
      const message = args.join(' ');
      if (message.includes('429') || 
          message.includes('Too many requests') || 
          message.includes('rate limit')) {
        setRateLimitDetected(true);
        
        // Auto-reset after 30 seconds
        setTimeout(() => setRateLimitDetected(false), 30000);
      }
      originalConsoleWarn.apply(console, args);
    };
    
    return () => {
      console.warn = originalConsoleWarn;
    };
  }, []);
  
  const handleRefreshBalance = async () => {
    setLastRefreshTime(Date.now());
    await refreshWalletBalance(true);
  };
  
  // Determine if refresh button should be disabled (prevent spam)
  const isRefreshDisabled = isLoadingBalance || 
    (lastRefreshTime && Date.now() - lastRefreshTime < 5000);
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Payment</h3>
        <p className="text-sm text-muted-foreground">
          Review payment details before creating your meme coin
        </p>
      </div>
      
      {rateLimitDetected && (
        <Alert className="bg-yellow-900/20 border-yellow-500/20">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertTitle>Rate Limiting Detected</AlertTitle>
          <AlertDescription>
            <p className="mb-2">You're being rate limited by the Solana RPC server. This can cause balance refresh failures.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={switchRpcEndpoint}
                className="text-xs border-yellow-500/30 hover:bg-yellow-500/10"
              >
                <Zap className="h-3 w-3 mr-1" />
                Try Different RPC
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs border-yellow-500/30 hover:bg-yellow-500/10"
                onClick={() => {
                  setTimeout(() => refreshWalletBalance(true), 5000);
                  setRateLimitDetected(false);
                }}
              >
                <Clock className="h-3 w-3 mr-1" />
                Wait & Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <ConnectionStatus 
        connectionState={connectionState}
        switchRpcEndpoint={switchRpcEndpoint}
        currentRpcIndex={currentRpcIndex}
        totalEndpoints={RPC_ENDPOINTS[selectedNetwork].length}
      />
      
      <Alert className="bg-green-900/20 border-green-500/20">
        <Shield className="h-4 w-4 text-green-500" />
        <AlertTitle>Secure Transaction</AlertTitle>
        <AlertDescription>
          This transaction is protected by wallet authentication and will require your approval.
        </AlertDescription>
      </Alert>

      <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-md mb-4">
        <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center gap-2">
          <Info className="h-4 w-4" /> Transaction Fee Breakdown
        </h4>
        <p className="text-xs text-blue-200/70 mb-3">
          Your transaction includes several fees required by the Solana blockchain:
        </p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground">Rent for Mint Account:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Cost to store your token's core information (supply, decimals, etc.) on-chain</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span>
              {showExactValues
                ? feeBreakdown ? (feeBreakdown.mintAccountRent / LAMPORTS_PER_SOL).toFixed(8) : "0.00200000"
                : feeBreakdown ? (feeBreakdown.mintAccountRent / LAMPORTS_PER_SOL).toFixed(5) : "0.00200"} SOL
            </span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground">Rent for Token Account:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Cost to store your token balance information on-chain</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span>
              {showExactValues
                ? feeBreakdown ? (feeBreakdown.tokenAccountRent / LAMPORTS_PER_SOL).toFixed(8) : "0.00200000"
                : feeBreakdown ? (feeBreakdown.tokenAccountRent / LAMPORTS_PER_SOL).toFixed(5) : "0.00200"} SOL
            </span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground">Network Transaction Fee:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Fee paid to Solana validators for processing your transaction</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span>
              {showExactValues
                ? feeBreakdown ? (feeBreakdown.transactionFee / LAMPORTS_PER_SOL).toFixed(8) : "0.00025000" 
                : feeBreakdown ? (feeBreakdown.transactionFee / LAMPORTS_PER_SOL).toFixed(5) : "0.00025"} SOL
            </span>
          </div>
          <div className="border-t border-blue-500/20 pt-2 mt-2"></div>
          <div className="flex justify-between font-medium">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">Platform Fee:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Fee for using our token creation service</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span>{PLATFORM_FEE} SOL</span>
          </div>
        </div>
      </div>
      
      <div className="bg-crypto-gray/30 p-6 rounded-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Total Required</span>
          <span className="font-medium text-lg">
            {showExactValues
              ? feeBreakdown ? (feeBreakdown.total / LAMPORTS_PER_SOL).toFixed(8) : PLATFORM_FEE.toFixed(8)
              : feeBreakdown ? (feeBreakdown.total / LAMPORTS_PER_SOL).toFixed(4) : PLATFORM_FEE.toFixed(4)} SOL
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Your Balance</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefreshBalance}
              className={`h-5 w-5 transition-all ${isRefreshDisabled ? 'opacity-50' : 'hover:bg-gray-700/50'}`}
              disabled={isRefreshDisabled}
              title={isRefreshDisabled && lastRefreshTime ? `Wait ${Math.ceil((5000 - (Date.now() - lastRefreshTime)) / 1000)}s to refresh again` : "Refresh balance"}
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingBalance ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh balance</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-medium ${
              hasSufficientBalance ? 'text-green-400' : 'text-red-500'
            }`}>
              {walletBalance !== null 
                ? showExactValues ? walletBalance.toFixed(8) : walletBalance.toFixed(4) 
                : "0.0000"} SOL
            </span>
            {isLoadingBalance && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-700 my-3" />
        
        <div className="flex items-center justify-between">
          <span className="font-medium">Total Due</span>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg">
              {showExactValues
                ? feeBreakdown ? (feeBreakdown.total / LAMPORTS_PER_SOL).toFixed(8) : PLATFORM_FEE.toFixed(8)
                : feeBreakdown ? (feeBreakdown.total / LAMPORTS_PER_SOL).toFixed(4) : PLATFORM_FEE.toFixed(4)} SOL
            </span>
            <Coins className="text-solana h-5 w-5" />
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <label htmlFor="show-exact" className="text-sm text-muted-foreground cursor-pointer">
              Show Exact Values
            </label>
            <Switch
              id="show-exact"
              checked={showExactValues}
              onCheckedChange={setShowExactValues}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enable this to display exact SOL values with more decimal places.
          </p>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground">
              RPC Connection:
            </span>
            <div className="mt-1 flex items-center gap-2">
              {connectionState === 'connected' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs text-green-400">Connected</span>
                </div>
              )}
              {connectionState === 'unstable' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-xs text-amber-400">Unstable</span>
                </div>
              )}
              {connectionState === 'failed' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-xs text-red-400">Failed</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Reload Page
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={switchRpcEndpoint}
              className="text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Change RPC ({currentRpcIndex + 1}/{RPC_ENDPOINTS[selectedNetwork].length})
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-crypto-gray/30 p-4 rounded-md flex items-start space-x-3">
        <Coins className="text-solana h-5 w-5 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm">
            This fee covers all costs associated with creating your meme coin on the Solana 
            {selectedNetwork === 'mainnet-beta' ? ' mainnet' : ' devnet'}, including blockchain rent payments and network transaction fees. 
            Your wallet will be prompted to approve this transaction.
          </p>
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          className="w-full bg-solana hover:bg-solana-dark"
          onClick={onNext}
          disabled={!hasSufficientBalance}
        >
          {!hasSufficientBalance ? (
            "Insufficient Balance"
          ) : (
            <>
              <Coins className="mr-2 h-4 w-4" />
              Create Token
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentStep;
