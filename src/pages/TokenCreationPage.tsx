
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenCreator from '@/components/TokenCreator';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, AlertTriangle } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';
import ConnectWalletPrompt from '@/components/ConnectWalletPrompt';
import { useWallet } from '@solana/wallet-adapter-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { StepConfigProvider } from '@/contexts/StepConfigContext';
import { RPC_ENDPOINTS } from '@/lib/token/tokenCreatorUtils';

const TokenCreationPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const { connected, connecting, publicKey } = useWallet();
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const [walletJustConnected, setWalletJustConnected] = useState(false);
  const [pageLoadTime] = useState(Date.now());
  const [rpcLimitWarning, setRpcLimitWarning] = useState(false);
  const [currentRpcIndex, setCurrentRpcIndex] = useState(0);
  const [connectionState, setConnectionState] = useState<'connected' | 'unstable' | 'failed'>('connected');
  const [bypassAuth, setBypassAuth] = useState(false);

  // Monitor wallet connection attempts
  useEffect(() => {
    if (connecting) {
      setConnectionAttempted(true);
      console.log("[TokenCreationPage] Wallet connecting attempt detected");
    }
  }, [connecting]);

  // Track when wallet gets connected
  useEffect(() => {
    if (!walletJustConnected && connected && publicKey) {
      console.log("[TokenCreationPage] Wallet newly connected:", publicKey.toString());
      setWalletJustConnected(true);
      
      // Show a success toast on successful connection
      toast({
        title: "Wallet Connected",
        description: `Connected to ${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-4)}`,
      });
    } else if (!connected) {
      setWalletJustConnected(false);
    }
  }, [connected, publicKey, walletJustConnected]);

  // Handle connection errors
  useEffect(() => {
    if (connectionAttempted && !connected && !connecting) {
      console.log("[TokenCreationPage] Wallet connection attempt failed");
      toast({
        title: "Wallet Connection Issue",
        description: "There was a problem connecting to your wallet. Please try again.",
        variant: "destructive"
      });
      setConnectionAttempted(false);
    }
  }, [connectionAttempted, connected, connecting]);

  // Listen for RPC rate limiting errors in console logs
  useEffect(() => {
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
      const message = args.join(' ');
      if (message.includes('429') || 
          message.includes('Too many requests') || 
          message.includes('rate limit')) {
        setRpcLimitWarning(true);
      }
      originalConsoleWarn.apply(console, args);
    };
    
    return () => {
      console.warn = originalConsoleWarn;
    };
  }, []);
  
  // Debug log page load time and wallet status
  useEffect(() => {
    console.log(`[TokenCreationPage] Page loaded at ${new Date(pageLoadTime).toISOString()}`);
    console.log(`[TokenCreationPage] Initial wallet status - connected: ${connected}, publicKey: ${publicKey?.toString() || 'none'}`);
  }, [pageLoadTime, connected, publicKey]);
  
  // Handle RPC endpoint switching
  const switchRpcEndpoint = () => {
    setCurrentRpcIndex(prev => (prev + 1) % RPC_ENDPOINTS['devnet'].length);
    toast({
      title: "Switching RPC Endpoint",
      description: "Trying a different Solana network connection...",
    });
    
    // Reset connection state when switching endpoints
    setTimeout(() => {
      setConnectionState('connected');
    }, 500);
  };
  
  // Skip auth if network issues persist
  const handleSkipAuth = () => {
    setBypassAuth(true);
    toast({
      title: "Authentication Bypassed",
      description: "You can continue without authentication for now",
    });
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="flex items-center text-crypto-light hover:text-white" 
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={16} className="mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold ml-4">Create Token</h1>
          </div>
        </div>

        {rpcLimitWarning && (
          <Alert className="bg-yellow-900/20 border-yellow-800/30 mb-6">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="font-medium">
              You're experiencing rate limiting issues with Solana RPC nodes. Try using the "Change RPC" button to switch to a different endpoint, or wait a few minutes before continuing.
            </AlertDescription>
          </Alert>
        )}

        <Alert className="bg-blue-900/20 border-blue-800/30 mb-6">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription>
            If you experience network connectivity issues or balance update problems, use the "Change RPC" button to connect to a different Solana endpoint.
          </AlertDescription>
        </Alert>

        <StepConfigProvider>
          {!connected ? (
            <ConnectWalletPrompt>
              Please connect your wallet to create a token. Once created, 100% of the token supply will be sent to your wallet.
            </ConnectWalletPrompt>
          ) : (
            <TokenCreator 
              currentRpcIndex={currentRpcIndex}
              connectionState={connectionState}
              setConnectionState={setConnectionState}
              switchRpcEndpoint={switchRpcEndpoint}
              bypassAuth={bypassAuth}
              onSkipAuth={handleSkipAuth}
            />
          )}
        </StepConfigProvider>
      </div>
    </div>
  );
};

export default TokenCreationPage;
