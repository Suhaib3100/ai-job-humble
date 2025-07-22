

import React from 'react';
import { UserProfile } from '@/types/profile';

import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileForm from '@/components/profile/ProfileForm';
import CookiePopup from '@/components/ui/cookie-popup';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';


const Profile = () => {
  const { user } = useAuth();

  // Update cookie preference in user_profiles table
  const updateCookiePref = async (accepted: boolean) => {
    if (!user?.id) return;
    await supabase
      .from('user_profiles')
      .update({ cookie_accepted: accepted } as Partial<UserProfile>)
      .eq('id', user.id);
  };

  useEffect(() => {
    // Sync localStorage with profile on mount if needed
    if (user?.id) {
      supabase
        .from('user_profiles')
        .select('cookie_accepted')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          const profile = data as unknown as UserProfile | null;
          if (profile && typeof profile.cookie_accepted === 'boolean') {
            localStorage.setItem('cookie_pref', profile.cookie_accepted ? 'accepted' : 'rejected');
          }
        });
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <ProfileHeader />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        </div>
        <ProfileForm />
      </main>
      <CookiePopup
        onAccept={() => updateCookiePref(true)}
        onReject={() => updateCookiePref(false)}
      />
    </div>
  );
};

export default Profile;
