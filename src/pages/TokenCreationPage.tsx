
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TokenCreator from '@/components/TokenCreator';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const TokenCreationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            className="flex items-center text-crypto-light hover:text-white" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold ml-4">Create Meme Coin</h1>
        </div>

        <TokenCreator />
      </div>
    </div>
  );
};

export default TokenCreationPage;
