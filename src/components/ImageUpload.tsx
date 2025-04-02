
import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File | null) => void;
  currentImage: File | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUpload,
  currentImage
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImage ? URL.createObjectURL(currentImage) : null
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Please upload an image file (PNG, JPG)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB');
      return;
    }
    
    // Create preview URL and set file
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(URL.createObjectURL(file));
    onImageUpload(file);
  }, [previewUrl, onImageUpload]);

  const handleRemoveImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onImageUpload(null);
  }, [previewUrl, onImageUpload]);

  return (
    <div className="space-y-4">
      {!previewUrl ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors ${
            dragActive ? 'border-solana bg-solana/10' : 'border-gray-700 hover:border-solana/50'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{ backgroundColor: '#14151a' }}
        >
          <div className="mb-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <p className="text-base text-white mb-2">
            Drag and drop here to upload
          </p>
          <p className="text-sm text-muted-foreground mb-4">.png, .jpg 1000x1000 px</p>
          
          <input
            id="image-upload"
            type="file"
            className="hidden"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
          />
          <label htmlFor="image-upload">
            <Button variant="outline" className="hover:bg-solana/10 hover:text-solana" asChild>
              <span>Browse Files</span>
            </Button>
          </label>
        </div>
      ) : (
        <div className="border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">Logo Preview</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-white"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-crypto-dark border border-gray-700">
              <img
                src={previewUrl}
                alt="Token Logo Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {currentImage?.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
