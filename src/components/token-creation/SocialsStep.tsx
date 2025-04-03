
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Globe, Twitter, MessageSquare } from 'lucide-react';

interface SocialsStepProps {
  website: string;
  twitter: string;
  telegram: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const SocialsStep: React.FC<SocialsStepProps> = ({
  website,
  twitter,
  telegram,
  handleInputChange
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1 mb-4">
        <h3 className="text-lg font-medium">Social Links</h3>
        <p className="text-sm text-muted-foreground">
          Add your project's social media links (optional)
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <Label htmlFor="website" className="mb-2">Website URL</Label>
            <Input
              id="website"
              name="website"
              placeholder="https://yourmemetoken.com"
              value={website}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Twitter className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <Label htmlFor="twitter" className="mb-2">X (Twitter)</Label>
            <Input
              id="twitter"
              name="twitter"
              placeholder="https://x.com/yourmemetoken"
              value={twitter}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <Label htmlFor="telegram" className="mb-2">Telegram</Label>
            <Input
              id="telegram"
              name="telegram"
              placeholder="https://t.me/yourmemetoken"
              value={telegram}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-crypto-gray/30 p-4 rounded-md mt-4">
        <p className="text-sm text-crypto-light">
          Adding social links helps establish credibility for your meme coin and makes it easier for people to follow your project.
        </p>
      </div>
    </div>
  );
};

export default SocialsStep;
