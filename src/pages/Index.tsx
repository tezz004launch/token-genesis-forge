
import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Rocket, Star, Shield, TrendingUp, Moon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

import Header from '@/components/Header';
import TokenCreator from '@/components/TokenCreator';
import ConnectWalletPrompt from '@/components/ConnectWalletPrompt';
import Footer from '@/components/Footer';

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
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-crypto-dark z-0">
            {/* Starfield Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470813740244-df37b8c1edcb')] bg-cover bg-center opacity-20"></div>
            
            {/* Moon Image */}
            <div className="absolute top-10 right-0 md:right-10 md:top-20 w-32 h-32 md:w-72 md:h-72 rounded-full overflow-hidden animate-float">
              <img 
                src="/lovable-uploads/2d6681b2-4d62-499d-a162-8dd3bb8a6bcc.png" 
                alt="Moon" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Glowing Gradients */}
            <div className="absolute left-0 top-1/4 w-64 h-64 bg-purple-700 rounded-full filter blur-[100px] opacity-20"></div>
            <div className="absolute right-1/4 bottom-0 w-80 h-80 bg-blue-700 rounded-full filter blur-[120px] opacity-10"></div>
          </div>
          
          <div className="container mx-auto relative z-10 px-4">
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto mb-16">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white leading-tight">
                Launch your <span className="text-solana">$Solana</span> Token
                <div className="mt-2">Take it to the <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500">Moon!</span></div>
              </h1>
              
              <p className="text-xl text-crypto-light max-w-2xl mx-auto mt-6 mb-8">
                Create and deploy your Solana coin effortlessly in seconds.
                <br />Reach the world and scale without limits!
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 mt-8">
                <Link to="/tracker">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-8 py-6 text-lg h-auto hover-glow">
                    Create Token <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Phone Image */}
            <div className="mt-8 mb-16 flex justify-center">
              <div className="relative w-full max-w-xl">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 via-blue-500 to-purple-500 opacity-75 blur-sm"></div>
                <div className="relative bg-black rounded-2xl overflow-hidden">
                  <img 
                    src="/lovable-uploads/6bdafa02-b737-41b2-9f6e-c408649daa2f.png" 
                    alt="Token Wallet" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 relative bg-crypto-dark">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                The world's most powerful<br />
                <span className="infinity-gradient-text">Solana Launcher ever.</span>
              </h2>
              <p className="text-crypto-light max-w-2xl mx-auto mt-4">
                Built for speed, designed for simplicity, backed by a trusted community.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="glass-card infinity-card-hover border-purple-500/10 overflow-hidden">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-4">
                    <Rocket className="text-white h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Token Creation in Seconds</h3>
                  <p className="text-crypto-light">
                    Launch your Solana token instantly with just a few clicks—no coding, no waiting. It's that fast.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-card infinity-card-hover border-purple-500/10 overflow-hidden">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-4">
                    <Star className="text-white h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Smooth & User-Friendly Experience</h3>
                  <p className="text-crypto-light">
                    Designed for simplicity. Enjoy a smooth, intuitive interface trusted by over 2.5K users in our growing Discord community.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-card infinity-card-hover border-purple-500/10 overflow-hidden">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-4">
                    <Shield className="text-white h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Transparent and Clean Process</h3>
                  <p className="text-crypto-light">
                    Built on-chain and fully decentralized—what you launch is what you control. No hidden steps, no surprises.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Statistics/CTA Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-crypto-dark z-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470813740244-df37b8c1edcb')] bg-cover bg-center opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-crypto-dark to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Enhance Your Solana Token Experience<br />
                <span className="text-crypto-light">with Ease</span>
              </h2>
              <p className="text-crypto-light max-w-2xl mx-auto mt-4">
                Create, manage, and launch your Solana token effortlessly with secure transactions, instant deployment, and zero coding required!
              </p>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center gap-8 mt-16">
              <div className="w-full lg:w-1/2">
                <img 
                  src="/lovable-uploads/517cba17-479e-4730-b1da-0c6fb437569c.png" 
                  alt="Wallet App" 
                  className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
                />
              </div>
              
              <div className="w-full lg:w-1/2">
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="gradient-border rounded-xl rotate-2">
                    <div className="gradient-border-content p-6">
                      <h3 className="text-5xl font-bold text-white">99.9%</h3>
                      <p className="text-crypto-light">Successful Token Launches</p>
                    </div>
                  </div>
                  
                  <div className="gradient-border rounded-xl -rotate-2">
                    <div className="gradient-border-content p-6">
                      <h3 className="text-5xl font-bold text-white">85%+</h3>
                      <p className="text-crypto-light">Returned Users</p>
                    </div>
                  </div>
                </div>
                
                <div className="dark-glass p-8 rounded-xl">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Create & Deploy Your Token in Minutes
                  </h3>
                  <p className="text-crypto-light mb-6">
                    Turn your idea into reality with lightning-fast token creation. Whether for projects, communities, or innovation, deploy your Solana token in minutes - with ease, security, and built for the future!
                  </p>
                  <Link to="/tracker">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6">
                      Create Token <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
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

        {/* FAQ Section */}
        <section className="py-16 bg-crypto-dark relative">
          <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 to-transparent opacity-30"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
              <p className="text-crypto-light">
                Find quick answers to all common questions about Infinity Launch
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="dark-glass border border-gray-800 rounded-xl overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 text-white hover:no-underline hover:bg-gray-800/30">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-4 text-crypto-light">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
