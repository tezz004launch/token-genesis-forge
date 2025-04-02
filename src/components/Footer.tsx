
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-gray-800 bg-crypto-dark py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-solana-gradient p-0.5">
                <div className="w-full h-full bg-crypto-dark rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">TF</span>
                </div>
              </div>
              <span className="text-lg font-bold text-white">TokenForge</span>
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
                <Link to="/tracker" className="text-crypto-light hover:text-white transition-colors text-sm">
                  Token Tracker
                </Link>
              </li>
              <li>
                <a 
                  href="https://solscan.io" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-crypto-light hover:text-white transition-colors text-sm"
                >
                  Solana Explorer
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
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
              <li>
                <a 
                  href="https://phantom.app" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-crypto-light hover:text-white transition-colors text-sm"
                >
                  Phantom Wallet
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-crypto-light text-sm">
            © {currentYear} Token Genesis Forge. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 text-crypto-light text-xs">
            <span>Powered by <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-solana">Solana Blockchain</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
