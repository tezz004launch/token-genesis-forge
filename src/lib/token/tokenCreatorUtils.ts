import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { toast } from '@/hooks/use-toast';
import { FeeBreakdown } from '@/lib/solana/tokenService';
import { TokenForm } from '@/types/token';

// Constants moved from TokenCreator.tsx
export const PLATFORM_FEE = 0.05;
export const FEE_RECIPIENT = "FMZJ2zuacqYiyE8E9ysQxALBkcTvCohUH";
export const BALANCE_BUFFER = 0.001;
export const BALANCE_REFRESH_INTERVAL = 10000; // Increased to 10 seconds to reduce rate limiting
export const CONNECTION_RETRY_DELAY = 2000; // Increased initial delay to 2 seconds
export const MAX_RETRY_DELAY = 15000; // Increased max delay to 15 seconds
export const CONNECTION_TIMEOUT = 40000; // Increased timeout for connections to 40 seconds
export const RPC_QUALITY_SCORE = 8; // Number of attempts an RPC gets before we try another

// Track rate limited endpoints to avoid reusing them immediately
export const rpcEndpointBlacklist = {
  'devnet': new Set<string>(),
  'mainnet-beta': new Set<string>()
};

// Expanded RPC endpoints with more reliable options
export const RPC_ENDPOINTS = {
  'devnet': [
    'https://api.devnet.solana.com', 
    'https://devnet.helius-rpc.com/?api-key=15319106-5848-42fd-83c2-b9bdfe17f12c',
    'https://rpc-devnet.helius.xyz/?api-key=15319106-5848-42fd-83c2-b9bdfe17f12c',
    'https://solana-devnet-rpc.allthatnode.com',
    'https://mango.devnet.rpcpool.com',
    'https://devnet.genesysgo.net',
    'https://api.devnet.rpcpool.com',
    'https://solana-devnet.g.alchemy.com/v2/demo',
    'https://devnet.solana.com',
    'https://api.testnet.solana.com',
    'https://solana-devnet.phantom.app/YBPpkkN4g91xDiAnTE9r0RcMkjg0sKUIWvAfoFVJ',
    'https://devnet.solananode.org'
  ],
  'mainnet-beta': [
    'https://api.mainnet-beta.solana.com',
    'https://rpc-mainnet.helius.xyz/?api-key=15319106-5848-42fd-83c2-b9bdfe17f12c',
    'https://mainnet.helius-rpc.com/?api-key=15319106-5848-42fd-83c2-b9bdfe17f12c',
    'https://solana-mainnet.g.alchemy.com/v2/demo',
    'https://rpc.ankr.com/solana',
    'https://solana-api.projectserum.com',
    'https://solana.public-rpc.com',
    'https://api.mainnet.rpcpool.com',
    'https://mainnet.solananode.org',
    'https://ssc-dao.genesysgo.net',
    'https://solana-mainnet.phantom.app/YBPpkkN4g91xDiAnTE9r0RcMkjg0sKUIWvAfoFVJ',
    'https://solana.rpcpool.com'
  ]
};

// Clear blacklist after a cooldown period
export const clearRpcBlacklist = (network: 'devnet' | 'mainnet-beta', endpoint?: string) => {
  if (endpoint) {
    rpcEndpointBlacklist[network].delete(endpoint);
    console.log(`[tokenCreatorUtils] Removed ${endpoint} from ${network} blacklist`);
  } else {
    rpcEndpointBlacklist[network].clear();
    console.log(`[tokenCreatorUtils] Cleared entire ${network} blacklist`);
  }
};

// Schedule endpoint to be removed from blacklist after cooldown
export const scheduleEndpointRecovery = (
  network: 'devnet' | 'mainnet-beta',
  endpoint: string,
  cooldownMs: number = 30000
) => {
  setTimeout(() => {
    clearRpcBlacklist(network, endpoint);
  }, cooldownMs);
  console.log(`[tokenCreatorUtils] Scheduled ${endpoint} for recovery in ${cooldownMs}ms`);
};

