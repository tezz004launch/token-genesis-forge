
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TokenForm } from '@/types/token';
import { toast } from '@/hooks/use-toast';
import { createSPLToken, FeeBreakdown, calculateTokenCreationFees } from '@/lib/solana/tokenService';
import { createReliableConnection, FEE_RECIPIENT, validateTokenForm } from '@/lib/token/tokenCreatorUtils';
import { useSession } from '@/contexts/SessionContext';
import { useStepConfig } from '@/contexts/StepConfigContext';

export const useTokenCreator = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { isAuthenticated } = useSession();
  const { currentStep, setCurrentStep, visibleSteps } = useStepConfig();

  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [creationTxHash, setCreationTxHash] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'devnet' | 'mainnet-beta'>('devnet');
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null);
  const [currentRpcIndex, setCurrentRpcIndex] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showAuthStep, setShowAuthStep] = useState(true);
  const [readyToCreate, setReadyToCreate] = useState(false);

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

  useEffect(() => {
    setConnectionError(null);
    
    if (publicKey && !isAuthenticated && currentStep > 1) {
      setCurrentStep(1);
      setShowAuthStep(true);
    } else if (publicKey && isAuthenticated && currentStep < 2) {
      setCurrentStep(2);
      setShowAuthStep(false);
    }
  }, [publicKey, isAuthenticated, currentStep, setCurrentStep]);

  useEffect(() => {
    const loadFees = async () => {
      if (connection) {
        try {
          let attempt = 0;
          const maxAttempts = 3;
          let fees = null;
          
          while (attempt < maxAttempts && !fees) {
            try {
              const selectedConnection = createReliableConnection(
                selectedNetwork, 
                currentRpcIndex, 
                attempt % createReliableConnection(selectedNetwork, currentRpcIndex).rpcEndpoint.length
              );
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
  }, [connection, selectedNetwork, currentRpcIndex]);

  useEffect(() => {
    if (isCreating && progress < 95) {
      const timer = setTimeout(() => {
        setProgress(prev => Math.min(prev + 10, 95));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isCreating, progress]);

  const switchRpcEndpoint = useCallback(() => {
    setCurrentRpcIndex(prev => prev + 1);
    
    toast({
      title: "Switching RPC Endpoint",
      description: "Trying a different Solana network connection...",
    });
  }, []);

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

  const validateForm = () => {
    const validation = validateTokenForm(form);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleCreateToken = async (hasSufficientBalance: boolean) => {
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

    if (!validateForm()) {
      return;
    }

    if (!hasSufficientBalance) {
      const totalRequired = feeBreakdown ? (feeBreakdown.total / 1000000000).toFixed(4) : "0.0500";
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${totalRequired} SOL in your wallet.`,
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
      const maxAttempts = 8; // Number of available RPC endpoints
      
      while (!result && attemptCount < maxAttempts) {
        try {
          const selectedConnection = createReliableConnection(
            selectedNetwork, 
            currentRpcIndex, 
            (currentRpcIndex + attemptCount) % 8
          );
          
          console.log(`Attempting token creation with RPC endpoint #${(currentRpcIndex + attemptCount) % 8}`);
          
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
        
        toast({
          title: "Token Created Successfully!",
          description: "Your meme coin has been created and sent to your wallet.",
        });
        
        setCurrentStep(visibleSteps.length);
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

  return {
    form,
    setForm,
    errors,
    setErrors,
    isCreating,
    setIsCreating,
    progress,
    setProgress,
    creationTxHash,
    setCreationTxHash,
    tokenAddress,
    setTokenAddress,
    selectedNetwork,
    setSelectedNetwork,
    feeBreakdown,
    currentRpcIndex,
    setCurrentRpcIndex,
    connectionError,
    showAuthStep,
    setShowAuthStep,
    readyToCreate,
    setReadyToCreate,
    handleInputChange,
    handleCheckboxChange,
    handleImageUpload,
    validateForm,
    handleCreateToken,
    resetCreator,
    switchRpcEndpoint
  };
};
