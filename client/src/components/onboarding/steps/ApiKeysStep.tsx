import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Cloud, Check } from 'lucide-react';
import { OnboardingFormData } from '../OnboardingWizard';
import { toast } from '@/lib/toast';

interface ApiKeysStepProps {
  data: OnboardingFormData;
  updateData: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const STORAGE_PROVIDERS = [
  {
    id: 'google' as const,
    name: 'Google Drive',
    description: 'Connect to Google Drive for document storage',
    icon: '🗂️',
    color: 'border-blue-500',
  },
  {
    id: 'dropbox' as const,
    name: 'Dropbox',
    description: 'Connect to Dropbox for document storage',
    icon: '📁',
    color: 'border-indigo-500',
  },
  {
    id: 'onedrive' as const,
    name: 'OneDrive',
    description: 'Connect to Microsoft OneDrive',
    icon: '☁️',
    color: 'border-green-500',
  },
];

export function ApiKeysStep({ data, updateData, onNext, onPrevious }: ApiKeysStepProps) {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleOAuthConnect = async (provider: 'google' | 'dropbox' | 'onedrive') => {
    setConnecting(provider);

    try {
      // Open OAuth popup
      //const popup = window.open(
      //  `/api/oauth/${provider}/authorize`,
      //  'oauth',
      //  'width=600,height=600,scrollbars=yes,resizable=yes'
      //);

      // Listen for OAuth completion
      //const checkClosed = setInterval(() => {
      //  if (popup?.closed) {
      //    clearInterval(checkClosed);
      //    setConnecting(null);

      // Check if OAuth was successful
      // fetch(`/api/oauth/${provider}/status`)
      //   .then(res => res.json())
      //   .then(result => {
      //     if (result.connected) {
      //       updateData({ 
      //         storageProvider: provider,
      //         oauthTokens: { 
      //           ...data.oauthTokens, 
      //           [provider]: result.token 
      //         }
      //       });
      //       toast({
      //         title: "Connected!",
      //         description: `Successfully connected to ${STORAGE_PROVIDERS.find(p => p.id === provider)?.name}`,
      //         variant: "default"
      //       });
      //     } else {
      //       toast({
      //         title: "Connection failed",
      //         description: "Please try again",
      //         variant: "destructive"
      //       });
      //     }
      //   })
      //   .catch(error => {
      //     console.error('OAuth status check failed:', error);
      //     toast({
      //       title: "Connection failed",
      //       description: "Please try again",
      //       variant: "destructive"
      //     });
      //   });
      // }
      //}, 1000);

      // Cleanup after 5 minutes
      //setTimeout(() => {
      //  clearInterval(checkClosed);
      //  if (popup && !popup.closed) {
      //    popup.close();
      //  }
      //  setConnecting(null);
      //}, 300000);
      
      // Redirect to OAuth start URL
      window.location.href = `/api/oauth/${provider}/start`;

    } catch (error) {
      console.error('OAuth connection failed:', error);
      setConnecting(null);
      toast({
        title: "Connection failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleNext = () => {
    if (!data.storageProvider) {
      toast({
        title: "Storage Required",
        description: "Please connect at least one storage provider",
        variant: "destructive"
      });
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Cloud className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connect Your Storage</h3>
        <p className="text-gray-600">
          Choose a cloud storage provider to securely store your firm's documents
        </p>
      </div>

      <div className="grid gap-4">
        {STORAGE_PROVIDERS.map((provider) => {
          const isConnected = data.storageProvider === provider.id;
          const isConnecting = connecting === provider.id;

          return (
            <Card
              key={provider.id}
              className={`cursor-pointer transition-all ${
                isConnected 
                  ? `${provider.color} bg-blue-50` 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{provider.icon}</span>
                    <div>
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                      <CardDescription>{provider.description}</CardDescription>
                    </div>
                  </div>

                  {isConnected ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOAuthConnect(provider.id)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {data.storageProvider && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-500" />
            <p className="text-green-700">
              Connected to {STORAGE_PROVIDERS.find(p => p.id === data.storageProvider)?.name}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button onClick={handleNext} className="flex items-center space-x-2">
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}