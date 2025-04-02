
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { validateSession, refreshSession, endSession } from '@/lib/solana/authService';
import { toast } from '@/hooks/use-toast';

interface SessionContextType {
  sessionId: string | null;
  isAuthenticated: boolean;
  authenticating: boolean;
  setSessionId: (id: string | null) => void;
  setAuthenticating: (authenticating: boolean) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: null,
  isAuthenticated: false,
  authenticating: false,
  setSessionId: () => {},
  setAuthenticating: () => {},
  logout: () => {},
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem('token_forge_session')
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const { publicKey, connected } = useWallet();

  // Check session validity on mount and when dependencies change
  useEffect(() => {
    if (sessionId && connected && publicKey) {
      const isValid = validateSession(sessionId);
      setIsAuthenticated(isValid);
      
      if (isValid) {
        // Refresh the session to extend its lifetime
        refreshSession(sessionId);
      } else {
        // Remove invalid session
        localStorage.removeItem('token_forge_session');
        setSessionId(null);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [sessionId, connected, publicKey]);

  // When wallet disconnects, end session
  useEffect(() => {
    if (!connected && sessionId) {
      logout();
    }
  }, [connected]);

  // Refresh session periodically (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      if (sessionId) {
        const success = refreshSession(sessionId);
        if (!success) {
          logout();
        }
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, sessionId]);

  const logout = () => {
    if (sessionId) {
      endSession(sessionId);
    }
    localStorage.removeItem('token_forge_session');
    setSessionId(null);
    setIsAuthenticated(false);
    
    toast({
      title: "Logged out",
      description: "You have been signed out successfully"
    });
  };

  // Update local storage when session changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('token_forge_session', sessionId);
    }
  }, [sessionId]);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        isAuthenticated,
        authenticating,
        setSessionId,
        setAuthenticating,
        logout
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
