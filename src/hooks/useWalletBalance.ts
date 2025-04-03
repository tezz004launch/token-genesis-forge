
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
    const intervalId = setInterval(() => {
      clearRpcBlacklist(selectedNetwork);
    }, 5 * 60 * 1000); // Clear blacklist every 5 minutes
    
    return () => clearInterval(intervalId);
  }, [selectedNetwork]);

  // Set up a new connection when network or RPC index changes
  useEffect(() => {
    // Clear any existing connection
    connectionRef.current = null;

    try {
      // Get a new connection from the available endpoints
      const { endpoint } = getAvailableEndpoint(selectedNetwork, currentRpcIndex);
      lastEndpointRef.current = endpoint;
      connectionRef.current = createReliableConnection(selectedNetwork, currentRpcIndex);
      console.log(`[useWalletBalance] Created new connection for ${selectedNetwork} using endpoint: ${endpoint}`);
    } catch (error) {
      console.error(`[useWalletBalance] Failed to create connection:`, error);
    }
    
    // Reset connection state and counters
    setConnectionState('connected');
    setBalanceRefreshAttempts(0);
    setRetryDelay(CONNECTION_RETRY_DELAY);
    consecutiveFailsRef.current = 0;
  }, [selectedNetwork, currentRpcIndex]);

  const refreshWalletBalance = useCallback(async (force: boolean = false) => {
    // Skip if no wallet is connected
    if (!publicKey) {
      console.log("[useWalletBalance] No wallet connected, skipping balance refresh");
      return;
    }
    
    // Prevent too frequent refreshes unless forced
    if (!force && lastBalanceUpdateTime && Date.now() - lastBalanceUpdateTime < 5000) {
      console.log("[useWalletBalance] Skipping balance refresh (too soon since last update)");
      return;
    }
    
    // Use cached balance if available and not forcing refresh
    if (!force) {
      const cachedBalance = getCachedBalance(publicKey.toString(), selectedNetwork);
      if (cachedBalance !== null) {
        console.log("[useWalletBalance] Using cached balance:", cachedBalance);
        setWalletBalance(cachedBalance);
        setLastBalanceUpdateTime(Date.now());
        setConnectionState('connected');
        setBalanceRefreshAttempts(0);
        return;
      }
    }
    
    // Prevent concurrent refresh requests
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
        try {
          const { endpoint } = getAvailableEndpoint(selectedNetwork, currentRpcIndex);
          lastEndpointRef.current = endpoint;
          connectionRef.current = createReliableConnection(selectedNetwork, currentRpcIndex);
        } catch (error) {
          console.error("[useWalletBalance] Failed to create connection:", error);
          // Fall back to using a direct connection as last resort
          const fallbackEndpoint = selectedNetwork === 'devnet' ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com';
          connectionRef.current = new Connection(fallbackEndpoint);
          lastEndpointRef.current = fallbackEndpoint;
        }
      }
      
      let success = false;
      let balance = 0;
      let attemptCount = 0;
      const maxAttempts = 3; // Reduced from 6 to avoid too many requests
      let lastError: any = null;
      
      // Try multiple times with different endpoints if needed
      while (attemptCount < maxAttempts && !success) {
        try {
          // Only log the first attempt, to reduce console spam
          if (attemptCount === 0) {
            console.log(`[useWalletBalance] Fetch attempt ${attemptCount + 1}/${maxAttempts} using endpoint: ${connectionRef.current?.rpcEndpoint}`);
          }
          
          // Race between the balance fetch and a timeout
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("Balance fetch timeout")), CONNECTION_TIMEOUT);
          });
          
          if (!connectionRef.current) {
            throw new Error("No valid connection");
          }
          
          // Try to get the balance with timeout protection
          balance = await Promise.race([
            connectionRef.current.getBalance(publicKey),
            timeoutPromise
          ]) as number;
          
          // Success path
          success = true;
          consecutiveFailsRef.current = 0;
          setConnectionState('connected');
          console.log(`[useWalletBalance] Success! Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
          
          // Cache the successful result
          setCachedBalance(publicKey.toString(), selectedNetwork, balance / LAMPORTS_PER_SOL);
        } catch (error) {
          attemptCount++;
          lastError = error;
          
          // Only log failures for transparency, but don't spam
          if (attemptCount <= 2) {
            console.warn(`[useWalletBalance] Attempt ${attemptCount} failed:`, error);
          }
          
          // Try to switch endpoints if this was an RPC error
          if (connectionRef.current) {
            const currentEndpoint = connectionRef.current.rpcEndpoint;
            const wasRpcError = handleRpcError(error, selectedNetwork, currentEndpoint);
            
            if (wasRpcError) {
              console.log("[useWalletBalance] Switching to a different RPC endpoint due to error");
              try {
                const { endpoint, index } = getAvailableEndpoint(selectedNetwork, currentRpcIndex + attemptCount);
                lastEndpointRef.current = endpoint;
                connectionRef.current = createReliableConnection(selectedNetwork, index);
              } catch (endpointError) {
                console.error("[useWalletBalance] Failed to get alternative endpoint:", endpointError);
              }
            }
          }
          
          // Exponential backoff between attempts
          if (attemptCount < maxAttempts) {
            const delayMs = Math.min(CONNECTION_RETRY_DELAY * Math.pow(1.5, attemptCount - 1), MAX_RETRY_DELAY);
            console.log(`[useWalletBalance] Waiting ${delayMs}ms before next attempt`);
            await new Promise(r => setTimeout(r, delayMs));
          }
        }
      }
      
      // Handle the final outcome - success or failure after all attempts
      if (!success) {
        console.warn(`[useWalletBalance] All ${maxAttempts} attempts failed. Last error: `, lastError);
        consecutiveFailsRef.current += 1;
        setBalanceRefreshAttempts(prev => prev + 1);
        
        // Update connection state based on consecutive failures
        if (consecutiveFailsRef.current >= 2) {
          setConnectionState('unstable');
        }
        
        if (consecutiveFailsRef.current >= 3) {
          setConnectionState('failed');
          
          // Notify the user
          toast({
            title: "Network Connection Issues",
            description: "Having trouble connecting to Solana. Try switching to a different RPC endpoint.",
            variant: "destructive",
          });
        }
        
        // Use a cached balance as fallback if we have one
        const cachedBalance = getCachedBalance(publicKey.toString(), selectedNetwork);
        if (cachedBalance !== null) {
          console.log("[useWalletBalance] Using cached balance as fallback after fetch failure");
          setWalletBalance(cachedBalance);
        }
        
        // Increase retry delay with exponential backoff
        const newRetryDelay = Math.min(retryDelay * 1.5, MAX_RETRY_DELAY);
        setRetryDelay(newRetryDelay);
      } else {
        // Reset counters on success
        setBalanceRefreshAttempts(0);
        setRetryDelay(CONNECTION_RETRY_DELAY);
        setWalletBalance(balance / LAMPORTS_PER_SOL);
        setLastBalanceUpdateTime(Date.now());
      }
    } catch (error) {
      console.error("[useWalletBalance] Critical error in refresh flow:", error);
      setConnectionState('failed');
      
      // Notify the user about the critical failure
      toast({
        title: "Balance Update Failed",
        description: "Could not fetch your wallet balance. Please try switching RPC endpoints.",
        variant: "destructive"
      });
    } finally {
      // Always ensure we clear the loading state
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

  // Set up regular balance refresh when wallet is connected
  useEffect(() => {
    if (publicKey) {
      console.log(`[useWalletBalance] Wallet connected: ${publicKey.toString()}`);
      
      // Initial fetch with delay
      if (isInitialFetch.current) {
        console.log("[useWalletBalance] Initial balance fetch");
        // Small delay before first fetch to ensure connections are established
        setTimeout(() => {
          refreshWalletBalance(true);
        }, 300);
        isInitialFetch.current = false;
      }
      
      // Clear any existing interval
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
      
      // Set up periodic balance refresh
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
      
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    }
  }, [publicKey, refreshWalletBalance]);

  // Refresh balance when network or RPC changes
  useEffect(() => {
    if (publicKey) {
      console.log(`[useWalletBalance] Network/RPC changed, refreshing balance`);
      setConnectionState('connected');
      setBalanceRefreshAttempts(0);
      consecutiveFailsRef.current = 0;
      
      // Small delay before fetching to ensure connection is established
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
