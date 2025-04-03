
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertTriangle } from 'lucide-react';

interface PermissionsStepProps {
  revokeMintAuthority: boolean;
  revokeFreezeAuthority: boolean;
  immutableMetadata: boolean;
  securityLevel: 'low' | 'medium' | 'high';
  handleCheckboxChange: (checked: boolean, name: string) => void;
}

const PermissionsStep: React.FC<PermissionsStepProps> = ({
  revokeMintAuthority,
  revokeFreezeAuthority,
  immutableMetadata,
  securityLevel,
  handleCheckboxChange
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">Revoke Authorities</h3>
        <p className="text-sm text-muted-foreground">
          Tokens are created with several authorities by default. It is recommended to revoke all these authorities to gain more trust from investors.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span>Security Level:</span>
        <div className="flex items-center gap-2">
          {securityLevel === 'low' && (
            <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs font-medium flex items-center gap-1">
              <AlertTriangle size={12} /> Low
            </span>
          )}
          {securityLevel === 'medium' && (
            <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs font-medium flex items-center gap-1">
              <Shield size={12} /> Medium
            </span>
          )}
          {securityLevel === 'high' && (
            <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium flex items-center gap-1">
              <Shield size={12} /> High
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-4 pt-2">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="revokeFreezeAuthority"
            checked={revokeFreezeAuthority}
            onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'revokeFreezeAuthority')}
          />
          <div className="space-y-1">
            <Label
              htmlFor="revokeFreezeAuthority"
              className="text-base font-medium cursor-pointer"
            >
              Revoke Freeze Authority
            </Label>
            <p className="text-sm text-muted-foreground">
              Removes the ability to freeze token accounts.
              Recommended for decentralized tokens and DeFi compatibility.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <Checkbox
            id="revokeMintAuthority"
            checked={revokeMintAuthority}
            onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'revokeMintAuthority')}
          />
          <div className="space-y-1">
            <Label
              htmlFor="revokeMintAuthority"
              className="text-base font-medium cursor-pointer"
            >
              Revoke Mint Authority
            </Label>
            <p className="text-sm text-muted-foreground">
              Permanently gives up the ability to create more tokens in the future.
              This makes your token supply fixed and unchangeable.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <Checkbox
            id="immutableMetadata"
            checked={immutableMetadata}
            onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'immutableMetadata')}
          />
          <div className="space-y-1">
            <Label
              htmlFor="immutableMetadata"
              className="text-base font-medium cursor-pointer"
            >
              Immutable Metadata
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable to make metadata immutable to get more trust.
              If active, the metadata becomes immutable and cannot be changed.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-md mt-4">
        <p className="text-sm text-amber-200/70">
          <strong>Important:</strong> These options are completely free without additional fees! Revoking authorities is permanent and cannot be undone.
          Make your decision carefully.
        </p>
      </div>
    </div>
  );
};

export default PermissionsStep;
