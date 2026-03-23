import { useState } from 'react';
import { useGetConsents, useAddConsent } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Clock, Info } from 'lucide-react';

export default function ConsentsSection() {
  const { data: consents, isLoading } = useGetConsents();
  const addConsent = useAddConsent();

  const [dataUsage, setDataUsage] = useState(true);
  const [matchingPermission, setMatchingPermission] = useState(false);

  const latestConsent = consents && consents.length > 0 ? consents[0] : null;

  const handleUpdateConsent = async () => {
    await addConsent.mutateAsync({
      dataUsage,
      matchingPermission,
      ownershipHash: `hash-${Date.now()}`,
    });
  };

  const hasChanges = latestConsent && (
    latestConsent.dataUsage !== dataUsage ||
    latestConsent.matchingPermission !== matchingPermission
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Consent Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Consent Preferences</CardTitle>
          <CardDescription>Manage your data usage and matching permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1 flex-1">
                <Label htmlFor="data-usage" className="text-base font-medium cursor-pointer">
                  Data Usage Consent
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow AAO to use your profile data for platform improvements and analytics
                </p>
              </div>
              <Switch
                id="data-usage"
                checked={dataUsage}
                onCheckedChange={setDataUsage}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1 flex-1">
                <Label htmlFor="matching" className="text-base font-medium cursor-pointer">
                  Matching Permission
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow brands to discover and match with your profile for partnership opportunities
                </p>
              </div>
              <Switch
                id="matching"
                checked={matchingPermission}
                onCheckedChange={setMatchingPermission}
              />
            </div>
          </div>

          {hasChanges && (
            <>
              <Separator />
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You have unsaved changes to your consent preferences.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleUpdateConsent} 
                disabled={addConsent.isPending}
                className="w-full"
              >
                {addConsent.isPending ? 'Saving...' : 'Save Consent Preferences'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Consent History */}
      <Card>
        <CardHeader>
          <CardTitle>Consent History</CardTitle>
          <CardDescription>View your consent record history</CardDescription>
        </CardHeader>
        <CardContent>
          {!consents || consents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No consent records found
            </p>
          ) : (
            <div className="space-y-4">
              {consents.map((consent, index) => {
                const date = new Date(Number(consent.timestamp) / 1000000);
                return (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Consent Record #{consents.length - index}</p>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {date.toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Data Usage:</span>
                          <Badge variant={consent.dataUsage ? 'default' : 'secondary'}>
                            {consent.dataUsage ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Matching:</span>
                          <Badge variant={consent.matchingPermission ? 'default' : 'secondary'}>
                            {consent.matchingPermission ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        Hash: {consent.ownershipHash}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
