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
import { Settings, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface PersonaFlexSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PersonaFlexConfig {
  baseUrl: string;
  apiKey: string;
}

export default function PersonaFlexSettingsModal({ open, onOpenChange }: PersonaFlexSettingsModalProps) {
  const getConfig = (): PersonaFlexConfig => {
    const stored = localStorage.getItem('personaFlexConfig');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      baseUrl: 'https://api.personaflex.ai/v1',
      apiKey: '',
    };
  };

  const currentConfig = getConfig();
  
  const [baseUrl, setBaseUrl] = useState(currentConfig.baseUrl);
  const [apiKey, setApiKey] = useState(currentConfig.apiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    const config: PersonaFlexConfig = { baseUrl, apiKey };
    localStorage.setItem('personaFlexConfig', JSON.stringify(config));
    toast.success('PersonaFlex configuration saved');
    onOpenChange(false);
  };

  const handleTestConnection = () => {
    if (!apiKey) {
      toast.error('Please enter an API key first');
      return;
    }
    toast.info('Connection test would be performed here. In production, this would verify the API credentials.');
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
              <DialogTitle>PersonaFlex Settings</DialogTitle>
              <DialogDescription>
                Configure your PersonaFlex STT/TTS integration
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert>
            <AlertDescription className="text-sm">
              These settings are stored locally in your browser for testing purposes. 
              Configure the PersonaFlex endpoint for speech-to-text and text-to-speech services.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="baseUrl">API Base URL</Label>
              <Input
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.personaflex.ai/v1"
              />
              <p className="text-xs text-muted-foreground">
                The base URL for the PersonaFlex STT/TTS endpoint
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (Optional)</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your PersonaFlex API key"
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
                Your authentication key for accessing PersonaFlex services (if required)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/30">
            <Settings className="w-8 h-8 text-accent-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">PersonaFlex Integration</p>
              <p className="text-xs text-muted-foreground">
                Speech-to-text and text-to-speech services
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