export const hasSufficientBalance = (
  walletBalance: number | null, 
  feeBreakdown: FeeBreakdown | null
): boolean => {
  if (walletBalance === null || feeBreakdown === null) return false;
  
  const requiredBalance = feeBreakdown.total / LAMPORTS_PER_SOL + BALANCE_BUFFER;
  const hasEnough = walletBalance >= requiredBalance;
  
  console.log(`Balance check: ${walletBalance} SOL available, ${requiredBalance} SOL required (including ${BALANCE_BUFFER} SOL buffer)`);
  
  if (!hasEnough && walletBalance > 0) {
    toast({
      title: "Insufficient Balance",
      description: `You need at least ${requiredBalance.toFixed(4)} SOL in your wallet. Current balance: ${walletBalance.toFixed(4)} SOL`,
      variant: "destructive"
    });
  }
  
  return hasEnough;
};

export const validateTokenForm = (form: TokenForm) => {
  const errors = {
    name: '',
    symbol: '',
    supply: ''
  };
  
  if (!form.name.trim()) {
    errors.name = 'Token name is required';
  }
  
  if (!form.symbol.trim()) {
    errors.symbol = 'Token symbol is required';
  } else if (form.symbol.length > 8) {
    errors.symbol = 'Symbol must be 8 characters or less';
  }
  
  if (form.supply <= 0) {
    errors.supply = 'Supply must be greater than 0';
  }
  
  const hasErrors = Object.values(errors).some(error => error !== '');
  
  if (hasErrors) {
    console.log("Form validation failed:", errors);
    
    const errorMessages = [];
    if (errors.name) errorMessages.push(`Name: ${errors.name}`);
    if (errors.symbol) errorMessages.push(`Symbol: ${errors.symbol}`);
    if (errors.supply) errorMessages.push(`Supply: ${errors.supply}`);
    
    toast({
      title: "Form Validation Failed",
      description: errorMessages.join(', '),
      variant: "destructive"
    });
  }
  
  return {
    errors,
    isValid: !hasErrors
  };
};

// Get a non-blacklisted endpoint with improved reliability
export const getAvailableEndpoint = (
  network: 'devnet' | 'mainnet-beta', 
  currentIndex: number
): { endpoint: string; index: number } => {
  const endpoints = RPC_ENDPOINTS[network];
  const blacklist = rpcEndpointBlacklist[network];
  
  // First try the current index if it's not blacklisted
  const currentEndpoint = endpoints[currentIndex % endpoints.length];
  if (!blacklist.has(currentEndpoint)) {
    return { endpoint: currentEndpoint, index: currentIndex };
  }
  
  // Otherwise try to find any non-blacklisted endpoint
  for (let i = 0; i < endpoints.length; i++) {
    const index = (currentIndex + i + 1) % endpoints.length;
    const endpoint = endpoints[index];
    if (!blacklist.has(endpoint)) {
      console.log(`[tokenCreatorUtils] Found non-blacklisted endpoint at index ${index}: ${endpoint}`);
      return { endpoint, index };
    }
  }
  
  // If all endpoints are blacklisted, clear the blacklist and start over
  console.log(`[tokenCreatorUtils] All endpoints blacklisted, clearing blacklist`);
  clearRpcBlacklist(network);
  
  // Return the next endpoint after current
  const index = (currentIndex + 1) % endpoints.length;
  const endpoint = endpoints[index];
  
  return { endpoint, index };
};

