import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Briefcase, Lock } from 'lucide-react';

export default function BrandBriefSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>Create Brand Brief</CardTitle>
            <CardDescription>Post partnership opportunities for artists and athletes</CardDescription>
          </div>
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Coming Soon</AlertTitle>
          <AlertDescription>
            The brand brief creation feature is currently under development and will be available 
            in the next phase of the AAO platform. This feature will allow brands to:
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm text-muted-foreground ml-6">
          <ul className="list-disc list-inside space-y-2">
            <li>Create detailed partnership briefs with requirements and budgets</li>
            <li>Specify target artist or athlete profiles</li>
            <li>Set campaign timelines and deliverables</li>
            <li>Review and manage applications from creators</li>
            <li>Track ongoing partnerships and collaborations</li>
          </ul>
        </div>

        <div className="pt-4">
          <Button disabled className="w-full">
            <Lock className="h-4 w-4 mr-2" />
            Create Brief (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
