
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Rocket, Star, Shield, TrendingUp, CheckCircle, Users } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Rocket />,
      title: "Launch in Minutes",
      description: "Deploy your token with just a few clicks—no coding required. Go from concept to launch in record time."
    },
    {
      icon: <Shield />,
      title: "Secure & Trustworthy",
      description: "Built on Solana with industry-standard security practices to protect your tokens and transactions."
    },
    {
      icon: <Users />,
      title: "Community Backed",
      description: "Join thousands of creators who have already launched successful tokens using our platform."
    },
    {
      icon: <CheckCircle />,
      title: "Easy to Use",
      description: "Simplified interface designed for everyone from beginners to experts in the crypto space."
    },
    {
      icon: <Star />,
      title: "Full Authority Control",
      description: "Maintain complete control over mint, freeze, and other token authorities as needed."
    },
    {
      icon: <TrendingUp />,
      title: "Ready for Growth",
      description: "Seamlessly link to liquidity pools and trading platforms to grow your token ecosystem."
    }
  ];

  return (
    <section className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-crypto-dark z-0">
        {/* Gradient effects */}
        <div className="absolute left-0 top-0 w-full h-1/3 bg-gradient-to-b from-purple-900/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-crypto-dark to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">
            Everything You Need to <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400">
              Launch Your Token
            </span>
          </h2>
          <p className="text-crypto-light max-w-3xl mx-auto mt-6">
            Our platform provides a complete solution for creating, launching, and managing your Solana token, 
            designed with both simplicity and power in mind.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-gradient-to-br from-crypto-dark to-crypto-dark/80 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-6 text-purple-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-crypto-light">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
