'use client';

import { useState } from 'react';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserProfile } from '@/lib/auth';
import { Upload } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    title: '',
    country: '',
    timezone: '',
    website: '',
    bio: '',
    twitter: '',
    linkedin: '',
    github: '',
    instagram: '',
    phone: '',
    phoneCountryCode: '+234',
    language: 'en',
    profileImage: '',
    coverImage: '',
    contactEmailPublic: false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Update your profile information</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 max-w-4xl space-y-8">
        {/* Profile Picture */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {formData.profileImage ? (
                <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400">No image</div>
              )}
            </div>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Picture
            </Button>
          </div>
        </div>

        {/* Personal Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input type="email" value={user?.email || ''} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="your_username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Professional Title</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. Product Manager"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country / Location</label>
              <Input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Nigeria"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <Input
                type="text"
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                placeholder="WAT (UTC+1)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Primary Language</label>
              <Select value={formData.language} onValueChange={(val) => handleInputChange('language', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Website / Portfolio</label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Bio & Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Short Bio</label>
          <Textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>

        {/* Social Media Links */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <Input
                type="text"
                value={formData.twitter}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                placeholder="@username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn</label>
              <Input
                type="text"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">GitHub</label>
              <Input
                type="text"
                value={formData.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
                placeholder="github.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <Input
                type="text"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-32">
                <label className="block text-sm font-medium mb-2">Country Code</label>
                <Input
                  type="text"
                  value={formData.phoneCountryCode}
                  onChange={(e) => handleInputChange('phoneCountryCode', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="9012345678"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="contact-email-public"
                checked={formData.contactEmailPublic}
                onChange={(e) => handleInputChange('contactEmailPublic', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="contact-email-public" className="text-sm font-medium">
                Make contact email public on profile
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </div>
  );
}
