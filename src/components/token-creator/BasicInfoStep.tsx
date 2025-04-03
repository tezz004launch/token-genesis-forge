
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TokenForm } from '@/types/token';

interface BasicInfoStepProps {
  form: TokenForm;
  errors: {
    name: string;
    symbol: string;
    supply: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  form,
  errors,
  handleInputChange
}) => {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Token Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={handleInputChange}
          placeholder="My Awesome Token"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="symbol" className="text-sm font-medium">
          Token Symbol <span className="text-red-500">*</span>
        </Label>
        <Input
          id="symbol"
          name="symbol"
          value={form.symbol}
          onChange={handleInputChange}
          placeholder="TOKEN"
          className={errors.symbol ? "border-red-500" : ""}
        />
        {errors.symbol && <p className="text-xs text-red-500">{errors.symbol}</p>}
        <p className="text-xs text-muted-foreground">
          Symbol must be 8 characters or less (e.g. BTC, SHIB, DOGE)
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleInputChange}
          placeholder="Describe your token"
          rows={3}
        />
      </div>
    </div>
  );
};

export default BasicInfoStep;
