
import { useState, useCallback, useEffect, useRef } from 'react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { toast } from '@/hooks/use-toast';
import {
  createReliableConnection,
  CONNECTION_TIMEOUT,
  CONNECTION_RETRY_DELAY,
  MAX_RETRY_DELAY,
  BALANCE_REFRESH_INTERVAL,
  handleRpcError,
  getCachedBalance,
  setCachedBalance,
  rpcEndpointBlacklist,
  getAvailableEndpoint,
  clearRpcBlacklist
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
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialFetch = useRef(true);
  const lastRefreshAttempt = useRef<number>(0);
  const connectionRef = useRef<Connection | null>(null);
  const lastEndpointRef = useRef<string | null>(null);
  const consecutiveFailsRef = useRef<number>(0);

  // Clear RPC blacklist periodically
  useEffect(() => {
    const clearInterval = setInterval(() => {
      clearRpcBlacklist(selectedNetwork);
    }, 5 * 60 * 1000); // Clear blacklist every 5 minutes
    
    return () => clearInterval(clearInterval);
  }, [selectedNetwork]);

  // Update connection when network or RPC changes
  useEffect(() => {
    // Clear any existing connection
    connectionRef.current = null;
    
    // Create a new connection with the updated network/RPC
    try {
      const { endpoint } = getAvailableEndpoint(selectedNetwork, currentRpcIndex);
      lastEndpointRef.current = endpoint;
      connectionRef.current = createReliableConnection(selectedNetwork, currentRpcIndex);
      console.log(`[useWalletBalance] Created new connection for ${selectedNetwork} using endpoint: ${endpoint}`);
    } catch (error) {
      console.error(`[useWalletBalance] Failed to create connection:`, error);
    }
    
    // Reset connection state when switching networks
    setConnectionState('connected');
    setBalanceRefreshAttempts(0);
    setRetryDelay(CONNECTION_RETRY_DELAY);
    consecutiveFailsRef.current = 0;
    
  }, [selectedNetwork, currentRpcIndex]);

  const refreshWalletBalance = useCallback(async (force: boolean = false) => {
    if (!publicKey) {
      console.log("[useWalletBalance] No wallet connected, skipping balance refresh");
      return;
    }
    
    // Throttle requests unless forced
    if (!force && lastBalanceUpdateTime && Date.now() - lastBalanceUpdateTime < 5000) {
      console.log("[useWalletBalance] Skipping balance refresh (too soon since last update)");
      return;
    }
    
    // Check cache first unless forced
    if (!force) {
      const cachedBalance = getCachedBalance(publicKey.toString(), selectedNetwork);
      if (cachedBalance !== null) {
        setWalletBalance(cachedBalance);
        setLastBalanceUpdateTime(Date.now());
        setConnectionState('connected');
        setBalanceRefreshAttempts(0);
        return;
      }
    }
    
    // Prevent concurrent refresh attempts
    const now = Date.now();
    if (!force && now - lastRefreshAttempt.current < 2000) {
      console.log("[useWalletBalance] Skipping balance refresh (concurrent request prevented)");
      return;
    }
    lastRefreshAttempt.current = now;

    try {
      console.log(`[useWalletBalance] Starting balance refresh for ${publicKey.toString()}`);
      setIsLoadingBalance(true);
      
      // Ensure we have a valid connection
      if (!connectionRef.current || lastEndpointRef.current !== connectionRef.current.rpcEndpoint) {
        console.log("[useWalletBalance] Creating new connection");
        const { endpoint } = getAvailableEndpoint(selectedNetwork, currentRpcIndex);
        lastEndpointRef.current = endpoint;
        connectionRef.current = createReliableConnection(selectedNetwork, currentRpcIndex);
      }
      
      let success = false;
      let balance = 0;
      let attemptCount = 0;
      const maxAttempts = 6;
      let lastError: any = null;
      
      while (attemptCount < maxAttempts && !success) {
        try {
          console.log(`[useWalletBalance] Fetch attempt ${attemptCount + 1}/${maxAttempts} using endpoint: ${connectionRef.current.rpcEndpoint}`);
          
          // Create a timeout promise to race against
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("Balance fetch timeout")), CONNECTION_TIMEOUT);
          });
          
          balance = await Promise.race([
            connectionRef.current.getBalance(publicKey),
            timeoutPromise
          ]) as number;
          
          // If we got here, the balance fetch was successful
          success = true;
          consecutiveFailsRef.current = 0;
          setConnectionState('connected');
          console.log(`[useWalletBalance] Success! Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
          
          // Cache the balance
          setCachedBalance(publicKey.toString(), selectedNetwork, balance);
          
        } catch (error) {
          attemptCount++;
          lastError = error;
          console.warn(`[useWalletBalance] Attempt ${attemptCount} failed:`, error);
          
          // Check if this was a rate limit error and blacklist the endpoint if needed
          const currentEndpoint = connectionRef.current.rpcEndpoint;
          const wasRpcError = handleRpcError(error, selectedNetwork, currentEndpoint);
          
          if (wasRpcError) {
            // Try a new connection with a different endpoint
            console.log("[useWalletBalance] Switching to a different RPC endpoint due to error");
            const { endpoint, index } = getAvailableEndpoint(selectedNetwork, currentRpcIndex + attemptCount);
            lastEndpointRef.current = endpoint;
            connectionRef.current = createReliableConnection(selectedNetwork, index);
          }
          
          // Add some delay before next attempt with exponential backoff
          if (attemptCount < maxAttempts) {
            const delayMs = Math.min(CONNECTION_RETRY_DELAY * Math.pow(1.5, attemptCount - 1), MAX_RETRY_DELAY);
            console.log(`[useWalletBalance] Waiting ${delayMs}ms before next attempt`);
            await new Promise(r => setTimeout(r, delayMs));
          }
        }
      }
      
      if (!success) {
        console.warn(`[useWalletBalance] All ${maxAttempts} attempts failed. Last error: `, lastError);
        consecutiveFailsRef.current += 1;
        setBalanceRefreshAttempts(prev => prev + 1);
        
        // If we've had several consecutive failures, update connection state
        if (consecutiveFailsRef.current >= 2) {
          setConnectionState('unstable');
        }
        
        if (consecutiveFailsRef.current >= 3) {
          setConnectionState('failed');
          
          toast({
            title: "Network Connection Issues",
            description: "We're having trouble connecting to the Solana network. Try switching to a different RPC endpoint.",
            variant: "destructive",
          });
        }
        
        // Increase retry delay with exponential backoff (capped)
        const newRetryDelay = Math.min(retryDelay * 1.5, MAX_RETRY_DELAY);
        setRetryDelay(newRetryDelay);
      } else {
        // Success! Reset failure counters and update balance
        setBalanceRefreshAttempts(0);
        setRetryDelay(CONNECTION_RETRY_DELAY);
        setWalletBalance(balance / LAMPORTS_PER_SOL);
        setLastBalanceUpdateTime(Date.now());
      }
    } catch (error) {
      console.error("[useWalletBalance] Critical error in refresh flow:", error);
      setConnectionState('failed');
      
      toast({
        title: "Balance Update Failed",
        description: "Could not fetch your wallet balance. Please try switching RPC endpoints.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingBalance(false);
    }
  }, [
    publicKey, 
    selectedNetwork, 
    balanceRefreshAttempts, 
    lastBalanceUpdateTime, 
    retryDelay, 
    currentRpcIndex
  ]);

  // Setup auto-refresh interval when wallet is connected
  useEffect(() => {
    if (publicKey) {
      console.log(`[useWalletBalance] Wallet connected: ${publicKey.toString()}`);
      
      // Immediate balance fetch when wallet connects
      if (isInitialFetch.current) {
        console.log("[useWalletBalance] Initial balance fetch");
        // Short delay to ensure wallet is fully ready
        setTimeout(() => {
          refreshWalletBalance(true);
        }, 300);
        isInitialFetch.current = false;
      }
      
      // Set up auto-refresh interval
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setInterval(() => {
        console.log("[useWalletBalance] Auto-refreshing balance");
        refreshWalletBalance();
      }, BALANCE_REFRESH_INTERVAL);
      
      return () => {
        if (refreshTimeoutRef.current) {
          clearInterval(refreshTimeoutRef.current);
          refreshTimeoutRef.current = null;
        }
      };
    } else {
      // Reset state when wallet disconnects
      console.log("[useWalletBalance] Wallet disconnected, resetting state");
      setWalletBalance(null);
      isInitialFetch.current = true;
      consecutiveFailsRef.current = 0;
      
      // Clear interval if wallet disconnects
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    }
  }, [publicKey, refreshWalletBalance]);

  // Force balance refresh when switching networks or RPC endpoints
  useEffect(() => {
    if (publicKey) {
      console.log(`[useWalletBalance] Network/RPC changed, refreshing balance`);
      setConnectionState('connected');
      setBalanceRefreshAttempts(0);
      consecutiveFailsRef.current = 0;
      
      // Small delay to ensure new connection is established
      setTimeout(() => {
        refreshWalletBalance(true);
      }, 500);
    }
  }, [selectedNetwork, currentRpcIndex, publicKey, refreshWalletBalance]);

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
