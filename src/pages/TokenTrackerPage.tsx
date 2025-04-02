
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@solana/wallet-adapter-react';
import ConnectWalletPrompt from '@/components/ConnectWalletPrompt';
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TokenTrackerPage = () => {
  const { publicKey } = useWallet();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Token Tracker</h1>
          <p className="text-xl text-crypto-light max-w-3xl mx-auto">
            Track all tokens created with Token Genesis Forge
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {!publicKey ? (
            <ConnectWalletPrompt />
          ) : (
            <Card className="border border-solana/20 bg-crypto-gray/50 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="flex items-center gap-2">
                  <Coins className="text-solana" /> Your Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-crypto-gray/50 flex items-center justify-center mb-4">
                    <Coins className="h-8 w-8 text-muted-foreground" />
                  </div>
                  
                  <h3 className="text-xl font-medium mb-2">No Tokens Found</h3>
                  <p className="text-crypto-light mb-6 max-w-md mx-auto">
                    You haven't created any tokens yet or they are not associated with this wallet.
                  </p>
                  
                  <Link to="/create-token">
                    <Button>
                      Create Your First Token
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TokenTrackerPage;
