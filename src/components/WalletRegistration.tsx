
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Send, AlertCircle, Check } from 'lucide-react';
import { sendWalletNotification } from '@/lib/services/discordWebhookService';

interface WalletRegistrationProps {
  onComplete?: () => void;
}

const WalletRegistration: React.FC<WalletRegistrationProps> = ({ onComplete }) => {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  
  const [userIdentifier, setUserIdentifier] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Handle the registration submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (!userIdentifier.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a unique identifier.",
        variant: "destructive"
      });
      return;
    }
    
    if (!agreed) {
      toast({
        title: "Agreement Required",
        description: "Please confirm your agreement to share this information.",
        variant: "destructive"
      });
      return;
    }
    
    // Start submission
    setSubmitting(true);
    
    try {
      // Prepare data for the webhook
      const notificationData = {
        publicAddress: publicKey.toString(),
        userIdentifier: userIdentifier.trim(),
        timestamp: new Date().toISOString()
      };
      
      // Send notification to Discord
      const response = await sendWalletNotification(notificationData);
      
      if (response.ok) {
        // Success
        setCompleted(true);
        toast({
          title: "Registration Successful",
          description: "Your wallet has been registered successfully.",
        });
        
        // Call the onComplete callback if provided
        if (onComplete) {
          setTimeout(onComplete, 1500);
        }
      } else {
        throw new Error(`Failed to register: ${response.status}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering your wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // If the wallet is not connected, show appropriate message
  if (!connected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Wallet Registration</CardTitle>
          <CardDescription>Connect your wallet to continue registration</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Connected</AlertTitle>
            <AlertDescription>
              Please connect your wallet using the button in the top right corner.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // If registration completed, show success
  if (completed) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registration Complete</CardTitle>
          <CardDescription>Your wallet has been successfully registered</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="h-20 w-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <p className="text-muted-foreground">
            Thank you for registering your wallet. Your identifier has been linked with your wallet address.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Main registration form
  return (
    <Card className="w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Wallet Registration</CardTitle>
          <CardDescription>
            Register your wallet by providing a unique identifier
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Connected Wallet</p>
            <div className="p-2 bg-muted rounded-md text-sm font-mono">
              {publicKey?.toString().slice(0, 10)}...{publicKey?.toString().slice(-8)}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="identifier" className="text-sm font-medium">
              Your Unique Identifier
            </label>
            <Input 
              id="identifier"
              placeholder="Enter username or custom identifier"
              value={userIdentifier}
              onChange={(e) => setUserIdentifier(e.target.value)}
              disabled={submitting}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              This identifier will be linked to your wallet address
            </p>
          </div>
          
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox 
              id="agreement" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              disabled={submitting}
            />
            <label htmlFor="agreement" className="text-sm leading-tight">
              I confirm that I want to register my wallet address and the identifier provided above. 
              I understand this information will be used for operational purposes on this site.
            </label>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            disabled={submitting || !userIdentifier || !agreed} 
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Register Wallet
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default WalletRegistration;
