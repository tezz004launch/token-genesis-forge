
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, WifiOff, Zap, Clock } from 'lucide-react';

interface ConnectionStatusProps {
  connectionState: 'connected' | 'unstable' | 'failed';
  switchRpcEndpoint: () => void;
  currentRpcIndex: number;
  totalEndpoints: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionState,
  switchRpcEndpoint,
  currentRpcIndex,
  totalEndpoints
}) => {
  if (connectionState === 'connected') {
    return null;
  }
  
  if (connectionState === 'unstable') {
    return (
      <Alert className="bg-amber-900/20 border-amber-500/30 mb-4">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <AlertTitle>Unstable Connection</AlertTitle>
        <AlertDescription>
          <p className="mb-2">Your connection to the Solana network is unstable. You might be experiencing rate limiting from the RPC provider.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={switchRpcEndpoint}
              className="text-xs border-amber-500/30 hover:bg-amber-500/10"
            >
              <Zap className="h-3 w-3 mr-1" />
              Try Different RPC
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-xs border-amber-500/30 hover:bg-amber-500/10"
            >
              <Clock className="h-3 w-3 mr-1" />
              Wait & Reload
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="bg-red-900/20 border-red-500/30 mb-4">
      <WifiOff className="h-4 w-4 text-red-400" />
      <AlertTitle>Connection Failed</AlertTitle>
      <AlertDescription>
        <p className="mb-2">We're having trouble connecting to the Solana network. This might be due to RPC rate limiting or network issues.</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={switchRpcEndpoint}
            className="text-xs border-red-500/30 hover:bg-red-500/10"
          >
            <Zap className="h-3 w-3 mr-1" />
            Try Different RPC ({currentRpcIndex + 1}/{totalEndpoints})
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="text-xs border-red-500/30 hover:bg-red-500/10"
          >
            <Clock className="h-3 w-3 mr-1" />
            Wait & Reload
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;
