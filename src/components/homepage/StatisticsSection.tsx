
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StatisticsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-crypto-dark z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470813740244-df37b8c1edcb')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-crypto-dark via-crypto-dark/90 to-crypto-dark/70"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight text-center">
            Built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400">Creators</span>,
            <br /> Trusted by <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400">Communities</span>
          </h2>
          
          <p className="text-lg text-crypto-light mb-12 max-w-2xl text-center">
            From individual creators to large communities, we've helped thousands launch their tokens on Solana 
            with our streamlined platform that takes the complexity out of the process.
          </p>
          
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/10 p-6 rounded-xl">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">99.8%</div>
              <p className="text-crypto-light text-sm">Launch Success Rate</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/10 p-6 rounded-xl">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">9,500+</div>
              <p className="text-crypto-light text-sm">Tokens Created</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/10 p-6 rounded-xl">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">5,000+</div>
              <p className="text-crypto-light text-sm">Active Communities</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/10 p-6 rounded-xl">
              <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">2.5K+</div>
              <p className="text-crypto-light text-sm">Discord Members</p>
            </div>
          </div>
          
          <Link to="/tracker">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-6 text-lg h-auto w-full sm:w-auto">
              Start Creating Now <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
