
import React from 'react';
import Header from '@/components/Header';
import TokenCreator from '@/components/TokenCreator';
import Footer from '@/components/Footer';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import ConnectWalletPrompt from '@/components/ConnectWalletPrompt';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { publicKey } = useWallet();
  const { toast } = useToast();

  React.useEffect(() => {
    if (publicKey) {
      toast({
        title: "Wallet Connected",
        description: `Connected to ${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-4)}`,
      });
    }
  }, [publicKey, toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-solana-gradient animate-pulse mb-4">
            Token Genesis Forge
          </h1>
          <p className="text-xl text-crypto-light max-w-3xl mx-auto">
            Launch your own SPL token on Solana in minutes. Follow our simple 8-step process
            and get your token in your wallet instantly.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {!publicKey ? (
            <ConnectWalletPrompt />
          ) : (
            <TokenCreator />
          )}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-crypto-gray border-crypto-purple/20">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-crypto-purple/20 flex items-center justify-center mb-4">
                <span className="text-crypto-purple text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Simple</h3>
              <p className="text-crypto-light">
                Create your SPL token in under 2 minutes with our streamlined process.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-crypto-gray border-crypto-blue/20">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-crypto-blue/20 flex items-center justify-center mb-4">
                <span className="text-crypto-blue text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Full Control</h3>
              <p className="text-crypto-light">
                Manage token supply, freeze and mint authorities with ease.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-crypto-gray border-crypto-green/20">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-crypto-green/20 flex items-center justify-center mb-4">
                <span className="text-crypto-green text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Low Fees</h3>
              <p className="text-crypto-light">
                Pay just 0.05 SOL per token creation - all inclusive, no hidden costs.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
