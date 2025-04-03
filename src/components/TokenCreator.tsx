
import React, { useState, useCallback, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import StepIndicator from './StepIndicator';
import { useToast } from '@/components/ui/use-toast';
import { Slider } from '@/components/ui/slider';
import { createSPLToken } from '@/lib/solana/tokenService';
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
  MessageSquare
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from '@/components/ui/progress';
import { LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { useSession } from '@/contexts/SessionContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import AuthWallet from './AuthWallet';

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
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
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

    if (walletBalance !== null && walletBalance < 0.05) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least 0.05 SOL in your wallet. Current balance: ${walletBalance.toFixed(4)} SOL`,
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    setProgress(10);
    
    try {
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
        feePayer: "6DLm5CnfXZjgi2Sjxr9mdaaCwqE3Syr1F4M2kTLYmLJA",
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
    }
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

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="text-center space-y-6 py-6">
          <h3 className="text-xl font-medium">Connect Your Wallet to Begin</h3>
          <p className="text-crypto-light">
            Please connect your Solana wallet to use our token creation service.
          </p>
        </div>
      );
    }

    if (currentStep === 1) {
      return renderAuthStep();
    }
    
    switch (currentStep) {
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Token Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                placeholder="My Meme Token"
                value={form.name}
                onChange={handleInputChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="symbol">Token Symbol <span className="text-red-500">*</span></Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Max 8 characters. Common format is all caps (e.g., "PEPE", "DOGE").</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="symbol"
                name="symbol"
                placeholder="MEME"
                maxLength={8}
                value={form.symbol}
                onChange={handleInputChange}
                className={errors.symbol ? "border-red-500" : ""}
              />
              {errors.symbol && <p className="text-red-500 text-sm">{errors.symbol}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Token Description <span className="text-gray-500">(optional)</span></Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your meme coin's purpose and story..."
                value={form.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="supply">Total Supply <span className="text-red-500">*</span></Label>
                  <p className="text-sm text-muted-foreground">
                    How many tokens will exist in total
                  </p>
                </div>
                <div className="w-1/3">
                  <Input
                    id="supply"
                    name="supply"
                    type="number"
                    min="1"
                    value={form.supply}
                    onChange={handleInputChange}
                    className={errors.supply ? "border-red-500" : ""}
                  />
                  {errors.supply && <p className="text-red-500 text-sm">{errors.supply}</p>}
                </div>
              </div>
              
              <div className="bg-crypto-gray/30 p-4 rounded-md">
                <p className="text-sm text-crypto-light">
                  Popular meme coins often have large supplies (billions or trillions). All tokens will initially be sent to your connected wallet.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Decimals <span className="text-red-500">*</span></Label>
                  <p className="text-sm text-muted-foreground">
                    How divisible your token will be (like cents in a dollar)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{form.decimals}</span>
                </div>
              </div>
              
              <Slider
                value={[form.decimals]}
                min={0}
                max={9}
                step={1}
                onValueChange={(vals) => setForm(prev => ({ ...prev, decimals: vals[0] }))}
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 (No decimals)</span>
                <span>9 (Max divisibility)</span>
              </div>
              
              <div className="bg-crypto-gray/30 p-4 rounded-md">
                <p className="text-sm text-crypto-light">
                  Most meme coins use 9 decimals (like SOL). SHIB uses 8, DOGE uses 8.
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-1 mb-4">
              <h3 className="text-lg font-medium">Social Links</h3>
              <p className="text-sm text-muted-foreground">
                Add your project's social media links (optional)
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor="website" className="mb-2">Website URL</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://yourmemetoken.com"
                    value={form.website}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Twitter className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor="twitter" className="mb-2">X (Twitter)</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    placeholder="https://x.com/yourmemetoken"
                    value={form.twitter}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor="telegram" className="mb-2">Telegram</Label>
                  <Input
                    id="telegram"
                    name="telegram"
                    placeholder="https://t.me/yourmemetoken"
                    value={form.telegram}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-crypto-gray/30 p-4 rounded-md mt-4">
              <p className="text-sm text-crypto-light">
                Adding social links helps establish credibility for your meme coin and makes it easier for people to follow your project.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Revoke Authorities</h3>
              <p className="text-sm text-muted-foreground">
                Tokens are created with several authorities by default. It is recommended to revoke all these authorities to gain more trust from investors.
              </p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span>Security Level:</span>
              <div className="flex items-center gap-2">
                {securityLevel === 'low' && (
                  <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs font-medium flex items-center gap-1">
                    <AlertTriangle size={12} /> Low
                  </span>
                )}
                {securityLevel === 'medium' && (
                  <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs font-medium flex items-center gap-1">
                    <Shield size={12} /> Medium
                  </span>
                )}
                {securityLevel === 'high' && (
                  <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium flex items-center gap-1">
                    <Shield size={12} /> High
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="revokeFreezeAuthority"
                  checked={form.revokeFreezeAuthority}
                  onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'revokeFreezeAuthority')}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="revokeFreezeAuthority"
                    className="text-base font-medium cursor-pointer"
                  >
                    Revoke Freeze Authority
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Removes the ability to freeze token accounts.
                    Recommended for decentralized tokens and DeFi compatibility.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="revokeMintAuthority"
                  checked={form.revokeMintAuthority}
                  onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'revokeMintAuthority')}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="revokeMintAuthority"
                    className="text-base font-medium cursor-pointer"
                  >
                    Revoke Mint Authority
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently gives up the ability to create more tokens in the future.
                    This makes your token supply fixed and unchangeable.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="immutableMetadata"
                  checked={form.immutableMetadata}
                  onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'immutableMetadata')}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="immutableMetadata"
                    className="text-base font-medium cursor-pointer"
                  >
                    Immutable Metadata
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to make metadata immutable to get more trust.
                    If active, the metadata becomes immutable and cannot be changed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-md mt-4">
              <p className="text-sm text-amber-200/70">
                <strong>Important:</strong> These options are completely free without additional fees! Revoking authorities is permanent and cannot be undone.
                Make your decision carefully.
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Token Logo <span className="text-red-500">*</span></Label>
              <p className="text-sm text-muted-foreground">
                Upload a logo for your meme coin (PNG format recommended)
              </p>
            </div>
            
            <ImageUpload onImageUpload={handleImageUpload} currentImage={form.image} />
            
            <div className="bg-crypto-gray/30 p-4 rounded-md">
              <p className="text-sm text-crypto-light">
                Creative and recognizable logos are key for successful meme coins.
                For best results, use a square PNG image (1000x1000px recommended).
              </p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Network Selection</h3>
              <p className="text-sm text-muted-foreground">
                Choose the network where you want to create your token
              </p>
            </div>
            
            <div className="space-y-6">
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedNetwork === 'devnet' 
                    ? 'bg-purple-900/20 border-purple-500/50' 
                    : 'bg-crypto-gray/30 border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedNetwork('devnet')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    selectedNetwork === 'devnet' ? 'bg-purple-500' : 'bg-gray-600'
                  }`}></div>
                  <h4 className="font-medium">Devnet</h4>
                </div>
                <p className="pl-7 mt-2 text-sm text-crypto-light">
                  Solana's test network. Tokens created here have no real value.
                  Perfect for testing and development.
                </p>
              </div>
              
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedNetwork === 'mainnet-beta' 
                    ? 'bg-green-900/20 border-green-500/50' 
                    : 'bg-crypto-gray/30 border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedNetwork('mainnet-beta')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    selectedNetwork === 'mainnet-beta' ? 'bg-green-500' : 'bg-gray-600'
                  }`}></div>
                  <h4 className="font-medium">Mainnet</h4>
                </div>
                <p className="pl-7 mt-2 text-sm text-crypto-light">
                  Solana's production network. Tokens created here can have real value.
                  Use this for actual token launches.
                </p>
              </div>
            </div>
            
            {selectedNetwork === 'mainnet-beta' && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={18} className="text-yellow-500 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium">Important: Mainnet Transaction</h4>
                    <p className="text-sm">
                      You're about to create a token on Solana's mainnet. This will use 
                      real SOL from your wallet and cannot be reversed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Review Your Meme Coin</h3>
              <p className="text-sm text-muted-foreground">
                Please verify all details before proceeding to payment
              </p>
            </div>
            
            <Alert className="bg-green-900/20 border-green-500/20">
              <Shield className="h-4 w-4 text-green-500" />
              <AlertTitle>Authenticated Creation</AlertTitle>
              <AlertDescription>
                Your wallet has been authenticated, ensuring only you can create this token.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{form.name}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Symbol</p>
                <p className="text-base">{form.symbol}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Supply</p>
                <p className="text-base">{form.supply.toLocaleString()}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Decimals</p>
                <p className="text-base">{form.decimals}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Network</p>
                <p className="text-base flex items-center gap-2">
                  {selectedNetwork === 'mainnet-beta' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span>Mainnet</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>Devnet</span>
                    </>
                  )}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Security</p>
                <div className="flex items-center gap-2">
                  {securityLevel === 'low' && (
                    <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs font-medium">Low</span>
                  )}
                  {securityLevel === 'medium' && (
                    <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs font-medium">Medium</span>
                  )}
                  {securityLevel === 'high' && (
                    <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium">High</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Authorities Revoked</p>
                <p className="text-base">
                  {[
                    form.revokeMintAuthority ? "Mint" : "",
                    form.revokeFreezeAuthority ? "Freeze" : "",
                    form.immutableMetadata ? "Metadata" : ""
                  ].filter(Boolean).join(", ") || "None"}
                </p>
              </div>
              
              {form.description && (
                <div className="space-y-2 col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-base">{form.description}</p>
                </div>
              )}
              
              <div className="space-y-2 col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Social Links</p>
                <div className="space-y-2">
                  {form.website && (
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-muted-foreground" />
                      <a href={form.website} target="_blank" rel="noopener noreferrer" className="text-solana hover:underline">
                        {form.website}
                      </a>
                    </div>
                  )}
                  
                  {form.twitter && (
                    <div className="flex items-center gap-2">
                      <Twitter size={14} className="text-muted-foreground" />
                      <a href={form.twitter} target="_blank" rel="noopener noreferrer" className="text-solana hover:underline">
                        {form.twitter}
                      </a>
                    </div>
                  )}
                  
                  {form.telegram && (
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-muted-foreground" />
                      <a href={form.telegram} target="_blank" rel="noopener noreferrer" className="text-solana hover:underline">
                        {form.telegram}
                      </a>
                    </div>
                  )}
                  
                  {!form.website && !form.twitter && !form.telegram && (
                    <p className="text-muted-foreground text-sm">No social links provided</p>
                  )}
                </div>
              </div>
              
              {form.image && (
                <div className="space-y-2 col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Token Logo</p>
                  <img 
                    src={URL.createObjectURL(form.image)} 
                    alt="Token Logo" 
                    className="w-16 h-16 rounded-full object-cover border border-gray-700" 
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Payment</h3>
              <p className="text-sm text-muted-foreground">
                Complete payment to create your meme coin
              </p>
            </div>
            
            <Alert className="bg-green-900/20 border-green-500/20">
              <Shield className="h-4 w-4 text-green-500" />
              <AlertTitle>Secure Transaction</AlertTitle>
              <AlertDescription>
                This transaction is protected by wallet authentication and will require your approval.
              </AlertDescription>
            </Alert>
            
            <div className="bg-crypto-gray/30 p-6 rounded-md">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Platform Fee</span>
                <span className="font-medium">
                  {selectedNetwork === 'mainnet-beta' ? '0.1' : '0.05'} SOL 
                  <span className="text-sm text-green-400"> (SALE)</span>
                </span>
              </div>
              
              {walletBalance !== null && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Your Balance</span>
                  <span className={`font-medium ${
                    walletBalance < (selectedNetwork === 'mainnet-beta' ? 0.1 : 0.05) ? 'text-red-500' : ''
                  }`}>
                    {walletBalance.toFixed(4)} SOL
                  </span>
                </div>
              )}
              
              <div className="border-t border-gray-700 my-3" />
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg">{selectedNetwork === 'mainnet-beta' ? '0.1' : '0.05'} SOL</span>
                  <Coins className="text-solana h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div className="bg-crypto-gray/30 p-4 rounded-md flex items-start space-x-3">
              <CreditCard className="text-solana h-5 w-5 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm">
                  This fee covers all costs associated with creating your meme coin on the Solana 
                  {selectedNetwork === 'mainnet-beta' ? ' mainnet' : ' devnet'}. 
                  Your wallet will be prompted to approve this transaction.
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full bg-solana hover:bg-solana-dark transition-colors"
                size="lg"
                disabled={
                  isCreating || 
                  (walletBalance !== null && 
                   walletBalance < (selectedNetwork === 'mainnet-beta' ? 0.1 : 0.05))
                }
                onClick={handleCreateToken}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Meme Coin...
                  </>
                ) : (
                  "Pay & Create Meme Coin"
                )}
              </Button>
              {walletBalance !== null && 
               walletBalance < (selectedNetwork === 'mainnet-beta' ? 0.1 : 0.05) && (
                <p className="text-red-500 text-sm text-center mt-2">
                  Insufficient balance. You need at least {selectedNetwork === 'mainnet-beta' ? '0.1' : '0.05'} SOL.
                </p>
              )}
              {isCreating && (
                <div className="mt-4">
                  <Progress value={progress} className="bg-crypto-gray h-2" />
                  <p className="text-xs text-center mt-2 text-muted-foreground">
                    {progress < 100 ? "Processing your transaction..." : "Token created successfully!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 10:
        return (
          <div className="text-center space-y-6 py-6">
            <div className="w-20 h-20 mx-auto rounded-full border-2 border-crypto-green/30 flex items-center justify-center bg-crypto-green/10">
              <Check className="h-10 w-10 text-crypto-green" />
            </div>
            
            <h3 className="text-2xl font-medium">Meme Coin Created Successfully!</h3>
            
            <Alert className="bg-green-900/20 border-green-500/20 max-w-md mx-auto">
              <Shield className="h-4 w-4 text-green-500" />
              <AlertTitle>Authenticated Creation Complete</AlertTitle>
              <AlertDescription>
                Your token was created securely with your authenticated wallet.
              </AlertDescription>
            </Alert>
            
            <div className="bg-crypto-gray/30 p-6 rounded-md max-w-md mx-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Token Name</p>
                  <p className="font-medium">{form.name} ({form.symbol})</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Network</p>
                  <p className="font-medium">{selectedNetwork === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Token Address</p>
                  <a 
                    href={`https://explorer.solana.com/address/${tokenAddress}?cluster=${selectedNetwork}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-sm font-mono text-solana hover:underline break-all"
                  >
                    {tokenAddress || "Token address would appear here"}
                  </a>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Transaction Hash</p>
                  <a 
                    href={`https://explorer.solana.com/tx/${creationTxHash}?cluster=${selectedNetwork}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-sm font-mono text-solana hover:underline break-all"
                  >
                    {creationTxHash || "Transaction hash would appear here"}
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 pt-4">
              <Button 
                variant="outline" 
                className="border-crypto-green text-crypto-green hover:bg-crypto-green/10"
                onClick={() => window.location.reload()}
              >
                Create Another Meme Coin
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mb-12">
      <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />
      
      <Card className="border border-gray-800 bg-crypto-gray/30 backdrop-blur">
        <CardHeader className="border-b border-gray-800">
          <CardTitle>{STEPS[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
        {currentStep !== STEPS.length - 1 && currentStep !== 8 && (
          <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1 || (currentStep === 2 && isAuthenticated)}
            >
              Back
            </Button>
            <Button 
              onClick={nextStep}
              disabled={(currentStep === 1 && !isAuthenticated) || currentStep === STEPS.length - 2 || isCreating}
            >
              Continue
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default TokenCreator;
