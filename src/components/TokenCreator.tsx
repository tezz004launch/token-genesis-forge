
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTokenCreator } from '@/hooks/useTokenCreator';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useStepConfig } from '@/contexts/StepConfigContext';
import { hasSufficientBalance } from '@/lib/token/tokenCreatorUtils';
import { RPC_ENDPOINTS } from '@/lib/token/tokenCreatorUtils';
import { useWallet } from '@solana/wallet-adapter-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, Info, RefreshCw, Loader2, Zap, Shield } from 'lucide-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import ImageUpload from './ImageUpload';
import ConnectionStatus from './token-creator/ConnectionStatus';
import CreationProgress from './token-creator/CreationProgress';
import AuthStep from './token-creator/AuthStep';

const TokenCreator: React.FC = () => {
  const { publicKey } = useWallet();
  
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
    currentRpcIndex,
    setCurrentRpcIndex,
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
    switchRpcEndpoint
  } = useTokenCreator();

  const { 
    visibleSteps, 
    currentStep, 
    setCurrentStep, 
    totalVisibleSteps 
  } = useStepConfig();

  const {
    walletBalance,
    isLoadingBalance,
    connectionState,
    refreshWalletBalance,
    retryDelay,
    balanceRefreshAttempts,
    setConnectionState
  } = useWalletBalance({
    publicKey,
    selectedNetwork,
    currentRpcIndex
  });

  useEffect(() => {
    if (readyToCreate && !isCreating) {
      handleCreateToken(hasSufficientBalance(walletBalance, feeBreakdown));
      setReadyToCreate(false);
    }
  }, [readyToCreate, isCreating, handleCreateToken, walletBalance, feeBreakdown, setReadyToCreate]);

  const handleSubmitToken = () => {
    if (!validateForm()) {
      return;
    }
    
    if (hasSufficientBalance(walletBalance, feeBreakdown)) {
      setReadyToCreate(true);
    }
  };

  if (showAuthStep) {
    return <AuthStep connectionError={connectionError} />;
  }

  if (isCreating) {
    return (
      <Card className="border border-gray-800 bg-crypto-gray/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Creating Your Meme Coin</CardTitle>
        </CardHeader>
        <CardContent>
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

  return (
    <Card className="border border-gray-800 bg-crypto-gray/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Create Your Meme Coin</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6 col-span-1 md:col-span-2">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="space-y-3">
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
                    Total Supply <span className="text-red-500">*</span>
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
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Token Options</h3>
              
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
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Token Logo</h3>
              <ImageUpload
                onImageUpload={handleImageUpload}
                currentImage={form.image}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Links</h3>
              
              <div className="space-y-3">
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
          </div>
          
          {/* Right Column - Payment & Creation */}
          <div className="space-y-6">
            <div className="bg-crypto-gray/30 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-4">Network & Payment</h3>
              
              <ConnectionStatus 
                connectionState={connectionState}
                switchRpcEndpoint={switchRpcEndpoint}
                currentRpcIndex={currentRpcIndex}
                totalEndpoints={RPC_ENDPOINTS[selectedNetwork].length}
              />
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Your Balance</span>
                  <div className="flex items-center gap-2">
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
                    <span className={`font-medium ${
                      hasSufficientBalance(walletBalance, feeBreakdown) ? 'text-green-400' : 'text-red-500'
                    }`}>
                      {walletBalance !== null 
                        ? `${walletBalance.toFixed(4)} SOL`
                        : "0.0000 SOL"}
                    </span>
                    {isLoadingBalance && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
              
              <Alert className="bg-blue-900/20 border-blue-500/20 my-4">
                <Info className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-sm">
                  Creating a token requires SOL to pay for blockchain storage and transaction fees.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mint Account Rent</span>
                  <span>{feeBreakdown ? (feeBreakdown.mintAccountRent / LAMPORTS_PER_SOL).toFixed(4) : "0.0020"} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Token Account Rent</span>
                  <span>{feeBreakdown ? (feeBreakdown.tokenAccountRent / LAMPORTS_PER_SOL).toFixed(4) : "0.0020"} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction Fee</span>
                  <span>{feeBreakdown ? (feeBreakdown.transactionFee / LAMPORTS_PER_SOL).toFixed(4) : "0.0002"} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>0.05 SOL</span>
                </div>
                <div className="border-t border-gray-700 my-2 pt-2"></div>
                <div className="flex justify-between text-lg font-medium">
                  <span>Total</span>
                  <span className="text-solana">{feeBreakdown ? (feeBreakdown.total / LAMPORTS_PER_SOL).toFixed(4) : "0.0542"} SOL</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6 bg-solana hover:bg-solana-dark"
                onClick={handleSubmitToken}
                disabled={!hasSufficientBalance(walletBalance, feeBreakdown)}
              >
                {!hasSufficientBalance(walletBalance, feeBreakdown) ? (
                  "Insufficient Balance"
                ) : (
                  <>
                    <Coins className="mr-2 h-4 w-4" />
                    Create Token
                  </>
                )}
              </Button>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure transaction</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={switchRpcEndpoint}
                  className="text-xs h-6 px-2"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Change RPC
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCreator;
