
import { useState, useCallback, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useToast } from '@/components/ui/use-toast';
import { TokenForm } from '@/types/token';
import { createSPLToken } from '@/lib/solana/tokenService';
import { PLATFORM_FEE, FEE_RECIPIENT } from '@/constants/tokenCreation';
import { useSession } from '@/contexts/SessionContext';

export const useTokenCreation = () => {
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
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [readyToCreate, setReadyToCreate] = useState(false);
  
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

  useEffect(() => {
    if (publicKey && !isAuthenticated) {
      setCurrentStep(1);
    } else if (publicKey && isAuthenticated && currentStep < 2) {
      setCurrentStep(2);
    }
  }, [publicKey, isAuthenticated, currentStep]);

  useEffect(() => {
    const checkBalance = async () => {
      if (publicKey && connection) {
        try {
          const balance = await connection.getBalance(publicKey);
          setWalletBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };
    
    checkBalance();
    
    const intervalId = setInterval(checkBalance, 10000); // every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [publicKey, connection]);

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

  useEffect(() => {
    if (readyToCreate && !isCreating) {
      handleCreateToken();
      setReadyToCreate(false);
    }
  }, [readyToCreate]);

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

    if (walletBalance !== null && walletBalance < PLATFORM_FEE / LAMPORTS_PER_SOL) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${PLATFORM_FEE / LAMPORTS_PER_SOL} SOL in your wallet. Current balance: ${walletBalance.toFixed(4)} SOL`,
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
      
      const selectedConnection = new Connection(
        selectedNetwork === 'mainnet-beta' 
          ? 'https://api.mainnet-beta.solana.com' 
          : 'https://api.devnet.solana.com',
        'confirmed'
      );
      
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
    }
  };

  return {
    form,
    errors,
    currentStep,
    isCreating,
    progress,
    creationTxHash,
    tokenAddress,
    walletBalance,
    selectedNetwork,
    securityLevel,
    setSelectedNetwork,
    validateForm,
    handleInputChange,
    handleCheckboxChange,
    handleImageUpload,
    nextStep,
    prevStep,
    resetCreator,
    PLATFORM_FEE
  };
};
