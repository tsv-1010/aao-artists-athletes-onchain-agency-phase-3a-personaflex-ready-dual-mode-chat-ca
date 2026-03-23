import { useState } from 'react';
import { useUpdateProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserRole, type UserProfile } from '../../backend';
import { Edit, Save, X, Palette, Trophy, Building2, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';
import { SiX, SiInstagram, SiLinkedin } from 'react-icons/si';

interface ProfileSectionProps {
  userProfile: UserProfile;
}

const roleIcons = {
  [UserRole.artist]: Palette,
  [UserRole.athlete]: Trophy,
  [UserRole.brand]: Building2,
};

const roleLabels = {
  [UserRole.artist]: 'Artist',
  [UserRole.athlete]: 'Athlete',
  [UserRole.brand]: 'Brand',
};

export default function ProfileSection({ userProfile }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile.name,
    profession: userProfile.profession,
    bio: userProfile.bio,
    twitter: userProfile.social.twitter || '',
    instagram: userProfile.social.instagram || '',
    linkedin: userProfile.social.linkedin || '',
    website: userProfile.social.website || '',
  });

  const updateProfile = useUpdateProfile();
  const RoleIcon = roleIcons[userProfile.role];

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      name: formData.name,
      profession: formData.profession,
      bio: formData.bio,
      role: userProfile.role,
      social: {
        twitter: formData.twitter || undefined,
        instagram: formData.instagram || undefined,
        linkedin: formData.linkedin || undefined,
        website: formData.website || undefined,
      },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile.name,
      profession: userProfile.profession,
      bio: userProfile.bio,
      twitter: userProfile.social.twitter || '',
      instagram: userProfile.social.instagram || '',
      linkedin: userProfile.social.linkedin || '',
      website: userProfile.social.website || '',
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View and manage your profile details</CardDescription>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={updateProfile.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateProfile.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfile.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <RoleIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <Badge variant="secondary" className="mb-1">
              {roleLabels[userProfile.role]}
            </Badge>
            <p className="text-sm text-muted-foreground">Your role on AAO</p>
          </div>
        </div>

        <Separator />

        {/* Profile Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            ) : (
              <p className="text-sm py-2">{userProfile.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">Profession</Label>
            {isEditing ? (
              <Input
                id="profession"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              />
            ) : (
              <p className="text-sm py-2">{userProfile.profession}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
            ) : (
              <p className="text-sm py-2 whitespace-pre-wrap">{userProfile.bio}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Social Links */}
        <div className="space-y-4">
          <Label>Social Links</Label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-sm text-muted-foreground flex items-center gap-2">
                <SiX className="h-3 w-3" />
                Twitter/X
              </Label>
              {isEditing ? (
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="@username"
                />
              ) : (
                <p className="text-sm py-2">{userProfile.social.twitter || '—'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-sm text-muted-foreground flex items-center gap-2">
                <SiInstagram className="h-3 w-3" />
                Instagram
              </Label>
              {isEditing ? (
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="@username"
                />
              ) : (
                <p className="text-sm py-2">{userProfile.social.instagram || '—'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm text-muted-foreground flex items-center gap-2">
                <SiLinkedin className="h-3 w-3" />
                LinkedIn
              </Label>
              {isEditing ? (
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/username"
                />
              ) : (
                <p className="text-sm py-2">{userProfile.social.linkedin || '—'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm text-muted-foreground flex items-center gap-2">
                <Globe className="h-3 w-3" />
                Website
              </Label>
              {isEditing ? (
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                />
              ) : (
                <p className="text-sm py-2">{userProfile.social.website || '—'}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
