
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Shield, Globe, Twitter, MessageSquare } from 'lucide-react';
import { TokenForm } from '@/types/token';

interface ReviewStepProps {
  form: TokenForm;
  selectedNetwork: 'devnet' | 'mainnet-beta';
  securityLevel: 'low' | 'medium' | 'high';
}

const ReviewStep: React.FC<ReviewStepProps> = ({ form, selectedNetwork, securityLevel }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Review Your Meme Coin</h3>
        <p className="text-sm text-muted-foreground">
          Please verify all details before proceeding to payment
        </p>
      </div>
      
      <Alert className="bg-green-900/20 border-green-500/20">
        <Shield className="h-4 w-4 text-green-500" />
        <AlertTitle>Authenticated Creation</AlertTitle>
        <AlertDescription>
          Your wallet has been authenticated, ensuring only you can create this token.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Name</p>
          <p className="text-base">{form.name}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Symbol</p>
          <p className="text-base">{form.symbol}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Supply</p>
          <p className="text-base">{form.supply.toLocaleString()}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Decimals</p>
          <p className="text-base">{form.decimals}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Network</p>
          <p className="text-base flex items-center gap-2">
            {selectedNetwork === 'mainnet-beta' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Mainnet</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Devnet</span>
              </>
            )}
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Security</p>
          <div className="flex items-center gap-2">
            {securityLevel === 'low' && (
              <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs font-medium">Low</span>
            )}
            {securityLevel === 'medium' && (
              <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs font-medium">Medium</span>
            )}
            {securityLevel === 'high' && (
              <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium">High</span>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Authorities Revoked</p>
          <p className="text-base">
            {[
              form.revokeMintAuthority ? "Mint" : "",
              form.revokeFreezeAuthority ? "Freeze" : "",
              form.immutableMetadata ? "Metadata" : ""
            ].filter(Boolean).join(", ") || "None"}
          </p>
        </div>
        
        {form.description && (
          <div className="space-y-2 col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-base">{form.description}</p>
          </div>
        )}
        
        <div className="space-y-2 col-span-2">
          <p className="text-sm font-medium text-muted-foreground">Social Links</p>
          <div className="space-y-2">
            {form.website && (
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-muted-foreground" />
                <a href={form.website} target="_blank" rel="noopener noreferrer" className="text-solana hover:underline">
                  {form.website}
                </a>
              </div>
            )}
            
            {form.twitter && (
              <div className="flex items-center gap-2">
                <Twitter size={14} className="text-muted-foreground" />
                <a href={form.twitter} target="_blank" rel="noopener noreferrer" className="text-solana hover:underline">
                  {form.twitter}
                </a>
              </div>
            )}
            
            {form.telegram && (
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-muted-foreground" />
                <a href={form.telegram} target="_blank" rel="noopener noreferrer" className="text-solana hover:underline">
                  {form.telegram}
                </a>
              </div>
            )}
            
            {!form.website && !form.twitter && !form.telegram && (
              <p className="text-muted-foreground text-sm">No social links provided</p>
            )}
          </div>
        </div>
        
        {form.image && (
          <div className="space-y-2 col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Token Logo</p>
            <img 
              src={URL.createObjectURL(form.image)} 
              alt="Token Logo" 
              className="w-16 h-16 rounded-full object-cover border border-gray-700" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewStep;
