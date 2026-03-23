import { useState, useRef, useEffect } from 'react';
import { UserRole, type UserProfile } from '../../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAddChatSession, useGetChatSession, useGetConsents, useMistralAPI, useMistralConfig } from '../../hooks/useQueries';
import { Send, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import ConsentConfirmationModal from './ConsentConfirmationModal';
import ChatSessionSummary from './ChatSessionSummary';
import { Badge } from '@/components/ui/badge';

interface ChatOnboardingSectionProps {
  userProfile: UserProfile;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isMistralResponse?: boolean;
}

interface QuestionFlow {
  question: string;
  followUps?: {
    condition: (answer: string) => boolean;
    question: string;
  }[];
}

const ARTIST_QUESTIONS: QuestionFlow[] = [
  {
    question: "What creative discipline do you specialize in? (e.g., visual arts, music, digital art, performance, etc.)",
    followUps: [
      {
        condition: (answer) => answer.toLowerCase().includes('music'),
        question: "What genre of music do you create, and what instruments or tools do you use?"
      },
      {
        condition: (answer) => answer.toLowerCase().includes('visual') || answer.toLowerCase().includes('digital'),
        question: "What mediums or software do you primarily work with?"
      }
    ]
  },
  {
    question: "How would you describe your artistic style or aesthetic?",
  },
  {
    question: "Do you have an online portfolio or gallery? If so, what platforms do you use to showcase your work?",
  },
  {
    question: "What are your collaboration preferences? Do you prefer working solo, with other artists, or with brands?",
    followUps: [
      {
        condition: (answer) => answer.toLowerCase().includes('brand'),
        question: "What types of brands or industries align with your artistic vision?"
      }
    ]
  },
  {
    question: "How do you approach personal brand development? What values or messages do you want your art to convey?",
  },
  {
    question: "What are your short-term and long-term career goals as an artist?",
  }
];

const ATHLETE_QUESTIONS: QuestionFlow[] = [
  {
    question: "What sport or athletic discipline do you compete in?",
    followUps: [
      {
        condition: (answer) => answer.length > 0,
        question: "At what level do you currently compete? (e.g., amateur, collegiate, professional, Olympic)"
      }
    ]
  },
  {
    question: "What is your training philosophy or mindset? What drives you to excel in your sport?",
  },
  {
    question: "Can you share a personal narrative or story that defines your athletic journey?",
  },
  {
    question: "Do you have any sponsorship or brand partnership experience? If so, what types of partnerships have you had?",
    followUps: [
      {
        condition: (answer) => answer.toLowerCase().includes('yes') || answer.toLowerCase().includes('have'),
        question: "What made those partnerships successful or challenging?"
      },
      {
        condition: (answer) => answer.toLowerCase().includes('no') || answer.toLowerCase().includes('not'),
        question: "What types of brands or products would you be interested in partnering with?"
      }
    ]
  },
  {
    question: "Beyond your sport, what are your off-field ambitions or interests? (e.g., entrepreneurship, advocacy, media)",
  },
  {
    question: "How do you want to leverage your athletic platform to make an impact?",
  }
];

const BRAND_QUESTIONS: QuestionFlow[] = [
  {
    question: "What industry does your brand operate in, and what products or services do you offer?",
  },
  {
    question: "Who is your target audience? Can you describe their demographics and interests?",
    followUps: [
      {
        condition: (answer) => answer.length > 0,
        question: "What platforms or channels does your target audience engage with most?"
      }
    ]
  },
  {
    question: "What are your primary campaign goals? (e.g., brand awareness, product launch, community engagement)",
  },
  {
    question: "Do you have any previous partnership history with artists or athletes? What worked well or what would you do differently?",
  },
  {
    question: "How would you describe your brand voice and personality? (e.g., bold, authentic, innovative, playful)",
  },
  {
    question: "What social impact or values does your brand prioritize? (e.g., sustainability, diversity, community support)",
    followUps: [
      {
        condition: (answer) => answer.length > 0,
        question: "How do you want potential partners to align with these values?"
      }
    ]
  }
];

const ROLE_QUESTIONS = {
  [UserRole.artist]: ARTIST_QUESTIONS,
  [UserRole.athlete]: ATHLETE_QUESTIONS,
  [UserRole.brand]: BRAND_QUESTIONS,
};

export default function ChatOnboardingSection({ userProfile }: ChatOnboardingSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [pendingFollowUps, setPendingFollowUps] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [useMistral, setUseMistral] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: consents } = useGetConsents();
  const addChatSession = useAddChatSession();
  const { data: savedSession } = useGetChatSession(sessionId);
  const mistralAPI = useMistralAPI();
  const { getConfig } = useMistralConfig();

  const questions = ROLE_QUESTIONS[userProfile.role];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartChat = () => {
    if (consents && consents.length > 0) {
      setShowConsentModal(true);
    } else {
      alert('Please set up your consent preferences in the Consents tab before starting a chat session.');
    }
  };

  const handleConsentConfirmed = () => {
    setHasConsented(true);
    setShowConsentModal(false);
    
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `Hello ${userProfile.name}! I'm the AAO DeAI Guide. I'm here to help you complete your onboarding and understand your goals as ${userProfile.role === UserRole.artist ? 'an artist' : userProfile.role === UserRole.athlete ? 'an athlete' : 'a brand'}. Let's get started!`,
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
    
    setTimeout(() => {
      askNextQuestion();
    }, 1000);
  };

  const askNextQuestion = () => {
    if (pendingFollowUps.length > 0) {
      const followUpQuestion = pendingFollowUps[0];
      setPendingFollowUps(prev => prev.slice(1));
      
      setIsTyping(true);
      setTimeout(() => {
        const questionMessage: ChatMessage = {
          role: 'assistant',
          content: followUpQuestion,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, questionMessage]);
        setIsTyping(false);
      }, 800);
    } else if (currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      
      setIsTyping(true);
      setTimeout(() => {
        const questionMessage: ChatMessage = {
          role: 'assistant',
          content: currentQuestion.question,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, questionMessage]);
        setIsTyping(false);
      }, 800);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    setIsTyping(true);
    setTimeout(() => {
      const summaryContent = generateSummary();
      const completionMessage: ChatMessage = {
        role: 'assistant',
        content: `Thank you for completing the onboarding chat, ${userProfile.name}! Here's a summary of what we learned:\n\n${summaryContent}\n\nYour responses have been securely recorded and will help us provide better matches and opportunities for you. You can view your full session summary below.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, completionMessage]);
      setIsTyping(false);
      
      const newSessionId = `session-${Date.now()}`;
      const messageTexts = messages.map(m => m.content);
      addChatSession.mutate({ sessionId: newSessionId, messages: messageTexts });
      setSessionId(newSessionId);
      setIsSessionComplete(true);
    }, 1000);
  };

  const generateSummary = (): string => {
    const role = userProfile.role;
    const summaryLines: string[] = [];

    if (role === UserRole.artist) {
      summaryLines.push(`✨ Creative Discipline: ${userAnswers[0] || 'Not specified'}`);
      summaryLines.push(`🎨 Artistic Style: ${userAnswers[1] || 'Not specified'}`);
      summaryLines.push(`📱 Portfolio Presence: ${userAnswers[2] || 'Not specified'}`);
      summaryLines.push(`🤝 Collaboration Preferences: ${userAnswers[3] || 'Not specified'}`);
      summaryLines.push(`💡 Personal Brand: ${userAnswers[4] || 'Not specified'}`);
      summaryLines.push(`🎯 Career Goals: ${userAnswers[5] || 'Not specified'}`);
    } else if (role === UserRole.athlete) {
      summaryLines.push(`🏆 Sport/Discipline: ${userAnswers[0] || 'Not specified'}`);
      summaryLines.push(`💪 Training Philosophy: ${userAnswers[1] || 'Not specified'}`);
      summaryLines.push(`📖 Personal Narrative: ${userAnswers[2] || 'Not specified'}`);
      summaryLines.push(`🤝 Sponsorship Experience: ${userAnswers[3] || 'Not specified'}`);
      summaryLines.push(`🌟 Off-Field Ambitions: ${userAnswers[4] || 'Not specified'}`);
      summaryLines.push(`🎯 Platform Impact: ${userAnswers[5] || 'Not specified'}`);
    } else if (role === UserRole.brand) {
      summaryLines.push(`🏢 Industry & Offerings: ${userAnswers[0] || 'Not specified'}`);
      summaryLines.push(`👥 Target Audience: ${userAnswers[1] || 'Not specified'}`);
      summaryLines.push(`🎯 Campaign Goals: ${userAnswers[2] || 'Not specified'}`);
      summaryLines.push(`🤝 Partnership History: ${userAnswers[3] || 'Not specified'}`);
      summaryLines.push(`💬 Brand Voice: ${userAnswers[4] || 'Not specified'}`);
      summaryLines.push(`🌍 Social Impact Values: ${userAnswers[5] || 'Not specified'}`);
    }

    return summaryLines.join('\n');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue.trim();
    setUserAnswers(prev => [...prev, userInput]);
    setInputValue('');

    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion?.followUps && pendingFollowUps.length === 0) {
      const triggeredFollowUps = currentQuestion.followUps
        .filter(fu => fu.condition(userInput))
        .map(fu => fu.question);
      
      if (triggeredFollowUps.length > 0) {
        setPendingFollowUps(triggeredFollowUps);
      }
    }

    if (useMistral) {
      setIsTyping(true);
      
      try {
        const config = getConfig();
        const tempSessionId = sessionId || `session-${Date.now()}`;
        if (!sessionId) setSessionId(tempSessionId);

        const response = await mistralAPI.mutateAsync({
          sessionId: tempSessionId,
          prompt: userInput,
          config,
        });

        const mistralMessage: ChatMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: Date.now(),
          isMistralResponse: true,
        };
        setMessages(prev => [...prev, mistralMessage]);
        setIsTyping(false);

        if (pendingFollowUps.length === 0) {
          setCurrentQuestionIndex(prev => prev + 1);
        }
        setTimeout(() => askNextQuestion(), 1500);
      } catch (error) {
        setIsTyping(false);
        if (pendingFollowUps.length === 0) {
          setCurrentQuestionIndex(prev => prev + 1);
        }
        askNextQuestion();
      }
    } else {
      if (pendingFollowUps.length === 0) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      askNextQuestion();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!hasConsented) {
    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <img 
                src="/assets/generated/chat-icon-transparent.dim_64x64.png" 
                alt="Chat Icon" 
                className="w-12 h-12"
              />
              <div>
                <CardTitle>DeAI Chat Onboarding</CardTitle>
                <CardDescription>
                  Complete your personalized onboarding with our AI guide
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-4">
                <img 
                  src="/assets/AAO.png" 
                  alt="AAO DeAI Guide" 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Meet Your AAO DeAI Guide</h3>
                  <p className="text-muted-foreground">
                    Our AI-powered guide will ask you a series of questions tailored to your role as a{' '}
                    <span className="font-medium text-foreground capitalize">{userProfile.role}</span>.
                    Your responses will help us understand your goals and provide better matches and opportunities.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium">What to expect:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Role-specific structured questions with intelligent follow-ups</li>
                  <li>Conversational, adaptive interaction based on your answers</li>
                  <li>Optional Mistral AI-powered enhanced responses</li>
                  <li>Secure storage of your responses on-chain</li>
                  <li>Comprehensive session summary after completion</li>
                </ul>
              </div>

              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <img 
                  src="/assets/generated/mistral-icon-transparent.dim_64x64.png" 
                  alt="Mistral AI" 
                  className="w-10 h-10"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Mistral AI Integration</p>
                  <p className="text-xs text-muted-foreground">
                    Enhanced responses powered by external AI
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={handleStartChat}
                className="gap-2"
              >
                <MessageSquare className="h-5 w-5" />
                Start Chat Onboarding
              </Button>
            </div>
          </CardContent>
        </Card>

        <ConsentConfirmationModal
          open={showConsentModal}
          onOpenChange={setShowConsentModal}
          onConfirm={handleConsentConfirmed}
          consents={consents || []}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/generated/chat-icon-transparent.dim_64x64.png" 
                alt="Chat Icon" 
                className="w-12 h-12"
              />
              <div>
                <CardTitle>DeAI Chat Onboarding</CardTitle>
                <CardDescription>
                  Chat with the AAO DeAI Guide
                </CardDescription>
              </div>
            </div>
            {!isSessionComplete && (
              <Button
                variant={useMistral ? "default" : "outline"}
                size="sm"
                onClick={() => setUseMistral(!useMistral)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {useMistral ? 'Mistral Enabled' : 'Enable Mistral'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-background">
            <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {message.role === 'assistant' ? (
                        <>
                          <AvatarImage src="/assets/AAO.png" />
                          <AvatarFallback>AI</AvatarFallback>
                        </>
                      ) : (
                        <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={`flex flex-col gap-1 max-w-[80%] ${
                        message.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {message.isMistralResponse && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Sparkles className="h-3 w-3" />
                            Mistral AI
                          </Badge>
                        )}
                      </div>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : message.isMistralResponse
                            ? 'bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src="/assets/AAO.png" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      {useMistral && (
                        <div className="flex items-center gap-2">
                          <img 
                            src="/assets/generated/thinking-spinner-transparent.dim_64x64.png" 
                            alt="Thinking" 
                            className="w-5 h-5 animate-spin"
                          />
                          <span className="text-xs text-muted-foreground">
                            AAO DeAI is thinking...
                          </span>
                        </div>
                      )}
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {!isSessionComplete && (
              <div className="border-t p-4 bg-muted/30">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    disabled={isTyping}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    size="icon"
                  >
                    {isTyping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isSessionComplete && sessionId && (
        <ChatSessionSummary sessionId={sessionId} />
      )}
    </div>
  );
}
