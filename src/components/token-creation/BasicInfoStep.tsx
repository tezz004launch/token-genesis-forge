
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BasicInfoStepProps {
  name: string;
  symbol: string;
  description: string;
  errors: {
    name: string;
    symbol: string;
    supply: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  name,
  symbol,
  description,
  errors,
  handleInputChange
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Token Name <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          name="name"
          placeholder="My Meme Token"
          value={name}
          onChange={handleInputChange}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="symbol">Token Symbol <span className="text-red-500">*</span></Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Max 8 characters. Common format is all caps (e.g., "PEPE", "DOGE").</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="symbol"
          name="symbol"
          placeholder="MEME"
          maxLength={8}
          value={symbol}
          onChange={handleInputChange}
          className={errors.symbol ? "border-red-500" : ""}
        />
        {errors.symbol && <p className="text-red-500 text-sm">{errors.symbol}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Token Description <span className="text-gray-500">(optional)</span></Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe your meme coin's purpose and story..."
          value={description}
          onChange={handleInputChange}
          rows={4}
        />
      </div>
    </div>
  );
};

export default BasicInfoStep;
