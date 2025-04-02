
import React from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="py-4 px-6 border-b border-gray-800 bg-crypto-dark/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-solana-gradient p-0.5 animate-pulse-glow">
            <div className="w-full h-full bg-crypto-dark rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">TF</span>
            </div>
          </div>
          <span className="text-xl font-bold text-white">TokenForge</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-white hover:text-solana transition-colors">
            Home
          </Link>
          <Link to="/tracker" className="text-white hover:text-solana transition-colors">
            Token Tracker
          </Link>
          <a 
            href="https://solscan.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-solana transition-colors"
          >
            Explorer
          </a>
        </nav>

        {/* Wallet Button - Desktop */}
        <div className="hidden md:block">
          <WalletMultiButton className="!bg-gradient-to-r from-solana to-crypto-blue hover:opacity-90 transition-opacity" />
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-crypto-gray border-b border-gray-700 p-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-white hover:text-solana transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/tracker" 
              className="text-white hover:text-solana transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Token Tracker
            </Link>
            <a 
              href="https://solscan.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-solana transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Explorer
            </a>
            <div className="py-2">
              <WalletMultiButton className="!bg-gradient-to-r from-solana to-crypto-blue hover:opacity-90 transition-opacity w-full" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
