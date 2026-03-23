import { useGetSBT } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, Shield, Info } from 'lucide-react';
import { UserRole } from '../../backend';

const roleLabels = {
  [UserRole.artist]: 'Artist',
  [UserRole.athlete]: 'Athlete',
  [UserRole.brand]: 'Brand',
};

export default function VerificationSection() {
  const { data: sbt, isLoading } = useGetSBT();

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

  if (!sbt) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No verification token found. Please contact support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const createdDate = new Date(Number(sbt.timestamp) / 1000000);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>Soulbound Token (SBT)</CardTitle>
              <CardDescription>Your non-transferable identity verification</CardDescription>
            </div>
            <img 
              src="/assets/generated/sbt-verification-icon.dim_64x64.png" 
              alt="SBT Icon" 
              className="h-12 w-12"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Verification Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {sbt.verified ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <Clock className="h-8 w-8 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">Verification Status</p>
                <p className="text-sm text-muted-foreground">
                  {sbt.verified ? 'Verified' : 'Pending Verification'}
                </p>
              </div>
            </div>
            <Badge variant={sbt.verified ? 'default' : 'secondary'}>
              {sbt.verified ? 'Verified' : 'Pending'}
            </Badge>
          </div>

          <Separator />

          {/* SBT Details */}
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{roleLabels[sbt.role]}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{createdDate.toLocaleDateString()}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-sm text-muted-foreground">Principal ID</p>
                <p className="font-mono text-xs break-all">{sbt.principal.toString()}</p>
              </div>
            </div>
          </div>

          {!sbt.verified && (
            <>
              <Separator />
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your verification is pending review. This process typically takes 24-48 hours. 
                  You'll be notified once your identity has been verified.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* What is SBT Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What is a Soulbound Token?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            A Soulbound Token (SBT) is a non-transferable digital identity token that represents 
            your verified role and credentials on the AAO platform.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Cannot be transferred or sold to another user</li>
            <li>Permanently linked to your Internet Identity</li>
            <li>Provides proof of your verified role (Artist, Athlete, or Brand)</li>
            <li>Stored immutably on the Internet Computer blockchain</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
