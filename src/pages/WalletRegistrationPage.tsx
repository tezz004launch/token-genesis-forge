
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WalletRegistration from '@/components/WalletRegistration';

const WalletRegistrationPage = () => {
  const navigate = useNavigate();

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
