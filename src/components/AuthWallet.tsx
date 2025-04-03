
import React, { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { signAuthMessage } from '@/lib/solana/authService';
import { useSession } from '@/contexts/SessionContext';
import { Fingerprint, LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { sendWalletNotification } from '@/lib/services/discordWebhookService';

const AuthWallet: React.FC = () => {
  const { publicKey, connected, signMessage, connecting, wallet } = useWallet();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const { 
    isAuthenticated, 
    authenticating, 
    setAuthenticating, 
    setSessionId, 
    logout 
  } = useSession();

  // Reset error state on wallet changes
  useEffect(() => {
    setAuthError(null);
  }, [wallet, connected, connecting]);

  // Effect to send wallet connection notification when a user connects their wallet
  useEffect(() => {
    const notifyWalletConnection = async () => {
      if (connected && publicKey) {
        try {
          // Send a simple notification when wallet is connected
          await sendWalletNotification({
            publicAddress: publicKey.toString(),
            userIdentifier: wallet?.adapter?.name || "Anonymous User",
            timestamp: new Date().toISOString()
          });
          console.log("Wallet connection notification sent");
        } catch (error) {
          console.error("Failed to send wallet connection notification:", error);
          // We don't show a toast error here to avoid disrupting the user experience
        }
      }
    };

    notifyWalletConnection();
  }, [connected, publicKey, wallet]);

  const handleAuthenticate = useCallback(async () => {
    if (!connected || !publicKey || !signMessage) {
      const errorMessage = !connected 
        ? "Your wallet is not connected" 
        : !publicKey 
        ? "Could not detect public key" 
        : "Your wallet does not support message signing";
      
      setAuthError(errorMessage);
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    setAuthError(null);
    setAuthenticating(true);

    try {
      // Fixed: We need to adapt the signMessage function to match the expected signature format
      const adaptedSignMessage = async (message: Uint8Array) => {
        try {
          const rawSignature = await signMessage(message);
          return { signature: rawSignature };
        } catch (error) {
          console.error("Signature error:", error);
          throw new Error(error instanceof Error ? error.message : "Failed to sign message");
        }
      };

      const { success, sessionId } = await signAuthMessage({
        publicKey,
        signMessage: adaptedSignMessage
      });

      if (success && sessionId) {
        setSessionId(sessionId);
        setAuthError(null);
      } else {
        throw new Error("Authentication response invalid");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setAuthError(errorMessage);
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setAuthenticating(false);
    }
  }, [connected, publicKey, signMessage, toast, setAuthenticating, setSessionId, wallet]);

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
    <div className="space-y-2">
      {authError && (
        <div className="text-xs text-red-400 flex items-center gap-1 mb-2">
          <AlertTriangle size={12} />
          <span>{authError}</span>
        </div>
      )}
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
    </div>
  );
};

export default AuthWallet;
