
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WalletRegistration from '@/components/WalletRegistration';

const WalletRegistrationPage = () => {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();

  return (
    <div className="min-h-screen flex flex-col bg-crypto-dark text-white">
      <Header />
      
      <main className="flex-grow container mx-auto py-12 px-4">
        <div className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            className="flex items-center text-crypto-light hover:text-white" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold ml-4">Wallet Registration</h1>
        </div>
        
        <div className="max-w-md mx-auto">
          {connected && publicKey && (
            <Alert className="mb-6 bg-blue-900/30 border-blue-500 text-white">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-300">Wallet Connected</AlertTitle>
              <AlertDescription className="text-blue-100">
                Your wallet has been detected and a basic notification has been sent.
                Please complete the registration below to provide your identifier for future interactions.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Register Your Wallet</h2>
            <p className="text-crypto-light">
              Connect your wallet and provide a unique identifier to register for our services.
              This helps us link your on-chain activity to your profile, enhancing your experience.
            </p>
          </div>
          
          <WalletRegistration onComplete={() => navigate('/')} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WalletRegistrationPage;
