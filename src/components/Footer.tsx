
import React from 'react';
import { Link } from 'react-router-dom';
import { Infinity, Github, Twitter, MessageSquare } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-gray-800 bg-crypto-dark py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 p-0.5">
                <div className="w-full h-full bg-crypto-dark rounded-full flex items-center justify-center">
                  <Infinity className="text-white h-4 w-4" />
                </div>
              </div>
              <span className="text-lg font-bold infinity-gradient-text">Infinity Launch</span>
            </Link>
            <p className="text-crypto-light text-sm">
              The easiest way to create and launch your own SPL token on the Solana blockchain.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-crypto-light hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/" className="text-crypto-light hover:text-white transition-colors text-sm">
                  Create Token
                </Link>
              </li>
              <li>
                <a 
                  href="https://raydium.io/liquidity/create-pool/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-crypto-light hover:text-white transition-colors text-sm"
                >
                  Liquidity Pool
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Ecosystem</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://raydium.io/swap/?inputMint=sol&outputMint=4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-crypto-light hover:text-white transition-colors text-sm"
                >
                  Manage Liquidity
                </a>
              </li>
              <li>
                <a 
                  href="https://solana.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-crypto-light hover:text-white transition-colors text-sm"
                >
                  Solana
                </a>
              </li>
              <li>
                <a 
                  href="https://spl.solana.com/token" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-crypto-light hover:text-white transition-colors text-sm"
                >
                  SPL Token Program
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://discord.gg/r2bNMrHrh6" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-crypto-light hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <MessageSquare size={16} />
                  Discord Community
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-crypto-light hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <Twitter size={16} />
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-crypto-light hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <Github size={16} />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-crypto-light text-sm">
            © {currentYear} Infinity Launch. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 text-crypto-light text-xs">
            <span>Powered by <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-solana hover:text-solana-light">Solana Blockchain</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
