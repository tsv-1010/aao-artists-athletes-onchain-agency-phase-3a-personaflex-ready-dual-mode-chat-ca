import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import type { Consent } from '../../backend';

interface ConsentConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  consents: Consent[];
}

export default function ConsentConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  consents,
}: ConsentConfirmationModalProps) {
  const latestConsent = consents.length > 0 ? consents[consents.length - 1] : null;

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Consent Confirmation</DialogTitle>
              <DialogDescription>
                Review your consent preferences before starting
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertDescription>
              Before starting the DeAI Chat Onboarding, please review your current consent settings.
              Your chat responses will be stored according to these preferences.
            </AlertDescription>
          </Alert>

          {latestConsent && (
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <h4 className="font-medium text-sm">Current Consent Settings</h4>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {latestConsent.dataUsage ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={latestConsent.dataUsage ? 'text-foreground' : 'text-muted-foreground'}>
                    Data Usage Consent
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {latestConsent.matchingPermission ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={latestConsent.matchingPermission ? 'text-foreground' : 'text-muted-foreground'}>
                    Matching Permission
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t text-xs text-muted-foreground">
                Last updated: {formatDate(latestConsent.timestamp)}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p>By proceeding, you confirm that:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your chat responses will be stored securely on-chain</li>
              <li>Your data will be used according to your consent preferences</li>
              <li>You can update your consent settings at any time</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm & Start Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