export const createReliableConnection = (
  network: 'devnet' | 'mainnet-beta',
  currentRpcIndex: number,
  rpcIndexOverride?: number
): Connection => {
  const { endpoint, index } = getAvailableEndpoint(network, 
    rpcIndexOverride !== undefined ? rpcIndexOverride : currentRpcIndex);
  
  console.log(`[tokenCreatorUtils] Creating connection to: ${endpoint}`);
  
  try {
    // Enhanced connection configuration with better timeout and retry settings
    return new Connection(endpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: CONNECTION_TIMEOUT,
      disableRetryOnRateLimit: false, // Let the RPC handle some retries
      httpHeaders: {
        // Add user agent to help identify our app on the RPC
        'User-Agent': 'SolanaTokenCreator/1.0',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error(`[tokenCreatorUtils] Error creating connection to ${endpoint}:`, error);
    
    // Fallback to a basic connection as last resort
    const fallbackEndpoint = network === 'devnet' ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com';
    console.log(`[tokenCreatorUtils] Using fallback connection: ${fallbackEndpoint}`);
    return new Connection(fallbackEndpoint);
  }
};

export const handleRpcError = (
  error: any, 
  network: 'devnet' | 'mainnet-beta', 
  endpoint: string
): boolean => {
  // Check for rate limiting errors (429)
  const errorMessage = error?.message || '';
  const is429Error = errorMessage.includes('429') || 
                     errorMessage.includes('Too many requests') || 
                     errorMessage.includes('rate limit');
                     
  if (is429Error) {
    console.log(`[tokenCreatorUtils] Rate limit detected on ${endpoint}, blacklisting temporarily`);
    rpcEndpointBlacklist[network].add(endpoint);
    scheduleEndpointRecovery(network, endpoint, 60000); // 1 minute cooldown for rate limited endpoints
    return true; // Indicates this was a rate limiting error
  }
  
  // Other connection errors that should trigger endpoint switching
  const isConnectionError = errorMessage.includes('failed to fetch') || 
                            errorMessage.includes('timeout') ||
                            errorMessage.includes('ECONNREFUSED') ||
                            errorMessage.includes('ETIMEDOUT') ||
                            errorMessage.includes('Failed to fetch') ||
                            errorMessage.includes('NetworkError');
                         
  if (isConnectionError) {
    console.log(`[tokenCreatorUtils] Connection error on ${endpoint}, blacklisting temporarily`);
    rpcEndpointBlacklist[network].add(endpoint);
    scheduleEndpointRecovery(network, endpoint, 30000); // 30 second cooldown for connection errors
    return true;
  }
  
  return false; // Not an RPC-related error
};

export const calculateSecurityLevel = (
  revokeMintAuthority: boolean,
  revokeFreezeAuthority: boolean,
  immutableMetadata: boolean
): 'low' | 'medium' | 'high' => {
  const securityScore = [
    revokeMintAuthority,
    revokeFreezeAuthority,
    immutableMetadata
  ].filter(Boolean).length;
  
  if (securityScore === 3) {
    return 'high';
  } else if (securityScore >= 1) {
    return 'medium';
  } else {
    return 'low';
  }
};

// Balance cache to avoid excessive RPC calls
interface BalanceCacheEntry {
  balance: number;
  timestamp: number;
  network: string;
}

export const balanceCache = new Map<string, BalanceCacheEntry>();

export const getCachedBalance = (address: string, network: string, maxAgeMs: number = 10000): number | null => {
  const cacheKey = `${address}-${network}`;
  const cachedData = balanceCache.get(cacheKey);
  
  if (cachedData && (Date.now() - cachedData.timestamp) < maxAgeMs) {
    console.log(`[tokenCreatorUtils] Using cached balance: ${cachedData.balance / LAMPORTS_PER_SOL} SOL, age: ${(Date.now() - cachedData.timestamp) / 1000}s`);
    return cachedData.balance / LAMPORTS_PER_SOL;
  }
  
  return null;
};

export const setCachedBalance = (address: string, network: string, balance: number): void => {
  const cacheKey = `${address}-${network}`;
  
  // If it's a raw lamports value, convert to SOL first
  const balanceToStore = balance > 1000000 ? balance : balance * LAMPORTS_PER_SOL;
  
  balanceCache.set(cacheKey, {
    balance: balanceToStore,
    timestamp: Date.now(),
    network
  });
  
  console.log(`[tokenCreatorUtils] Cached balance: ${balanceToStore / LAMPORTS_PER_SOL} SOL for ${address} on ${network}`);
};
