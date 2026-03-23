import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { UserRole, type UserProfile } from '../backend';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ProfileSection from '../components/dashboard/ProfileSection';
import ConsentsSection from '../components/dashboard/ConsentsSection';
import VerificationSection from '../components/dashboard/VerificationSection';
import BrandBriefSection from '../components/dashboard/BrandBriefSection';
import DualModeOnboardingSection from '../components/dashboard/DualModeOnboardingSection';
import MistralSettingsModal from '../components/dashboard/MistralSettingsModal';
import { User, Shield, FileText, Briefcase, MessageSquare, Settings } from 'lucide-react';

interface DashboardProps {
  userProfile: UserProfile;
}

export default function Dashboard({ userProfile }: DashboardProps) {
  const navigate = useNavigate();
  const { identity, loginStatus } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState('profile');
  const [showSettings, setShowSettings] = useState(false);
  const isBrand = userProfile.role === UserRole.brand;

  // Redirect if not authenticated (only after initialization is complete)
  useEffect(() => {
    if (loginStatus !== 'initializing' && !identity) {
      navigate({ to: '/' });
    }
  }, [identity, loginStatus, navigate]);

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img 
          src="/assets/generated/dashboard-background.dim_1920x1080.png" 
          alt="Dashboard Background" 
          className="w-full h-full object-cover opacity-5"
        />
      </div>

      <div className="container py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {userProfile.name}
            </h1>
            <p className="text-muted-foreground">
              Manage your profile, consents, and verification status
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Mistral Settings
          </Button>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full h-auto" style={{ gridTemplateColumns: `repeat(${isBrand ? 5 : 4}, minmax(0, 1fr))` }}>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">My Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Verification</span>
              <span className="sm:hidden">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="consents" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">My Consents</span>
              <span className="sm:hidden">Consents</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">DeAI Chat</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            {isBrand && (
              <TabsTrigger value="brief" className="gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Create Brief</span>
                <span className="sm:hidden">Brief</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileSection userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <VerificationSection />
          </TabsContent>

          <TabsContent value="consents" className="space-y-6">
            <ConsentsSection />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <DualModeOnboardingSection userProfile={userProfile} />
          </TabsContent>

          {isBrand && (
            <TabsContent value="brief" className="space-y-6">
              <BrandBriefSection />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <MistralSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}
