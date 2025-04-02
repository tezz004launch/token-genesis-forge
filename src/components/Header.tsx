
import React from 'react';
import { Link } from 'react-router-dom';
import { Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Menu, X, UserPlus } from 'lucide-react';
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
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-white hover:text-blue-400 transition-colors px-3 py-2 rounded-full hover:bg-gray-800">
            Home
          </Link>
          <Link to="/create-token" className="text-white hover:text-blue-400 transition-colors px-3 py-2 rounded-full hover:bg-gray-800">
            Create Token
          </Link>
          <Link to="/register-wallet" className="text-white hover:text-blue-400 transition-colors px-3 py-2 rounded-full hover:bg-gray-800 flex items-center gap-1">
            <UserPlus size={16} />
            Register Wallet
          </Link>
          <a 
            href="https://raydium.io/liquidity/create-pool/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors px-3 py-2 rounded-full hover:bg-gray-800"
          >
            Liquidity Pool
          </a>
          <a 
            href="https://raydium.io/swap/?inputMint=sol&outputMint=4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors px-3 py-2 rounded-full hover:bg-gray-800"
          >
            Manage Liquidity
          </a>
          <a 
            href="https://discord.gg/r2bNMrHrh6" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors px-3 py-2 rounded-full hover:bg-gray-800"
          >
            Support
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
          <div className="md:hidden absolute top-16 left-0 right-0 bg-crypto-gray border-b border-gray-700 p-4 flex flex-col space-y-4 z-20">
            <Link 
              to="/" 
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/create-token" 
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Token
            </Link>
            <Link 
              to="/register-wallet" 
              className="text-white hover:text-blue-400 transition-colors flex items-center gap-1"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserPlus size={16} />
              Register Wallet
            </Link>
            <a 
              href="https://raydium.io/liquidity/create-pool/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Liquidity Pool
            </a>
            <a 
              href="https://raydium.io/swap/?inputMint=sol&outputMint=4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Manage Liquidity
            </a>
            <a 
              href="https://discord.gg/r2bNMrHrh6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Support
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
