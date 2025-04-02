
import React from 'react';
import Header from '@/components/Header';
import TokenCreator from '@/components/TokenCreator';
import Footer from '@/components/Footer';
import { useWallet } from '@solana/wallet-adapter-react';
import ConnectWalletPrompt from '@/components/ConnectWalletPrompt';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Infinity, Rocket, ShieldCheck } from 'lucide-react';

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
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 p-0.5 animate-pulse-glow flex items-center justify-center">
              <Infinity className="text-white h-10 w-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400 mb-4">
            Infinity Launch
          </h1>
          <p className="text-xl text-crypto-light max-w-3xl mx-auto">
            Launch your own SPL token on Solana in minutes. Secure, authenticated, and infinitely scalable.
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
          <Card className="bg-crypto-gray/30 border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <ShieldCheck className="text-purple-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Authenticated</h3>
              <p className="text-crypto-light">
                Verified wallet authentication ensures only you can control your tokens.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-crypto-gray/30 border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                <Infinity className="text-blue-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Infinite Potential</h3>
              <p className="text-crypto-light">
                Create tokens with flexible supply and authority controls tailored to your needs.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-crypto-gray/30 border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                <Rocket className="text-cyan-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Launch Fast</h3>
              <p className="text-crypto-light">
                Go from concept to launch in under 2 minutes with our streamlined process.
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
