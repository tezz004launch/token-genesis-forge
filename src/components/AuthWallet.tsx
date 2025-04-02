
import React, { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { signAuthMessage } from '@/lib/solana/authService';
import { useSession } from '@/contexts/SessionContext';
import { Fingerprint, LogOut, Loader2 } from 'lucide-react';

const AuthWallet: React.FC = () => {
  const { publicKey, connected, signMessage } = useWallet();
  const { toast } = useToast();
  const { 
    isAuthenticated, 
    authenticating, 
    setAuthenticating, 
    setSessionId, 
    logout 
  } = useSession();

  const handleAuthenticate = useCallback(async () => {
    if (!connected || !publicKey || !signMessage) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setAuthenticating(true);

    try {
      // Fixed: We need to adapt the signMessage function to match the expected signature format
      const adaptedSignMessage = async (message: Uint8Array) => {
        const rawSignature = await signMessage(message);
        return { signature: rawSignature };
      };

      const { success, sessionId } = await signAuthMessage({
        publicKey,
        signMessage: adaptedSignMessage
      });

      if (success && sessionId) {
        setSessionId(sessionId);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setAuthenticating(false);
    }
  }, [connected, publicKey, signMessage, toast, setAuthenticating, setSessionId]);

  if (!connected) {
    return <WalletMultiButton className="!bg-gradient-to-r from-solana to-crypto-blue hover:opacity-90 transition-opacity" />;
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-crypto-green flex items-center gap-1">
          <Fingerprint size={16} /> Authenticated
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logout}
          className="flex items-center gap-1"
        >
          <LogOut size={14} /> Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleAuthenticate}
      disabled={authenticating}
      className="bg-solana hover:bg-solana-dark"
    >
      {authenticating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Authenticating...
        </>
      ) : (
        <>
          <Fingerprint className="mr-2 h-4 w-4" />
          Authenticate Wallet
        </>
      )}
    </Button>
  );
};

export default AuthWallet;
