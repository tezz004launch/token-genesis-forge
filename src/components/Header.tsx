
import React from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Menu, X, Infinity } from 'lucide-react';
import AuthWallet from './AuthWallet';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="py-4 px-6 border-b border-gray-800 bg-crypto-dark/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 p-0.5 animate-pulse-glow">
            <div className="w-full h-full bg-crypto-dark rounded-full flex items-center justify-center">
              <Infinity className="text-white h-6 w-6" />
            </div>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400">
            Infinity Launch
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-white hover:text-blue-400 transition-colors">
            Home
          </Link>
          <Link to="/tracker" className="text-white hover:text-blue-400 transition-colors">
            Token Tracker
          </Link>
          <a 
            href="https://solscan.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors"
          >
            Explorer
          </a>
        </nav>

        {/* Wallet Button - Desktop */}
        <div className="hidden md:block">
          <AuthWallet />
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
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/tracker" 
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Token Tracker
            </Link>
            <a 
              href="https://solscan.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Explorer
            </a>
            <div className="py-2">
              <AuthWallet />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
