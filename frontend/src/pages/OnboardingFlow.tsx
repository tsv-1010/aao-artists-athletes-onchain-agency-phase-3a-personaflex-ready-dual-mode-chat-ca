import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveCallerUserProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { UserRole, type UserProfile } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Trophy, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { identity, loginStatus } = useInternetIdentity();
  const { data: existingProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  
  const [step, setStep] = useState<'role' | 'profile'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    bio: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    website: '',
  });

  // Redirect if not authenticated (only after initialization is complete)
  useEffect(() => {
    if (loginStatus !== 'initializing' && !identity) {
      navigate({ to: '/' });
    }
  }, [identity, loginStatus, navigate]);

  // Redirect to dashboard if profile already exists (only after profile is fetched)
  useEffect(() => {
    if (isFetched && existingProfile) {
      navigate({ to: '/dashboard' });
    }
  }, [existingProfile, isFetched, navigate]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('profile');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    if (!formData.name.trim() || !formData.profession.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const profile: UserProfile = {
      name: formData.name.trim(),
      profession: formData.profession.trim(),
      bio: formData.bio.trim(),
      role: selectedRole,
      social: {
        twitter: formData.twitter.trim() || undefined,
        instagram: formData.instagram.trim() || undefined,
        linkedin: formData.linkedin.trim() || undefined,
        website: formData.website.trim() || undefined,
      },
    };

    try {
      await saveProfile.mutateAsync(profile);
      navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  // Show loading while checking authentication or profile
  if (loginStatus === 'initializing' || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const roles = [
    {
      value: UserRole.artist,
      label: 'Artist',
      icon: Palette,
      description: 'Creative professionals, musicians, visual artists, and content creators',
    },
    {
      value: UserRole.athlete,
      label: 'Athlete',
      icon: Trophy,
      description: 'Professional athletes, sports personalities, and fitness influencers',
    },
    {
      value: UserRole.brand,
      label: 'Brand',
      icon: Briefcase,
      description: 'Companies, agencies, and organizations seeking partnerships',
    },
  ];

  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-2 w-24 rounded-full ${step === 'role' ? 'bg-primary' : 'bg-primary/50'}`} />
          <div className={`h-2 w-24 rounded-full ${step === 'profile' ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        {/* Step 1: Role Selection */}
        {step === 'role' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Welcome to AAO</h1>
              <p className="text-muted-foreground">
                Let's get started by selecting your role
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <Card
                    key={role.value}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedRole === role.value ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleRoleSelect(role.value)}
                  >
                    <CardHeader className="text-center">
                      <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <CardTitle>{role.label}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Profile Information */}
        {step === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('role')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-bold">Complete Your Profile</h1>
                <p className="text-muted-foreground">
                  Tell us more about yourself
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profession">Profession *</Label>
                      <Input
                        id="profession"
                        value={formData.profession}
                        onChange={(e) => handleInputChange('profession', e.target.value)}
                        placeholder="Your profession or specialty"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Social Links (Optional)</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          value={formData.twitter}
                          onChange={(e) => handleInputChange('twitter', e.target.value)}
                          placeholder="@username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          value={formData.instagram}
                          onChange={(e) => handleInputChange('instagram', e.target.value)}
                          placeholder="@username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={formData.linkedin}
                          onChange={(e) => handleInputChange('linkedin', e.target.value)}
                          placeholder="linkedin.com/in/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={saveProfile.isPending}
                  >
                    {saveProfile.isPending ? 'Creating Profile...' : 'Complete Setup'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
