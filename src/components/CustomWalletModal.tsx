
import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomWalletModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CustomWalletModal: React.FC<CustomWalletModalProps> = ({ isOpen, setIsOpen }) => {
  const { wallets, select } = useWallet();

  const handleWalletSelect = (walletName: WalletName) => {
    select(walletName);
    setIsOpen(false);
  };

  // Filter for installed and loadable wallets
  const readyWallets = wallets.filter(
    wallet => wallet.readyState === WalletReadyState.Installed || 
              wallet.readyState === WalletReadyState.Loadable
  );
  
  // Additional wallets that might need installation
  const otherWallets = wallets.filter(
    wallet => wallet.readyState !== WalletReadyState.Installed && 
              wallet.readyState !== WalletReadyState.Loadable
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-crypto-dark border border-gray-800 text-white max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Connect a wallet</DialogTitle>
          <Button 
            variant="ghost" 
            className="absolute right-4 top-4 p-1" 
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5 text-gray-400" />
          </Button>
        </DialogHeader>
        
        <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {readyWallets.map((wallet) => (
            <button
              key={wallet.adapter.name}
              onClick={() => handleWalletSelect(wallet.adapter.name)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-crypto-gray hover:bg-crypto-gray/70 transition-colors border border-gray-700"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 mr-3">
                  {wallet.adapter.icon && (
                    <img src={wallet.adapter.icon} alt={`${wallet.adapter.name} icon`} />
                  )}
                </div>
                <span>{wallet.adapter.name}</span>
              </div>
              <span className="text-xs bg-solana/20 text-solana py-1 px-2 rounded-full">
                {wallet.readyState === WalletReadyState.Installed ? 'Detected' : 'Available'}
              </span>
            </button>
          ))}
          
          {otherWallets.length > 0 && (
            <>
              <div className="my-4 border-t border-gray-800 pt-4">
                <h3 className="text-sm text-gray-400 mb-3">More options</h3>
                
                {otherWallets.map((wallet) => (
                  <button
                    key={wallet.adapter.name}
                    onClick={() => handleWalletSelect(wallet.adapter.name)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-crypto-gray/50 hover:bg-crypto-gray/70 transition-colors border border-gray-700 mb-2"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-3">
                        {wallet.adapter.icon && (
                          <img src={wallet.adapter.icon} alt={`${wallet.adapter.name} icon`} />
                        )}
                      </div>
                      <span>{wallet.adapter.name}</span>
                    </div>
                    <span className="text-xs bg-gray-800 text-gray-300 py-1 px-2 rounded-full">
                      Install
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-400"
                >
                  Less options
                </Button>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-400">
          By connecting a wallet, you agree to the Terms of Service and consent to the Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomWalletModal;
