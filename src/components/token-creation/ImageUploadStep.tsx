
import React from 'react';
import { Label } from '@/components/ui/label';
import ImageUpload from '../ImageUpload';

interface ImageUploadStepProps {
  image: File | null;
  handleImageUpload: (file: File | null) => void;
}

const ImageUploadStep: React.FC<ImageUploadStepProps> = ({ image, handleImageUpload }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Token Logo <span className="text-red-500">*</span></Label>
        <p className="text-sm text-muted-foreground">
          Upload a logo for your meme coin (PNG format recommended)
        </p>
      </div>
      
      <ImageUpload onImageUpload={handleImageUpload} currentImage={image} />
      
      <div className="bg-crypto-gray/30 p-4 rounded-md">
        <p className="text-sm text-crypto-light">
          Creative and recognizable logos are key for successful meme coins.
          For best results, use a square PNG image (1000x1000px recommended).
        </p>
      </div>
    </div>
  );
};

export default ImageUploadStep;
