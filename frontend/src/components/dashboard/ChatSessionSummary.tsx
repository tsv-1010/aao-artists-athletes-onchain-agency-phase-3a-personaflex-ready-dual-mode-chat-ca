import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetChatSession } from '../../hooks/useQueries';
import { Clock, MessageSquare, CheckCircle2, Loader2, Sparkles, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatSessionSummaryProps {
  sessionId: string;
}

export default function ChatSessionSummary({ sessionId }: ChatSessionSummaryProps) {
  const { data: session, isLoading, error } = useGetChatSession(sessionId);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading session summary...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !session) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load session summary. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const hasInference = session.inferenceResponse || session.inferenceMetadata;
  const inferenceMetadata = session.inferenceMetadata;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/AAO.png" 
              alt="AAO DeAI Guide" 
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Session Summary
              </CardTitle>
              <CardDescription>
                Your chat onboarding session has been completed and saved
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {session.inferenceStatus || 'completed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="text-sm font-medium">{formatDate(session.timestamp)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Messages</p>
              <p className="text-sm font-medium">{session.messages?.length || 0} exchanges</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Badge variant="secondary" className="capitalize">
              {session.userRole || 'user'}
            </Badge>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium">Onboarding</p>
            </div>
          </div>
        </div>

        {/* Mistral AI Inference Metadata */}
        {hasInference && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-sm">Mistral AI Inference</h4>
              </div>
              
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20 space-y-3">
                {inferenceMetadata && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Prompt Tokens</p>
                        <p className="text-sm font-medium">{inferenceMetadata.tokenUsage?.promptTokens || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Completion Tokens</p>
                        <p className="text-sm font-medium">{inferenceMetadata.tokenUsage?.completionTokens || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Total Tokens</p>
                        <p className="text-sm font-medium">{inferenceMetadata.tokenUsage?.totalTokens || 0}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {inferenceMetadata?.timestamp && (
                  <div className="text-xs text-muted-foreground">
                    Inference completed at {formatDate(inferenceMetadata.timestamp)}
                  </div>
                )}

                <div className="pt-2 border-t border-primary/20">
                  <p className="text-xs text-muted-foreground mb-2">Status:</p>
                  <Badge variant={session.inferenceStatus === 'success' ? 'default' : 'secondary'}>
                    {session.inferenceStatus || 'pending'}
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Message History */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Conversation History</h4>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {session.messages && session.messages.map((message: string, index: number) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  index % 2 === 1 ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {index % 2 === 0 ? (
                    <>
                      <AvatarImage src="/assets/AAO.png" />
                      <AvatarFallback>AI</AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback>U</AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={`p-3 rounded-lg flex-1 ${
                    index % 2 === 0
                      ? 'bg-muted/50 mr-8'
                      : 'bg-primary/10 ml-8'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-medium capitalize">
                      {index % 2 === 0 ? 'AAO DeAI Guide' : 'You'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Session Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Session ID:</span>
            <span className="font-mono text-xs">{session.sessionId}</span>
          </div>
          {session.consentRef && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consent Reference:</span>
              <span className="font-mono text-xs">{session.consentRef}</span>
            </div>
          )}
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            Your session data has been securely stored {hasInference ? 'with Mistral AI inference results ' : ''}
            and is linked to your consent preferences. You can access this summary anytime from your dashboard.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
