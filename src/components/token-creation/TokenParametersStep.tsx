
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface TokenParametersStepProps {
  supply: number;
  decimals: number;
  errors: {
    supply: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleDecimalsChange: (vals: number[]) => void;
}

const TokenParametersStep: React.FC<TokenParametersStepProps> = ({
  supply,
  decimals,
  errors,
  handleInputChange,
  handleDecimalsChange
}) => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="supply">Total Supply <span className="text-red-500">*</span></Label>
            <p className="text-sm text-muted-foreground">
              How many tokens will exist in total
            </p>
          </div>
          <div className="w-1/3">
            <Input
              id="supply"
              name="supply"
              type="number"
              min="1"
              value={supply}
              onChange={handleInputChange}
              className={errors.supply ? "border-red-500" : ""}
            />
            {errors.supply && <p className="text-red-500 text-sm">{errors.supply}</p>}
          </div>
        </div>
        
        <div className="bg-crypto-gray/30 p-4 rounded-md">
          <p className="text-sm text-crypto-light">
            Popular meme coins often have large supplies (billions or trillions). All tokens will initially be sent to your connected wallet.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Decimals <span className="text-red-500">*</span></Label>
            <p className="text-sm text-muted-foreground">
              How divisible your token will be (like cents in a dollar)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{decimals}</span>
          </div>
        </div>
        
        <Slider
          value={[decimals]}
          min={0}
          max={9}
          step={1}
          onValueChange={handleDecimalsChange}
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 (No decimals)</span>
          <span>9 (Max divisibility)</span>
        </div>
        
        <div className="bg-crypto-gray/30 p-4 rounded-md">
          <p className="text-sm text-crypto-light">
            Most meme coins use 9 decimals (like SOL). SHIB uses 8, DOGE uses 8.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenParametersStep;
