
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import CustomWalletModal from './CustomWalletModal';

const CustomWalletButton: React.FC = () => {
  const { connected, publicKey, disconnecting, disconnect, connecting } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const handleDisconnect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    disconnect();
  };

  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (connecting) {
    return (
      <Button disabled className="bg-solana hover:bg-solana-dark">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          className="border-solana/30 text-white hover:bg-solana/20"
        >
          <Wallet className="mr-2 h-4 w-4 text-solana" />
          {formatWalletAddress(publicKey.toBase58())}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={handleDisconnect}
          disabled={disconnecting}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setIsWalletModalOpen(true)}
        className="bg-gradient-to-r from-solana to-crypto-blue hover:opacity-90 transition-opacity"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
      <CustomWalletModal isOpen={isWalletModalOpen} setIsOpen={setIsWalletModalOpen} />
    </>
  );
};

export default CustomWalletButton;
