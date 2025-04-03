
import React from 'react';
import { TokenCreationStep } from '@/types/steps';
import { Shield, FileEdit, CreditCard, Coins, Settings, Image, Globe, CheckCircle, User, Lock, Network } from 'lucide-react';

// Component imports would typically go here for actual step components
// For now, we'll just define the step structure

export const DefaultSteps: TokenCreationStep[] = [
  {
    id: 'connect',
    title: 'Connect Wallet',
    description: 'Connect your wallet to create a token',
    isRequired: true,
    isVisible: true,
    order: 1,
    component: () => (
      <div className="flex flex-col items-center justify-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Connect your wallet</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Connect your wallet to get started
        </p>
      </div>
    )
  },
  {
    id: 'auth',
    title: 'Authenticate',
    description: 'Verify wallet ownership',
    isRequired: true,
    isVisible: true,
    order: 2,
    component: () => (
      <div className="flex flex-col items-center justify-center">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Authenticate your wallet</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Sign a message to verify wallet ownership
        </p>
      </div>
    )
  },
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Name, symbol, and description',
    isRequired: true,
    isVisible: true,
    order: 3,
    component: () => (
      <div className="flex flex-col items-center justify-center">
        <FileEdit className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Basic Information</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your token's name, symbol, and description
        </p>
      </div>
    )
  },
  {
    id: 'token-params',
    title: 'Token Parameters',
    description: 'Supply, decimals, etc.',
    isRequired: true,
    isVisible: true,
    order: 4,
    component: () => (
      <div className="flex flex-col items-center justify-center">
        <Settings className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Token Parameters</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Configure your token's supply and decimals
        </p>
      </div>
    )
  },
  {
    id: 'socials',
    title: 'Socials',
    description: 'Website, Twitter, Telegram',
    isRequired: false,
    isVisible: true,
    order: 5,
    component: () => (
      <div className="flex flex-col items-center justify-center">
        <Globe className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Social Media</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Add your token's social media links
        </p>
      </div>
    )
  },
  {
    id: 'permissions',
    title: 'Permissions',
    description: 'Mint and freeze authorities',
    isRequired: false,
    isVisible: true,
    order: 6,
    component: () => (
      <div className="flex flex-col items-center justify-center">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Token Permissions</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Configure mint and freeze authorities
        </p>
      </div>
    )
  },
  {
    id: 'image',
    title: 'Image Upload',
    description: 'Token logo or image',
    isRequired: false,
    isVisible: true,
    order: 7,
    component: () => (
      <div className="flex flex-col items-center justify-center">
        <Image className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Image Upload</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Upload an image for your token
        </p>
      </div>
    )
  },
  {
    id: 'network',
    title: 'Network',
    description: 'Select blockchain network',
    isRequired: true,
    isVisible: true,
    order: 8,
    component: () => (
      <div className="flex flex-col items-center justify-center">
        <Network className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Network Selection</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Choose between Devnet and Mainnet
        </p>
      </div>
    )
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review token details',
    isRequired: true,
    isVisible: true,
    order: 9,
    component: () => (
      <div className="flex flex-col items-center justify-center">
        <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Review Token</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Review your token details before payment
        </p>
      </div>
    )
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Pay creation fees',
    isRequired: true,
    isVisible: true,
    order: 10,
    component: () => (
      <div className="flex flex-col items-center justify-center">
        <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Payment</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Pay blockchain fees to create your token
        </p>
      </div>
    )
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Token creation successful',
    isRequired: true,
    isVisible: true,
    order: 11,
    component: () => (
      <div className="flex flex-col items-center justify-center">
        <Coins className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Confirmation</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Your token has been created successfully
        </p>
      </div>
    )
  }
];
