
import { PublicKey } from '@solana/web3.js';
import { toast } from '@/hooks/use-toast';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

type Wallet = {
  signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  publicKey: PublicKey;
};

// Store authenticated sessions
const authenticatedSessions: Map<string, {
  timestamp: number;
  nonce: string;
}> = new Map();

// Session duration in milliseconds (30 minutes)
const SESSION_DURATION = 30 * 60 * 1000;

/**
 * Generate a random nonce for authentication
 */
export const generateNonce = (): string => {
  return Array.from(nacl.randomBytes(24))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Challenge a user to sign a message with their wallet to authenticate
 */
export const signAuthMessage = async (wallet: Wallet): Promise<{ success: boolean; sessionId?: string }> => {
  try {
    if (!wallet.publicKey || !wallet.signMessage) {
      toast({
        title: "Authentication Failed",
        description: "Your wallet doesn't support message signing",
        variant: "destructive",
      });
      return { success: false };
    }

    // Generate a nonce for this authentication attempt
    const nonce = generateNonce();
    
    // Create message for signing
    const message = new TextEncoder().encode(
      `Authenticate to Token Genesis Forge with your wallet\n\nThis signature will not trigger a blockchain transaction or cost any gas fees.\n\nWallet: ${wallet.publicKey.toString()}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`
    );

    // Request signature from wallet
    const { signature } = await wallet.signMessage(message);
    
    // Verify signature
    const signatureBase58 = bs58.encode(signature);
    const messageBase58 = bs58.encode(message);
    
    // Generate a session ID
    const sessionId = bs58.encode(nacl.hash(signature)).substring(0, 32);
    
    // Store the authenticated session
    authenticatedSessions.set(sessionId, {
      timestamp: Date.now(),
      nonce
    });
    
    // Show success message
    toast({
      title: "Authentication Successful",
      description: "Your wallet is now authenticated for this session",
    });
    
    return { success: true, sessionId };
  } catch (error) {
    console.error("Authentication error:", error);
    toast({
      title: "Authentication Failed",
      description: error instanceof Error ? error.message : "Failed to sign message",
      variant: "destructive",
    });
    return { success: false };
  }
};

/**
 * Validate if a session is still valid
 */
export const validateSession = (sessionId: string | null): boolean => {
  if (!sessionId) return false;
  
  const session = authenticatedSessions.get(sessionId);
  if (!session) return false;
  
  // Check if session has expired
  const isValid = Date.now() - session.timestamp < SESSION_DURATION;
  
  // If expired, remove the session
  if (!isValid) {
    authenticatedSessions.delete(sessionId);
  }
  
  return isValid;
};

/**
 * Refresh a valid session
 */
export const refreshSession = (sessionId: string): boolean => {
  const session = authenticatedSessions.get(sessionId);
  if (!session) return false;
  
  // Update session timestamp
  authenticatedSessions.set(sessionId, {
    ...session,
    timestamp: Date.now()
  });
  
  return true;
};

/**
 * End a session
 */
export const endSession = (sessionId: string): void => {
  authenticatedSessions.delete(sessionId);
};
