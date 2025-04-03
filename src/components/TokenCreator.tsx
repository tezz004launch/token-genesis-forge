
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useTokenCreator } from '@/hooks/useTokenCreator';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { RPC_ENDPOINTS, hasSufficientBalance } from '@/lib/token/tokenCreatorUtils';
import { useWallet } from '@solana/wallet-adapter-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, Info, RefreshCw, Loader2, Zap, Shield } from 'lucide-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import ImageUpload from './ImageUpload';
import ConnectionStatus from './token-creator/ConnectionStatus';
import CreationProgress from './token-creator/CreationProgress';
import AuthStep from './token-creator/AuthStep';
import PaymentStep from './token-creator/PaymentStep';
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useStepConfig } from '@/contexts/StepConfigContext';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/contexts/SessionContext';

interface TokenCreatorProps {
  currentRpcIndex: number;
  connectionState: 'connected' | 'unstable' | 'failed';
  setConnectionState: React.Dispatch<React.SetStateAction<'connected' | 'unstable' | 'failed'>>;
  switchRpcEndpoint: () => void;
  bypassAuth?: boolean;
  onSkipAuth?: () => void;
}

const TokenCreator: React.FC<TokenCreatorProps> = ({ 
  currentRpcIndex,
  connectionState,
  setConnectionState,
  switchRpcEndpoint,
  bypassAuth = false,
  onSkipAuth
}) => {
  const { publicKey } = useWallet();
  const { isAuthenticated } = useSession();
  const { currentStep, visibleSteps, setCurrentStep } = useStepConfig();
  
  const {
    form,
    errors,
    isCreating,
    progress,
    creationTxHash,
    tokenAddress,
    selectedNetwork,
    setSelectedNetwork,
    feeBreakdown,
    connectionError,
    showAuthStep,
    readyToCreate,
    setReadyToCreate,
    handleInputChange,
    handleCheckboxChange,
    handleImageUpload,
    validateForm,
    handleCreateToken,
    resetCreator,
  } = useTokenCreator();

  const {
    walletBalance,
    isLoadingBalance,
    refreshWalletBalance,
  } = useWalletBalance({
    publicKey,
    selectedNetwork,
    currentRpcIndex
  });
  
  const [initialBalanceFetched, setInitialBalanceFetched] = useState(false);
  const [lastBalanceUpdateTime, setLastBalanceUpdateTime] = useState<number | null>(null);
  const [bypassBalanceCheck, setBypassBalanceCheck] = useState(false);

  // Ensure wallet balance is fetched immediately when component mounts or wallet connects
  useEffect(() => {
    if (publicKey && !initialBalanceFetched) {
      console.log(`[TokenCreator] Initial balance fetch for wallet: ${publicKey.toString()}`);
      
      // Added a small delay to ensure all connections are properly established
      const timer = setTimeout(() => {
        refreshWalletBalance(true)
          .catch(err => {
            console.error("[TokenCreator] Initial balance fetch failed:", err);
            setConnectionState('unstable');
          });
        setInitialBalanceFetched(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [publicKey, refreshWalletBalance, initialBalanceFetched, setConnectionState]);

  // Reset initialBalanceFetched when wallet disconnects
  useEffect(() => {
    if (!publicKey) {
      setInitialBalanceFetched(false);
    }
  }, [publicKey]);

  // Process token creation when ready
  useEffect(() => {
    if (readyToCreate && !isCreating) {
      const hasSufficientFunds = hasSufficientBalance(walletBalance, feeBreakdown);
      console.log(`[TokenCreator] Processing token creation. Has sufficient funds: ${hasSufficientFunds}, Bypass balance check: ${bypassBalanceCheck}`);
      
      // Always proceed if bypassing balance check
      handleCreateToken(hasSufficientFunds || bypassBalanceCheck);
      setReadyToCreate(false);
    }
  }, [readyToCreate, isCreating, handleCreateToken, walletBalance, feeBreakdown, setReadyToCreate, bypassBalanceCheck]);

  // Handle auth bypass if needed
  useEffect(() => {
    if (bypassAuth && showAuthStep) {
      setCurrentStep(2); // Skip to token details step
      toast({
        title: "Authentication Skipped",
        description: "You can create your token without authentication"
      });
    }
  }, [bypassAuth, showAuthStep, setCurrentStep]);

  const handleSubmitToken = () => {
    if (!validateForm()) {
      return;
    }
    
    if (!hasSufficientBalance(walletBalance, feeBreakdown) && !bypassBalanceCheck) {
      toast({
        title: "Insufficient Balance",
        description: "Enable 'Bypass Balance Check' to attempt token creation anyway",
        variant: "destructive"
      });
      return;
    }
    
    // Check if we need to refresh balance before proceeding
    const hasBalance = walletBalance !== null;
    const balanceAge = hasBalance ? Date.now() - (lastBalanceUpdateTime || 0) : Infinity;
    const balanceStale = balanceAge > 10000; // 10 seconds
    
    if (!hasBalance || balanceStale) {
      console.log(`[TokenCreator] Refreshing balance before token creation`);
      refreshWalletBalance(true)
        .catch(err => {
          console.error("[TokenCreator] Balance refresh failed:", err);
          setConnectionState('unstable');
        });
      setTimeout(() => {
        // Always proceed if bypassing balance check
        setReadyToCreate(true);
      }, 1000); // Wait a bit for balance to refresh
    } else {
      setReadyToCreate(true);
    }
  };

  const isPaymentStep = currentStep === visibleSteps.length - 1;

  // Show wallet connection states for debugging
  console.log(`[TokenCreator] Wallet connected: ${!!publicKey}, balance: ${walletBalance}, connection state: ${connectionState}`);

  // Determine if we need to show auth step
  const shouldShowAuthStep = showAuthStep && !bypassAuth;

  if (shouldShowAuthStep) {
    return (
      <Card className="border border-gray-800 bg-crypto-gray/30 backdrop-blur-sm">
        <CardContent className="pt-6">
          <AuthStep 
            connectionError={connectionError}
            connectionState={connectionState}
            switchRpcEndpoint={switchRpcEndpoint}
            currentRpcIndex={currentRpcIndex}
            totalEndpoints={RPC_ENDPOINTS[selectedNetwork].length}
            onSkipAuth={onSkipAuth}
          />
        </CardContent>
      </Card>
    );
  }

  if (isCreating) {
    return (
      <Card className="border border-gray-800 bg-crypto-gray/30 backdrop-blur-sm">
        <CardContent className="pt-6">
          <CreationProgress 
            progress={progress}
            creationTxHash={creationTxHash}
            tokenAddress={tokenAddress}
            tokenName={form.name}
            tokenSymbol={form.symbol}
            tokenDecimals={form.decimals}
            tokenSupply={form.supply}
            selectedNetwork={selectedNetwork}
          />
        </CardContent>
      </Card>
    );
  }
  
  if (isPaymentStep) {
    return (
      <Card className="border border-gray-800 bg-crypto-gray/30 backdrop-blur-sm">
        <CardContent className="pt-6">
          <PaymentStep 
            feeBreakdown={feeBreakdown}
            walletBalance={walletBalance}
            hasSufficientBalance={hasSufficientBalance(walletBalance, feeBreakdown)}
            connectionState={connectionState}
            isLoadingBalance={isLoadingBalance}
            refreshWalletBalance={refreshWalletBalance}
            switchRpcEndpoint={switchRpcEndpoint}
            currentRpcIndex={currentRpcIndex}
            selectedNetwork={selectedNetwork}
            onNext={handleSubmitToken}
          />
        </CardContent>
      </Card>
    );
  }

  // Token details form
  return (
    <Card className="border border-gray-800 bg-crypto-gray/30 backdrop-blur-sm">
      <CardContent className="pt-6">
        <ConnectionStatus 
          connectionState={connectionState}
          switchRpcEndpoint={switchRpcEndpoint}
          currentRpcIndex={currentRpcIndex}
          totalEndpoints={RPC_ENDPOINTS[selectedNetwork].length}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-10">
          {/* Left Column - Token Details */}
          <div className="lg:col-span-4">
            <div className="space-y-8">
              {/* Token Name & Symbol */}
              <div className="bg-gray-800/40 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Token Info</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Token Name <span className="text-red-400">*</span>
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
                      Symbol <span className="text-red-400">*</span>
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
                      Max 8 characters (e.g. BTC, SHIB, DOGE)
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Token Image */}
              <div className="bg-gray-800/40 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Token Image</h2>
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  currentImage={form.image}
                />
              </div>
              
              {/* Description */}
              <div className="bg-gray-800/40 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Token Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Describe your token"
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
              
              {/* Parameters */}
              <div className="bg-gray-800/40 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Parameters</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="decimals" className="text-sm font-medium">
                      Decimals
                    </Label>
                    <Input
                      id="decimals"
                      name="decimals"
                      type="number"
                      value={form.decimals}
                      onChange={handleInputChange}
                      min={0}
                      max={9}
                    />
                    <p className="text-xs text-muted-foreground">
                      Typically 9 for most Solana tokens
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supply" className="text-sm font-medium">
                      Total Supply <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="supply"
                      name="supply"
                      type="number"
                      value={form.supply}
                      onChange={handleInputChange}
                      placeholder="1000000000"
                      className={errors.supply ? "border-red-500" : ""}
                      min={1}
                    />
                    {errors.supply && <p className="text-xs text-red-500">{errors.supply}</p>}
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="bg-gray-800/40 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Social Links</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium">
                      Website
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      value={form.website || ''}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-sm font-medium">
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      value={form.twitter || ''}
                      onChange={handleInputChange}
                      placeholder="@example"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telegram" className="text-sm font-medium">
                      Telegram
                    </Label>
                    <Input
                      id="telegram"
                      name="telegram"
                      value={form.telegram || ''}
                      onChange={handleInputChange}
                      placeholder="example"
                    />
                  </div>
                </div>
              </div>
              
              {/* Authorities */}
              <div className="bg-gray-800/40 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Authorities</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="revokeMintAuthority" className="text-sm font-medium cursor-pointer">
                        Revoke Mint Authority
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Prevents creating more tokens in the future
                      </p>
                    </div>
                    <Switch
                      id="revokeMintAuthority"
                      checked={form.revokeMintAuthority}
                      onCheckedChange={(checked) => handleCheckboxChange(checked, 'revokeMintAuthority')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="revokeFreezeAuthority" className="text-sm font-medium cursor-pointer">
                        Revoke Freeze Authority
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Prevents freezing user tokens in the future
                      </p>
                    </div>
                    <Switch
                      id="revokeFreezeAuthority"
                      checked={form.revokeFreezeAuthority}
                      onCheckedChange={(checked) => handleCheckboxChange(checked, 'revokeFreezeAuthority')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="immutableMetadata" className="text-sm font-medium cursor-pointer">
                        Immutable Metadata
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Makes token metadata permanently unchangeable
                      </p>
                    </div>
                    <Switch
                      id="immutableMetadata"
                      checked={form.immutableMetadata}
                      onCheckedChange={(checked) => handleCheckboxChange(checked, 'immutableMetadata')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Network & Preview */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Network Selection */}
              <div className="bg-gray-800/40 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Network</h2>
                <RadioGroup 
                  value={selectedNetwork}
                  className="space-y-3"
                  onValueChange={(value) => setSelectedNetwork(value as 'devnet' | 'mainnet-beta')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="devnet" id="devnet" />
                    <Label htmlFor="devnet" className="cursor-pointer">Devnet (Test Network)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mainnet-beta" id="mainnet-beta" />
                    <Label htmlFor="mainnet-beta" className="cursor-pointer">Mainnet (Real Network)</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-2">
                  Start with Devnet to test your token for free
                </p>
              </div>
              
              {/* Token Preview */}
              <div className="bg-gray-800/40 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Token Preview</h2>
                <div className="bg-crypto-gray/50 rounded-lg p-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-3">
                    {form.image ? (
                      <img 
                        src={URL.createObjectURL(form.image)} 
                        alt="Token" 
                        className="w-14 h-14 object-cover rounded-full"
                      />
                    ) : (
                      <div className="text-lg font-bold text-crypto-light">
                        {form.symbol.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold">{form.name || "My Token"}</h3>
                  <div className="text-sm text-crypto-light mb-2">{form.symbol || "TKN"}</div>
                  <div className="text-xs text-crypto-light">{form.supply.toLocaleString()} tokens</div>
                </div>
              </div>
              
              {/* Balance Information */}
              <div className="bg-gray-800/40 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold">Your Balance</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => refreshWalletBalance(true)}
                    disabled={isLoadingBalance}
                  >
                    {isLoadingBalance ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2">Refresh</span>
                  </Button>
                </div>
                <div className="bg-crypto-gray/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span>SOL Balance:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : "Loading..."}
                      </span>
                      {isLoadingBalance && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </div>
                </div>
                {connectionState !== 'connected' && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={switchRpcEndpoint}
                      className="w-full"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Switch RPC Endpoint ({currentRpcIndex + 1}/{RPC_ENDPOINTS[selectedNetwork].length})
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Continue Button */}
              <div className="bg-gray-800/40 p-6 rounded-xl">
                <Button 
                  onClick={() => setCurrentStep(currentStep + 1)} 
                  className="w-full bg-solana hover:bg-solana/90"
                  disabled={!form.name || !form.symbol}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Continue to Payment
                </Button>
              </div>
              
              {/* Security Note */}
              <div className="bg-gray-800/40 p-6 rounded-xl">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-crypto-green mt-0.5" />
                  <div className="text-sm text-crypto-light">
                    <p className="mb-1 font-medium">Your token will be created securely</p>
                    <p>Before creating your token, you'll approve a transaction with your wallet. 
                    All supply will be sent directly to your wallet.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCreator;
