
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Solana wallet imports
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Commitment } from '@solana/web3.js';
import { useMemo } from 'react';

// Import stylesheets for the wallet
import '@solana/wallet-adapter-react-ui/styles.css';

// Import the SessionProvider
import { SessionProvider } from '@/contexts/SessionContext';

// Import our pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TokenTrackerPage from "./pages/TokenTrackerPage";
import TokenCreationPage from "./pages/TokenCreationPage";
import WalletRegistrationPage from "./pages/WalletRegistrationPage";

// Initialize QueryClient for React Query
const queryClient = new QueryClient();

const App = () => {
  // Set up Solana network and wallet
  const network = WalletAdapterNetwork.Devnet;
  
  // Use custom connection configuration to improve reliability
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const connectionConfig = useMemo(() => ({
    commitment: 'confirmed' as Commitment,
    confirmTransactionInitialTimeout: 60000, // 60 seconds for transaction confirmations
    disableRetryOnRateLimit: false,
  }), []);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <BrowserRouter>
      <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
        <WalletProvider wallets={wallets} autoConnect={true}>
          <WalletModalProvider>
            <SessionProvider>
              <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/tracker" element={<TokenTrackerPage />} />
                    <Route path="/create-token" element={<TokenCreationPage />} />
                    <Route path="/register-wallet" element={<WalletRegistrationPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </QueryClientProvider>
            </SessionProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BrowserRouter>
  );
};

export default App;
