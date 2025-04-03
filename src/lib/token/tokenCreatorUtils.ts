
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { toast } from '@/hooks/use-toast';
import { FeeBreakdown } from '@/lib/solana/tokenService';
import { TokenForm } from '@/types/token';

// Constants moved from TokenCreator.tsx
export const PLATFORM_FEE = 0.05;
export const FEE_RECIPIENT = "FMZJ2zuacqYiyE8E9ysQxALBkcTvCohUH";
export const BALANCE_BUFFER = 0.001;
export const BALANCE_REFRESH_INTERVAL = 5000; // 5 seconds
export const CONNECTION_RETRY_DELAY = 1000; // 1 second initial retry delay
export const MAX_RETRY_DELAY = 8000; // Max retry delay of 8 seconds
export const CONNECTION_TIMEOUT = 30000; // Increased timeout for connections to 30 seconds

export const RPC_ENDPOINTS = {
  'devnet': [
    'https://api.devnet.solana.com',
    'https://solana-devnet-rpc.allthatnode.com',
    'https://devnet.helius-rpc.com/?api-key=15319106-5848-42fd-83c2-b9bdfe17f12c',
    'https://rpc-devnet.helius.xyz/?api-key=15319106-5848-42fd-83c2-b9bdfe17f12c',
    'https://mango.devnet.rpcpool.com',
    'https://devnet.genesysgo.net',
    'https://api.devnet.rpcpool.com',
    'https://solana-devnet.g.alchemy.com/v2/demo'
  ],
  'mainnet-beta': [
    'https://api.mainnet-beta.solana.com',
    'https://solana-mainnet.g.alchemy.com/v2/demo',
    'https://rpc.ankr.com/solana',
    'https://mainnet.helius-rpc.com/?api-key=15319106-5848-42fd-83c2-b9bdfe17f12c',
    'https://rpc-mainnet.helius.xyz/?api-key=15319106-5848-42fd-83c2-b9bdfe17f12c',
    'https://solana-api.projectserum.com',
    'https://solana.public-rpc.com',
    'https://api.mainnet.rpcpool.com'
  ]
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

export const createReliableConnection = (
  network: 'devnet' | 'mainnet-beta',
  currentRpcIndex: number,
  rpcIndexOverride?: number
): Connection => {
  const rpcIndex = rpcIndexOverride !== undefined ? rpcIndexOverride : currentRpcIndex;
  const endpoints = RPC_ENDPOINTS[network];
  const endpoint = endpoints[rpcIndex % endpoints.length];
  
  console.log(`Creating connection to: ${endpoint}`);
  
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: CONNECTION_TIMEOUT,
    disableRetryOnRateLimit: false
  });
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
