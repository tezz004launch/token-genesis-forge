
import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Rocket, Star, Shield, TrendingUp, ArrowRight, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import Header from '@/components/Header';
import TokenCreator from '@/components/TokenCreator';
import ConnectWalletPrompt from '@/components/ConnectWalletPrompt';
import Footer from '@/components/Footer';
import HeroSection from '@/components/homepage/HeroSection';
import FeaturesSection from '@/components/homepage/FeaturesSection';
import StatisticsSection from '@/components/homepage/StatisticsSection';
import FaqSection from '@/components/homepage/FaqSection';

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

  const faqs = [
    {
      question: "What is Infinity Launch?",
      answer: "Infinity Launch is a powerful platform for creating and launching your own SPL tokens on the Solana blockchain without any coding knowledge required. Our platform simplifies the token creation process, making it accessible to everyone."
    },
    {
      question: "How can I create a token on the Solana blockchain?",
      answer: "Simply connect your wallet, fill in your token details like name, symbol, supply and decimals, then click create. Our platform handles all the technical aspects of deploying your token to the Solana blockchain."
    },
    {
      question: "How can I manage token authorities on Solana?",
      answer: "During token creation, you can configure various authority settings including mint authority, freeze authority, and more. These settings determine who can perform actions like minting new tokens or freezing accounts."
    },
    {
      question: "What support resources are available if I encounter issues?",
      answer: "We provide support through our Discord community where our team and other users can help with any questions or issues you may encounter. Visit our Discord at https://discord.gg/r2bNMrHrh6."
    },
    {
      question: "Do I need any programming skills to launch a token on your platform?",
      answer: "No programming skills required! Our platform is designed to be user-friendly and accessible to everyone, regardless of technical background."
    },
    {
      question: "How can I confirm that my token launch was successful?",
      answer: "After launching your token, we provide transaction confirmation and details about your new token including the token address which you can verify on Solana Explorer."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <StatisticsSection />
        
        {/* Connect Wallet Section */}
        {!publicKey && (
          <section className="py-16 bg-crypto-dark/80 backdrop-blur-md">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <ConnectWalletPrompt />
              </div>
            </div>
          </section>
        )}
        
        {/* Add a CTA section before FAQs for logged in users */}
        {publicKey && (
          <section className="py-16 bg-crypto-dark/80 backdrop-blur-md">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Create Your Token?</h2>
              <p className="text-xl text-crypto-light mb-8 max-w-2xl mx-auto">
                Your wallet is connected. You can now create your Solana token with just a few clicks.
              </p>
              <Link to="/create-token">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-6 text-lg h-auto font-medium">
                  Create Your Token Now <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </section>
        )}
        
        <FaqSection faqs={faqs} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
