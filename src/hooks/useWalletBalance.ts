
import { useState, useCallback, useEffect } from 'react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { toast } from '@/hooks/use-toast';
import {
  createReliableConnection,
  CONNECTION_TIMEOUT,
  CONNECTION_RETRY_DELAY,
  MAX_RETRY_DELAY
} from '@/lib/token/tokenCreatorUtils';

interface UseWalletBalanceProps {
  publicKey: PublicKey | null;
  selectedNetwork: 'devnet' | 'mainnet-beta';
  currentRpcIndex: number;
}

interface UseWalletBalanceReturn {
  walletBalance: number | null;
  isLoadingBalance: boolean;
  connectionState: 'connected' | 'unstable' | 'failed';
  refreshWalletBalance: (force?: boolean) => Promise<void>;
  retryDelay: number;
  setRetryDelay: React.Dispatch<React.SetStateAction<number>>;
  balanceRefreshAttempts: number;
  setBalanceRefreshAttempts: React.Dispatch<React.SetStateAction<number>>;
  lastBalanceUpdateTime: number | null;
  setLastBalanceUpdateTime: React.Dispatch<React.SetStateAction<number | null>>;
  setConnectionState: React.Dispatch<React.SetStateAction<'connected' | 'unstable' | 'failed'>>;
}

export const useWalletBalance = ({
  publicKey,
  selectedNetwork,
  currentRpcIndex
}: UseWalletBalanceProps): UseWalletBalanceReturn => {
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balanceRefreshAttempts, setBalanceRefreshAttempts] = useState(0);
  const [lastBalanceUpdateTime, setLastBalanceUpdateTime] = useState<number | null>(null);
  const [retryDelay, setRetryDelay] = useState(CONNECTION_RETRY_DELAY);
  const [connectionState, setConnectionState] = useState<'connected' | 'unstable' | 'failed'>('connected');

  const refreshWalletBalance = useCallback(async (force: boolean = false) => {
    if (!publicKey) return;
    
    if (!force && lastBalanceUpdateTime && Date.now() - lastBalanceUpdateTime < 3000) {
      return;
    }

    try {
      setIsLoadingBalance(true);
      
      const reliableConnection = createReliableConnection(selectedNetwork, currentRpcIndex);
      
      let success = false;
      let balance = 0;
      let attemptCount = 0;
      const maxAttempts = 3;
      
      while (attemptCount < maxAttempts && !success) {
        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Balance fetch timeout")), CONNECTION_TIMEOUT);
          });
          
          balance = await Promise.race([
            reliableConnection.getBalance(publicKey),
            timeoutPromise
          ]) as number;
          
          success = true;
          setConnectionState('connected');
          console.log(`Balance fetch successful: ${balance / LAMPORTS_PER_SOL} SOL`);
          
        } catch (error) {
          attemptCount++;
          console.warn(`Balance fetch attempt ${attemptCount} failed: ${error}`);
          
          if (attemptCount < maxAttempts) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
      
      if (!success) {
        setBalanceRefreshAttempts(prev => prev + 1);
        
        if (balanceRefreshAttempts >= 1) {
          setConnectionState('unstable');
        }
        
        if (balanceRefreshAttempts >= 2) {
          setConnectionState('failed');
          
          toast({
            title: "Network Connection Issues",
            description: "We're having trouble connecting to the Solana network. Try switching to a different RPC endpoint.",
            variant: "destructive",
          });
        }
        
        const newRetryDelay = Math.min(retryDelay * 1.5, MAX_RETRY_DELAY);
        setRetryDelay(newRetryDelay);
      } else {
        setBalanceRefreshAttempts(0);
        setRetryDelay(CONNECTION_RETRY_DELAY);
        setWalletBalance(balance / LAMPORTS_PER_SOL);
        setLastBalanceUpdateTime(Date.now());
        console.log(`Refreshed wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
      }
    } catch (error) {
      console.error("Error in balance refresh flow:", error);
      setConnectionState('failed');
      
      toast({
        title: "Balance Update Failed",
        description: "Could not fetch your wallet balance. Please try switching RPC endpoints.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingBalance(false);
    }
  }, [publicKey, selectedNetwork, balanceRefreshAttempts, lastBalanceUpdateTime, 
      retryDelay, currentRpcIndex]);

  return {
    walletBalance,
    isLoadingBalance,
    connectionState,
    refreshWalletBalance,
    retryDelay,
    setRetryDelay,
    balanceRefreshAttempts,
    setBalanceRefreshAttempts,
    lastBalanceUpdateTime,
    setLastBalanceUpdateTime,
    setConnectionState
  };
};
