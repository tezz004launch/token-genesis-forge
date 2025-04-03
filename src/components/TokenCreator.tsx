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
  Zap,
  FileEdit
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
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';

const PLATFORM_FEE = 0.05;
const FEE_RECIPIENT = "FMZJ2zuacqYiyE8E9ysQxALBkcTvCohUCTpLGrCSCnUH";
const BALANCE_BUFFER = 0.001;
const BALANCE_REFRESH_INTERVAL = 5000; // 5 seconds
const CONNECTION_RETRY_DELAY = 1000; // 1 second initial retry delay
const MAX_RETRY_DELAY = 8000; // Max retry delay of 8 seconds
const CONNECTION_TIMEOUT = 30000; // Increased timeout for connections to 30 seconds

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

const RPC_ENDPOINTS = {
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
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showAuthStep, setShowAuthStep] = useState(true);

  const [form, setForm] = useState<TokenForm>({
    name: 'Demo Meme Coin',
    symbol: 'DEMO',
    decimals: 9,
    description: 'A demonstration meme coin created with the Solana token creator',
    supply: 1000000000,
    image: null,
    revokeMintAuthority: false,
    revokeFreezeAuthority: true,
    immutableMetadata: false,
    website: 'https://example.com',
    twitter: '@example',
    telegram: 'example'
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
    setConnectionError(null);
    
    if (publicKey && !isAuthenticated && currentStep > 1) {
      setCurrentStep(1);
      setShowAuthStep(true);
    } else if (publicKey && isAuthenticated && currentStep < 2) {
      setCurrentStep(2);
      setShowAuthStep(false);
    }
  }, [publicKey, isAuthenticated, currentStep]);

  useEffect(() => {
    const loadFees = async () => {
      if (connection) {
        try {
          let attempt = 0;
          const maxAttempts = 3;
          let fees = null;
          
          while (attempt < maxAttempts && !fees) {
            try {
              const selectedConnection = createReliableConnection(selectedNetwork, attempt % RPC_ENDPOINTS[selectedNetwork].length);
              fees = await calculateTokenCreationFees(selectedConnection);
              if (fees) {
                setFeeBreakdown(fees);
                console.log("Fee calculation successful:", fees);
                return;
              }
            } catch (error) {
              console.warn(`Fee calculation attempt ${attempt + 1} failed:`, error);
              attempt++;
              if (attempt < maxAttempts) {
                await new Promise(r => setTimeout(r, 1000));
              }
            }
          }
          
          if (!fees) {
            throw new Error("Failed to calculate fees after multiple attempts");
          }
        } catch (error) {
          console.error("All fee calculation attempts failed:", error);
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

  const createReliableConnection = useCallback((network: 'devnet' | 'mainnet-beta', rpcIndexOverride?: number): Connection => {
    const rpcIndex = rpcIndexOverride !== undefined ? rpcIndexOverride : currentRpcIndex;
    const endpoints = RPC_ENDPOINTS[network];
    const endpoint = endpoints[rpcIndex % endpoints.length];
    
    console.log(`Creating connection to: ${endpoint}`);
    
    return new Connection(endpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: CONNECTION_TIMEOUT,
      disableRetryOnRateLimit: false
    });
  }, [currentRpcIndex]);

  const switchRpcEndpoint = useCallback(() => {
    setCurrentRpcIndex(prev => (prev + 1) % RPC_ENDPOINTS[selectedNetwork].length);
    setConnectionState('connected');
    setRetryDelay(CONNECTION_RETRY_DELAY);
    
    toast({
      title: "Switching RPC Endpoint",
      description: "Trying a different Solana network connection...",
    });
    
    setTimeout(() => refreshWalletBalance(true), 500);
  }, [selectedNetwork, toast]);

  const refreshWalletBalance = useCallback(async (force: boolean = false) => {
    if (!publicKey) return;
    
    if (!force && lastBalanceUpdateTime && Date.now() - lastBalanceUpdateTime < 3000) {
      return;
    }

    try {
      setIsLoadingBalance(true);
      
      const reliableConnection = createReliableConnection(selectedNetwork);
      
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
      toast, createReliableConnection, retryDelay]);

  useEffect(() => {
    if (publicKey) {
      refreshWalletBalance(true);
      
      const intervalId = setInterval(() => {
        if (connectionState !== 'failed') {
          refreshWalletBalance();
        }
      }, BALANCE_REFRESH_INTERVAL);
      
      return () => clearInterval(intervalId);
    }
  }, [publicKey, refreshWalletBalance, selectedNetwork, connectionState]);

  useEffect(() => {
    if (publicKey) {
      setCurrentRpcIndex(0);
      setConnectionState('connected');
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
    
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      console.log("Form validation failed:", newErrors);
      
      const errorMessages = [];
      if (newErrors.name) errorMessages.push(`Name: ${newErrors.name}`);
      if (newErrors.symbol) errorMessages.push(`Symbol: ${newErrors.symbol}`);
      if (newErrors.supply) errorMessages.push(`Supply: ${newErrors.supply}`);
      
      toast({
        title: "Form Validation Failed",
        description: errorMessages.join(', '),
        variant: "destructive"
      });
    }
    
    return !hasErrors;
  }, [form, toast]);

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
        return;
      }
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      
      if (connectionState === 'failed' || connectionState === 'unstable') {
        switchRpcEndpoint();
      }
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
      name: 'Demo Meme Coin',
      symbol: 'DEMO',
      decimals: 9,
      description: 'A demonstration meme coin created with the Solana token creator',
      supply: 1000000000,
      image: null,
      revokeMintAuthority: false,
      revokeFreezeAuthority: true,
      immutableMetadata: false,
      website: 'https://example.com',
      twitter: '@example',
      telegram: 'example'
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
    
    if (!hasEnough && walletBalance > 0) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${requiredBalance.toFixed(4)} SOL in your wallet. Current balance: ${walletBalance.toFixed(4)} SOL`,
        variant: "destructive"
      });
    }
    
    return hasEnough;
  }, [walletBalance, feeBreakdown, toast]);

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

    await refreshWalletBalance(true);

    if (!validateForm()) {
      return;
    }

    if (!hasSufficientBalance()) {
      const totalRequired = feeBreakdown ? (feeBreakdown.total / LAMPORTS_PER_SOL).toFixed(4) : PLATFORM_FEE.toFixed(4);
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
      
      let result = null;
      let attemptCount = 0;
      const maxAttempts = RPC_ENDPOINTS[selectedNetwork].length;
      
      while (!result && attemptCount < maxAttempts) {
        try {
          const selectedConnection = createReliableConnection(
            selectedNetwork, 
            (currentRpcIndex + attemptCount) % RPC_ENDPOINTS[selectedNetwork].length
          );
          
          console.log(`Attempting token creation with RPC endpoint #${(currentRpcIndex + attemptCount) % RPC_ENDPOINTS[selectedNetwork].length}`);
          
          result = await createSPLToken({
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
        } catch (error) {
          console.warn(`Token creation attempt ${attemptCount + 1} failed:`, error);
          attemptCount++;
          
          if (attemptCount < maxAttempts) {
            toast({
              title: "Retrying with different endpoint",
              description: `Attempt ${attemptCount + 1} of ${maxAttempts}...`,
            });
            await new Promise(r => setTimeout(r, 1000));
          } else {
            throw error;
          }
        }
      }
      
      if (result) {
        setCreationTxHash(result.txId);
        setTokenAddress(result.tokenAddress);
        setProgress(100);
        
        setTimeout(() => refreshWalletBalance(true), 2000);
        
        toast({
          title: "Token Created Successfully!",
          description: "Your meme coin has been created and sent to your wallet.",
        });
        
        setCurrentStep(STEPS.length - 1);
      }
    } catch (error) {
      console.error('All token creation attempts failed:', error);
      toast({
        title: "Token Creation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      setProgress(0);
      setIsCreating(false);
      setReadyToCreate(false);
      
      setTimeout(() => refreshWalletBalance(true), 2000);
    }
  };

  useEffect(() => {
    if (readyToCreate && !isCreating) {
      handleCreateToken();
      setReadyToCreate(false);
    }
  }, [readyToCreate]);

  const renderBasicInfoFields = () => {
    return (
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Token Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="My Awesome Token"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="symbol" className="text-sm font-medium">
            Token Symbol <span className="text-red-500">*</span>
          </Label>
          <Input
            id="symbol"
            name="symbol"
            value={form.symbol}
            onChange={handleInputChange}
            placeholder="TOKEN"
            className={errors.symbol ? "border-red-500" : ""}
          />
          {errors.symbol && <p className="text-xs text-red-500">{errors.symbol}</p>}
          <p className="text-xs text-muted-foreground">
            Symbol must be 8 characters or less (e.g. BTC, SHIB, DOGE)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            placeholder="Describe your token"
            rows={3}
          />
        </div>
      </div>
    );
  };

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
        
        {connectionError && (
          <Alert className="max-w-md mx-auto bg-red-900/20 border-red-500/30 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              {connectionError}
            </AlertDescription>
          </Alert>
        )}
        
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
            className="w-full bg-solana hover:bg-solana-dark"
            onClick={nextStep}
            disabled={!hasSufficientBalance()}
          >
            {!hasSufficientBalance() ? (
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderAuthStep();
      case 2:
        return renderBasicInfoFields();
      case 9:
        return renderPaymentStep();
      default:
        return (
          <div className="py-4 text-center">
            <FileEdit className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Step {currentStep}: {STEPS[currentStep]}</h3>
            <p className="text-muted-foreground">
              This step is included as a placeholder. In a real implementation,
              you would collect more token details here.
            </p>
            {currentStep === 3 && (
              <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/20 rounded-md text-left">
                <p className="text-sm">
                  Normally on this step, you would configure token parameters like:
                </p>
                <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                  <li>Total supply: {form.supply.toLocaleString()}</li>
                  <li>Decimals: {form.decimals}</li>
                </ul>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div>
      {(currentStep === 1 || showAuthStep) && renderAuthStep()}
      {currentStep > 1 && !showAuthStep && (
        <Card className="border border-gray-800 bg-crypto-gray/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Create Your Meme Coin</CardTitle>
          </CardHeader>
          <CardContent>
            <StepIndicator 
              currentStep={currentStep - 1} 
              totalSteps={STEPS.length - 1} 
            />
            
            {isCreating ? (
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
                    name={form.name}
                    symbol={form.symbol}
                    decimals={form.decimals}
                    totalSupply={form.supply}
                    txId={creationTxHash}
                    mintAddress={tokenAddress}
                    cluster={selectedNetwork}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-6 py-4">
                {renderStepContent()}
              </div>
            )}
          </CardContent>
          {!isCreating && currentStep > 1 && currentStep < STEPS.length && (
            <CardFooter className="justify-between border-t border-gray-800 p-4">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              {currentStep < 10 && (
                <Button onClick={nextStep}>
                  Next
                </Button>
              )}
            </CardFooter>
          )}
          {currentStep === STEPS.length && (
            <CardFooter className="justify-center border-t border-gray-800 p-4">
              <Button onClick={resetCreator}>
                Create Another Token
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
};

export default TokenCreator;
