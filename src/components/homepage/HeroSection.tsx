
import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Phone3D from './Phone3D';

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-crypto-dark z-0">
        {/* Abstract background shapes */}
        <div className="absolute w-full h-full overflow-hidden">
          <div className="absolute top-0 -left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-0 -right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-10 left-20 w-72 h-72 bg-crypto-green rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Star particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array(20).fill(0).map((_, i) => (
            <div key={i} className={`star star-${i+1}`}></div>
          ))}
        </div>
      </div>
      
      <div className="container mx-auto relative z-10 px-4">
        <div className="flex flex-col md:flex-row items-center text-center md:text-left">
          <div className="flex flex-col md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-sm mb-6 mx-auto md:mx-0">
              <Rocket size={14} className="text-purple-400" />
              <span className="text-purple-200">Powered by Solana</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Launch Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400">Solana Token</span> 
              <br className="hidden lg:block" /> Within Minutes
            </h1>
            
            <p className="text-xl text-crypto-light max-w-2xl mb-8 leading-relaxed">
              Create, deploy, and manage your custom SPL token with zero coding knowledge.
              Built for creators, communities, and businesses.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12 md:mb-0">
              <Link to="/tracker">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-6 text-lg h-auto font-medium w-full sm:w-auto">
                  Create Your Token <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <a href="https://discord.gg/r2bNMrHrh6" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="border-purple-500/20 text-white hover:bg-purple-500/10 py-6 text-lg h-auto font-medium w-full sm:w-auto">
                  Join Community
                </Button>
              </a>
            </div>
          </div>
          
          {/* 3D Phone Component with transparent background */}
          <div className="md:w-1/2 mt-8 md:mt-0 bg-transparent">
            <Suspense fallback={
              <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center bg-transparent rounded-lg">
                <div className="text-white text-center">
                  <div className="mb-2 text-crypto-purple animate-pulse">Loading 3D model...</div>
                  <div className="text-sm text-crypto-light/70">This may take a moment</div>
                </div>
              </div>
            }>
              <Phone3D />
            </Suspense>
          </div>
        </div>
        
        {/* Trusted by section */}
        <div className="mt-20 text-center">
          <p className="text-crypto-light text-sm uppercase tracking-wider mb-6">Trusted by builders across the Solana ecosystem</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
            <div className="w-32 h-12 flex items-center justify-center">
              <svg className="w-full h-auto" viewBox="0 0 289 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M52.5 0L98.1 64H7L52.5 0Z" fill="url(#paint0_linear)"/>
                <path d="M111.6 42.8C111.6 34.7 118 28.1 126.5 28.1C134.9 28.1 141.3 34.7 141.3 42.8C141.3 50.9 135 57.4 126.5 57.4C118.1 57.4 111.6 50.9 111.6 42.8ZM136.8 42.8C136.8 37 132.2 32.2 126.5 32.2C120.9 32.2 116.2 37 116.2 42.8C116.2 48.6 120.8 53.4 126.5 53.4C132.1 53.4 136.8 48.6 136.8 42.8Z" fill="white"/>
                <path d="M144.6 28.5H149.3V30.8C150.7 29 152.7 28.1 155.6 28.1C161.1 28.1 166 32.8 166 40.3C166 47.7 161.1 52.9 155 52.9C152.7 52.9 150.7 52.1 149.2 50.5V61.7H144.6V28.5ZM161.4 40.3C161.4 35.9 158.9 32.5 155.1 32.5C152 32.5 149.3 35.1 149.3 40.3C149.3 45.3 152 48.6 155.3 48.6C158.7 48.5 161.4 45.1 161.4 40.3Z" fill="white"/>
                <path d="M168.1 24.9L172.7 23.8V28.5H177.2V32.9H172.7V44C172.7 46.9 173.9 48 175.8 48C176.3 48 176.9 47.9 177.2 47.7V52C176.7 52.3 175.5 52.5 174.2 52.5C170.4 52.5 168.2 50.2 168.2 45.8V32.9H165.5V28.5H168.2V24.9H168.1Z" fill="white"/>
                <path d="M181.6 40.3C181.6 32.8 186.9 28.1 193.1 28.1C199.7 28.1 204.3 32.5 204.3 40.9V42.3H186.2C186.4 46.7 189.3 49.2 193 49.2C195.8 49.2 198 47.7 198.7 45.2L203.9 45.8C202.8 50.7 198.5 53.4 192.9 53.4C186.2 53 181.6 48.2 181.6 40.3ZM199.7 38.7C199.5 35 196.9 32.1 193.1 32.1C189.3 32.1 186.7 34.9 186.2 38.7H199.7Z" fill="white"/>
                <path d="M208.5 28.5H213.2V31.7C214.5 29.5 217 28 220.1 28C220.7 28 221.2 28 221.6 28.2V32.9C221.1 32.7 220.3 32.6 219.5 32.6C216.1 32.6 213.2 35.3 213.2 39.9V52.4H208.6V28.5H208.5Z" fill="white"/>
                <path d="M222.7 40.3C222.7 32.8 228.1 28.1 234.3 28.1C240.9 28.1 245.5 32.5 245.5 40.9V42.3H227.4C227.6 46.7 230.5 49.2 234.2 49.2C237 49.2 239.2 47.7 239.9 45.2L245.1 45.8C244 50.7 239.7 53.4 234.1 53.4C227.4 53 222.7 48.2 222.7 40.3ZM240.9 38.7C240.7 35 238.1 32.1 234.3 32.1C230.5 32.1 227.9 34.9 227.4 38.7H240.9Z" fill="white"/>
                <path d="M288.5 40.3C288.5 48.3 283.8 53.4 277.5 53.4C274.8 53.4 272.8 52.5 271.5 50.9V52.5H266.8V19.4L271.5 18.3V31C272.9 29.2 274.9 28.1 277.5 28.1C283.9 28.1 288.5 33.3 288.5 40.3ZM283.9 40.3C283.9 35.5 281.1 32.6 277.5 32.6C273.9 32.6 271.4 35.7 271.4 40.3C271.4 45 273.9 48.9 277.5 48.9C281.1 48.9 283.9 45.1 283.9 40.3Z" fill="white"/>
                <defs>
                <linearGradient id="paint0_linear" x1="52.5462" y1="-7.63453" x2="52.5462" y2="80.2531" gradientUnits="userSpaceOnUse">
                <stop offset="0.08" stopColor="#9945FF"/>
                <stop offset="0.3" stopColor="#8752F3"/>
                <stop offset="0.5" stopColor="#5497D5"/>
                <stop offset="0.6" stopColor="#43B4CA"/>
                <stop offset="0.72" stopColor="#28E0B9"/>
                <stop offset="0.97" stopColor="#19FB9B"/>
                </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="w-32 h-12 flex items-center justify-center">
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Raydium</div>
            </div>
            <div className="w-32 h-12 flex items-center justify-center">
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">Orca</div>
            </div>
            <div className="w-32 h-12 flex items-center justify-center">
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">Mango</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
