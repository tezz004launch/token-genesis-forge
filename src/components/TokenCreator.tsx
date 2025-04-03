import React, { useState, useCallback, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import StepIndicator from './StepIndicator';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { createSPLToken, calculateTokenCreationFees, FeeBreakdown } from '@/lib/solana/tokenService';
import { TokenForm } from '@/types/token';
import ImageUpload from './ImageUpload';
import { 
  Coins, 
  CreditCard, 
  Info, 
  Loader2, 
  Check, 
  Shield, 
  AlertTriangle,
  Globe,
  Twitter,
  MessageSquare,
  RefreshCw,
  WifiOff,
  Zap
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from '@/components/ui/progress';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useSession } from '@/contexts/SessionContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import AuthWallet from './AuthWallet';
import TokenSummary from './TokenSummary';
import { Switch } from '@/components/ui/switch';

const PLATFORM_FEE = 0.05;
const FEE_RECIPIENT = "FMZJ2zuacqYiyE8E9ysQxALBkcTvCohUCTpLGrCSCnUH";
const BALANCE_BUFFER = 0.001;
const BALANCE_REFRESH_INTERVAL = 5000; // 5 seconds
const CONNECTION_RETRY_DELAY = 1000; // 1 second initial retry delay
const MAX_RETRY_DELAY = 8000; // Max retry delay of 8 seconds
const CONNECTION_TIMEOUT = 10000; // 10 seconds timeout for connections

const STEPS = [
  'Connect Wallet',
  'Authenticate',
  'Basic Information',
  'Token Parameters',
  'Socials',
  'Permissions',
  'Image Upload',
  'Network',
  'Review',
  'Payment',
  'Confirmation'
];

// Expanded list of RPC endpoints with more reliable options
const RPC_ENDPOINTS = {
  'devnet': [
    'https://api.devnet.solana.com',
    'https://solana-devnet-rpc.allthatnode.com',
    'https://devnet.helius-rpc.com/?api-key=15319106-5848-42fd-83c2-b9bdfe17f12c',
    'https://mango.devnet.rpcpool.com',
    'https://devnet.genesysgo.net'
  ],
  'mainnet-beta': [
    'https://api.mainnet-beta.solana.com',
    'https://solana-mainnet.g.alchemy.com/v2/demo',
    'https://rpc.ankr.com/solana',
    'https://mainnet.helius-rpc.com/?api-key=15319106-5848-42fd-83c2-b9bdfe17f12c',
    'https://solana-api.projectserum.com'
  ]
};

const TokenCreator: React.FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  const { isAuthenticated } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [creationTxHash, setCreationTxHash] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'devnet' | 'mainnet-beta'>('devnet');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null);
  const [balanceRefreshAttempts, setBalanceRefreshAttempts] = useState(0);
  const [lastBalanceUpdateTime, setLastBalanceUpdateTime] = useState<number | null>(null);
  const [retryDelay, setRetryDelay] = useState(CONNECTION_RETRY_DELAY);
  const [connectionState, setConnectionState] = useState<'connected' | 'unstable' | 'failed'>('connected');
  const [showExactValues, setShowExactValues] = useState(false);
  const [currentRpcIndex, setCurrentRpcIndex] = useState(0);

  const [form, setForm] = useState<TokenForm>({
    name: '',
    symbol: '',
    decimals: 9,
    description: '',
    supply: 1000000000,
    image: null,
    revokeMintAuthority: false,
    revokeFreezeAuthority: true,
    immutableMetadata: false,
    website: '',
    twitter: '',
    telegram: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    symbol: '',
    supply: ''
  });
  
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [readyToCreate, setReadyToCreate] = useState(false);

  useEffect(() => {
    if (publicKey && !isAuthenticated) {
      setCurrentStep(1);
    } else if (publicKey && isAuthenticated && currentStep < 2) {
      setCurrentStep(2);
    }
  }, [publicKey, isAuthenticated, currentStep]);

  useEffect(() => {
    const loadFees = async () => {
      if (connection) {
        try {
          // Use our improved connection creation function
          const selectedConnection = createReliableConnection(selectedNetwork);
          const fees = await calculateTokenCreationFees(selectedConnection);
          setFeeBreakdown(fees);
        } catch (error) {
          console.error("Error calculating fees:", error);
          toast({
            title: "Fee Calculation Error",
            description: "Could not calculate transaction fees. Using estimated values.",
            variant: "destructive"
          });
        }
      }
    };
    
    loadFees();
  }, [connection, selectedNetwork, toast]);

  // Function to create a connection with improved reliability
  const createReliableConnection = useCallback((network: 'devnet' | 'mainnet-beta', rpcIndexOverride?: number): Connection => {
    // Use provided index or current index
    const rpcIndex = rpcIndexOverride !== undefined ? rpcIndexOverride : currentRpcIndex;
    const endpoints = RPC_ENDPOINTS[network];
    const endpoint = endpoints[rpcIndex % endpoints.length];
    
    // Create connection with commitment and timeouts
    return new Connection(endpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: CONNECTION_TIMEOUT,
      disableRetryOnRateLimit: false
    });
  }, [currentRpcIndex]);

  // Function to cycle through RPC endpoints
  const switchRpcEndpoint = useCallback(() => {
    // Set next RPC index
    setCurrentRpcIndex(prev => (prev + 1) % RPC_ENDPOINTS[selectedNetwork].length);
    // Reset connection state
    setConnectionState('connected');
    // Reset retry delay
    setRetryDelay(CONNECTION_RETRY_DELAY);
    
    toast({
      title: "Switching RPC Endpoint",
      description: "Trying a different Solana network connection...",
    });
    
    // Force a balance refresh with the new endpoint
    setTimeout(() => refreshWalletBalance(true), 500);
  }, [selectedNetwork, toast]);

  const refreshWalletBalance = useCallback(async (force: boolean = false) => {
    if (!publicKey) return;
    
    // If not forced, check if we've refreshed recently (within last 3 seconds)
    if (!force && lastBalanceUpdateTime && Date.now() - lastBalanceUpdateTime < 3000) {
      return;
    }

    try {
      setIsLoadingBalance(true);
      
      // Use current RPC index to create connection
      const reliableConnection = createReliableConnection(selectedNetwork);
      
      let success = false;
      let balance = 0;
      let attemptCount = 0;
      const maxAttempts = 2; // Maximum attempts per RPC endpoint
      
      while (attemptCount < maxAttempts && !success) {
        try {
          // Set timeout for the balance fetch operation
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Balance fetch timeout")), CONNECTION_TIMEOUT);
          });
          
          // Attempt to fetch balance with timeout
          balance = await Promise.race([
            reliableConnection.getBalance(publicKey),
            timeoutPromise
          ]) as number;
          
          success = true;
          setConnectionState('connected');
          
        } catch (error) {
          attemptCount++;
          console.warn(`Balance fetch attempt ${attemptCount} failed: ${error}`);
          
          if (attemptCount < maxAttempts) {
            // Small delay before retry with same endpoint
            await new Promise(r => setTimeout(r, 500));
          }
        }
      }
      
      // If all attempts with current endpoint failed, increment failure counter
      if (!success) {
        setBalanceRefreshAttempts(prev => prev + 1);
        
        // After consecutive failures, start showing connection warning
        if (balanceRefreshAttempts >= 1) {
          setConnectionState('unstable');
        }
        
        // After more consecutive failures, mark connection as failed
        if (balanceRefreshAttempts >= 3) {
          setConnectionState('failed');
          
          toast({
            title: "Network Connection Issues",
            description: "We're having trouble connecting to the Solana network. Try switching to a different RPC endpoint.",
            variant: "destructive",
          });
        }
        
        // Use exponential backoff for retries, but cap at MAX_RETRY_DELAY
        const newRetryDelay = Math.min(retryDelay * 1.5, MAX_RETRY_DELAY);
        setRetryDelay(newRetryDelay);
      } else {
        // On success, reset counters and update balance
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
      toast, createReliableConnection, retryDelay]);

  // Effect for initial balance fetch and periodic refreshes
  useEffect(() => {
    if (publicKey) {
      refreshWalletBalance(true);
      
      const intervalId = setInterval(() => {
        // Only auto-refresh if connection isn't marked as failed
        if (connectionState !== 'failed') {
          refreshWalletBalance();
        }
      }, BALANCE_REFRESH_INTERVAL);
      
      return () => clearInterval(intervalId);
    }
  }, [publicKey, refreshWalletBalance, selectedNetwork, connectionState]);

  // Extra effect to refresh balance when network is changed
  useEffect(() => {
    if (publicKey) {
      // Reset RPC index when network changes
      setCurrentRpcIndex(0);
      // Reset connection state
      setConnectionState('connected');
      // Force balance refresh
      refreshWalletBalance(true);
    }
  }, [selectedNetwork, publicKey, refreshWalletBalance]);

  useEffect(() => {
    const securityScore = [
      form.revokeMintAuthority,
      form.revokeFreezeAuthority,
      form.immutableMetadata
    ].filter(Boolean).length;
    
    if (securityScore === 3) {
      setSecurityLevel('high');
    } else if (securityScore >= 1) {
      setSecurityLevel('medium');
    } else {
      setSecurityLevel('low');
    }
  }, [form.revokeMintAuthority, form.revokeFreezeAuthority, form.immutableMetadata]);

  useEffect(() => {
    if (isCreating && progress < 95) {
      const timer = setTimeout(() => {
        setProgress((prev) => Math.min(prev + 10, 95));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isCreating, progress]);

  const validateForm = useCallback(() => {
    const newErrors = {
      name: '',
      symbol: '',
      supply: ''
    };
    
    if (!form.name.trim()) {
      newErrors.name = 'Token name is required';
    }
    
    if (!form.symbol.trim()) {
      newErrors.symbol = 'Token symbol is required';
    } else if (form.symbol.length > 8) {
      newErrors.symbol = 'Symbol must be 8 characters or less';
    }
    
    if (form.supply <= 0) {
      newErrors.supply = 'Supply must be greater than 0';
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  }, [form]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'supply' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (checked: boolean, name: string) => {
    setForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleImageUpload = (file: File | null) => {
    setForm(prev => ({
      ...prev,
      image: file
    }));
  };

  const nextStep = () => {
    if (currentStep === 2) {
      if (!validateForm()) {
        toast({
          title: "Validation Error",
          description: "Please fix the errors in the form before proceeding.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 9) {
      setReadyToCreate(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const resetCreator = () => {
    setForm({
      name: '',
      symbol: '',
      decimals: 9,
      description: '',
      supply: 1000000000,
      image: null,
      revokeMintAuthority: false,
      revokeFreezeAuthority: true,
      immutableMetadata: false,
      website: '',
      twitter: '',
      telegram: ''
    });
    setErrors({
      name: '',
      symbol: '',
      supply: ''
    });
    setProgress(0);
    setIsCreating(false);
    setCreationTxHash(null);
    setTokenAddress(null);
    setCurrentStep(2);
  };

  const hasSufficientBalance = useCallback(() => {
    if (walletBalance === null || feeBreakdown === null) return false;
    
    const requiredBalance = feeBreakdown.total / LAMPORTS_PER_SOL + BALANCE_BUFFER;
    const hasEnough = walletBalance >= requiredBalance;
    
    console.log(`Balance check: ${walletBalance} SOL available, ${requiredBalance} SOL required (including ${BALANCE_BUFFER} SOL buffer)`);
    
    return hasEnough;
  }, [walletBalance, feeBreakdown]);

  const handleCreateToken = async () => {
    if (!publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate your wallet before creating a token",
        variant: "destructive"
      });
      return;
    }

    // Force refresh of wallet balance before proceeding
    await refreshWalletBalance(true);

    if (!hasSufficientBalance()) {
      const totalRequired = feeBreakdown ? (feeBreakdown.total / LAMPORTS_PER_SOL).toFixed(4) : PLATFORM_FEE;
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${totalRequired} SOL in your wallet. Current balance: ${walletBalance?.toFixed(4) || '0.0000'} SOL`,
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    setProgress(10);
    
    try {
      toast({
        title: "Creating your token",
        description: "Please approve the transaction in your wallet",
      });
      
      // Use our improved connection creation function
      const selectedConnection = createReliableConnection(selectedNetwork);
      
      const result = await createSPLToken({
        form,
        wallet: { 
          publicKey, 
          sendTransaction: async (transaction, conn) => {
            return await sendTransaction(transaction, conn);
          }
        },
        feePayer: FEE_RECIPIENT,
        connection: selectedConnection,
        cluster: selectedNetwork
      });
      
      setCreationTxHash(result.txId);
      setTokenAddress(result.tokenAddress);
      setProgress(100);
      
      // Refresh balance after successful creation
      setTimeout(() => refreshWalletBalance(true), 2000);
      
      toast({
        title: "Token Created Successfully!",
        description: "Your meme coin has been created and sent to your wallet.",
      });
      
      setCurrentStep(STEPS.length - 1);
    } catch (error) {
      console.error('Token creation error:', error);
      toast({
        title: "Token Creation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      setProgress(0);
      setIsCreating(false);
      setReadyToCreate(false);
      
      // Refresh balance after failed creation attempt
      setTimeout(() => refreshWalletBalance(true), 2000);
    }
  };

  useEffect(() => {
    if (readyToCreate && !isCreating) {
      handleCreateToken();
      setReadyToCreate(false);
    }
  }, [readyToCreate]);

  const renderAuthStep = () => {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-solana mx-auto" />
          <h3 className="text-xl font-medium">Authenticate Your Wallet</h3>
          <p className="text-crypto-light max-w-lg mx-auto">
            For your security, we need to authenticate your wallet ownership.
            This requires signing a message (not a transaction) with your wallet.
          </p>
        </div>
        
        <div className="max-w-md mx-auto bg-crypto-gray/30 p-6 rounded-lg space-y-4">
          <p className="text-sm text-crypto-light">
            This signature:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-crypto-green" />
              <span>Verifies you control this wallet</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-crypto-green" />
              <span>Creates a secure session for token creation</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-crypto-green" />
              <span>Does NOT cost any gas fees</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-crypto-green" />
              <span>Does NOT approve any transactions</span>
            </li>
          </ul>
          
          <div className="pt-4 flex justify-center">
            <AuthWallet />
          </div>
        </div>
      </div>
    );
  };

  const renderConnectionStatus = () => {
    if (connectionState === 'connected') {
      return null;
    }
    
    if (connectionState === 'unstable') {
      return (
        <Alert className="bg-amber-900/20 border-amber-500/30 mb-4">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertTitle>Unstable Connection</AlertTitle>
          <AlertDescription>
            Your connection to the Solana network is unstable. This may cause balance refresh issues.
            <Button 
              variant="outline" 
              size="sm" 
              onClick={switchRpcEndpoint}
              className="mt-2 text-xs border-amber-500/30 hover:bg-amber-500/10"
            >
              <Zap className="h-3 w-3 mr-1" />
              Try Different RPC
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert className="bg-red-900/20 border-red-500/30 mb-4">
        <WifiOff className="h-4 w-4 text-red-400" />
        <AlertTitle>Connection Failed</AlertTitle>
        <AlertDescription>
          We're having trouble connecting to the Solana network. Please try a different RPC endpoint.
          <Button 
            variant="outline" 
            size="sm" 
            onClick={switchRpcEndpoint}
            className="mt-2 text-xs border-red-500/30 hover:bg-red-500/10"
          >
            <Zap className="h-3 w-3 mr-1" />
            Try Different RPC ({currentRpcIndex + 1}/{RPC_ENDPOINTS[selectedNetwork].length})
          </Button>
        </AlertDescription>
      </Alert>
    );
  };

  const renderPaymentStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Payment</h3>
          <p className="text-sm text-muted-foreground">
            Review payment details before creating your meme coin
          </p>
        </div>
        
        {renderConnectionStatus()}
        
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
                onClick={() => refreshWalletBalance(true)}
                className="h-5 w-5 transition-all hover:bg-gray-700/50"
                disabled={isLoadingBalance}
              >
                <RefreshCw className={`h-3 w-3 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh balance</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${
                hasSufficientBalance() ? 'text-green-400' : 'text-red-500'
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
          
          {/* Add toggle for displaying exact values */}
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
          
          {/* RPC Status */}
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
        
        <div className="bg-crypto-gray/30 p-4 rounded-md flex items-start space-x-3">
          <CreditCard className="text-solana h-5 w-5 mt-0.5" />
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
            className="w-full
