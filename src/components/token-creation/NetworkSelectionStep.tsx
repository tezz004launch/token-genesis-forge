
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface NetworkSelectionStepProps {
  selectedNetwork: 'devnet' | 'mainnet-beta';
  setSelectedNetwork: (network: 'devnet' | 'mainnet-beta') => void;
}

const NetworkSelectionStep: React.FC<NetworkSelectionStepProps> = ({ 
  selectedNetwork, 
  setSelectedNetwork 
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Network Selection</h3>
        <p className="text-sm text-muted-foreground">
          Choose the network where you want to create your token
        </p>
      </div>
      
      <div className="space-y-6">
        <div 
          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
            selectedNetwork === 'devnet' 
              ? 'bg-purple-900/20 border-purple-500/50' 
              : 'bg-crypto-gray/30 border-gray-700 hover:border-gray-600'
          }`}
          onClick={() => setSelectedNetwork('devnet')}
        >
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${
              selectedNetwork === 'devnet' ? 'bg-purple-500' : 'bg-gray-600'
            }`}></div>
            <h4 className="font-medium">Devnet</h4>
          </div>
          <p className="pl-7 mt-2 text-sm text-crypto-light">
            Solana's test network. Tokens created here have no real value.
            Perfect for testing and development.
          </p>
        </div>
        
        <div 
          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
            selectedNetwork === 'mainnet-beta' 
              ? 'bg-green-900/20 border-green-500/50' 
              : 'bg-crypto-gray/30 border-gray-700 hover:border-gray-600'
          }`}
          onClick={() => setSelectedNetwork('mainnet-beta')}
        >
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${
              selectedNetwork === 'mainnet-beta' ? 'bg-green-500' : 'bg-gray-600'
            }`}></div>
            <h4 className="font-medium">Mainnet</h4>
          </div>
          <p className="pl-7 mt-2 text-sm text-crypto-light">
            Solana's production network. Tokens created here can have real value.
            Use this for actual token launches.
          </p>
        </div>
      </div>
      
      {selectedNetwork === 'mainnet-beta' && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-yellow-500 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium">Important: Mainnet Transaction</h4>
              <p className="text-sm">
                You're about to create a token on Solana's mainnet. This will use 
                real SOL from your wallet and cannot be reversed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSelectionStep;
