import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMistralConfig } from '../../hooks/useQueries';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MistralSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MistralSettingsModal({ open, onOpenChange }: MistralSettingsModalProps) {
  const { getConfig, saveConfig } = useMistralConfig();
  const currentConfig = getConfig();
  
  const [baseUrl, setBaseUrl] = useState(currentConfig.baseUrl);
  const [apiKey, setApiKey] = useState(currentConfig.apiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    saveConfig({ baseUrl, apiKey });
    onOpenChange(false);
  };

  const handleTestConnection = () => {
    if (!apiKey) {
      alert('Please enter an API key first');
      return;
    }
    alert('Connection test would be performed here. In production, this would verify the API credentials.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/settings-icon-transparent.dim_64x64.png" 
              alt="Settings" 
              className="w-10 h-10"
            />
            <div>
              <DialogTitle>Mistral API Settings</DialogTitle>
              <DialogDescription>
                Configure your Mistral API integration
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert>
            <AlertDescription className="text-sm">
              These settings are stored locally in your browser for testing purposes. 
              In production, API keys should be managed securely on the backend.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="baseUrl">API Base URL</Label>
              <Input
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.mistral.ai/v1"
              />
              <p className="text-xs text-muted-foreground">
                The base URL for the Mistral API endpoint
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Mistral API key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your authentication key for accessing the Mistral API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <img 
              src="/assets/generated/mistral-icon-transparent.dim_64x64.png" 
              alt="Mistral AI" 
              className="w-8 h-8"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Mistral AI Integration</p>
              <p className="text-xs text-muted-foreground">
                Enhanced AI responses via HTTP outcalls
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleTestConnection}>
            Test Connection
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
