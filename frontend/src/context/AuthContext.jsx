import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { settingsService } from '../services/settingsService';
import { goalService } from '../services/goalService';
import { hydrationService } from '../services/hydrationService';
import { STORAGE_EVENTS } from '../utils/storageEvents';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncUser = () => {
      const currentProfile = profileService.getProfile();

      if (!currentProfile.email) {
        setUser(null);
        return;
      }

      setUser((currentUser) => ({
        ...(currentUser || {}),
        ...currentProfile,
        name:
          currentProfile.fullName ||
          currentProfile.email ||
          currentProfile.username ||
          'User',
        avatar: currentProfile.profileImage || '',
      }));
    };

    const bootstrapAuth = async () => {
      try {
        const currentUser = await authService.me();

        if (currentUser) {
          setUser({
            ...currentUser,
            name:
              currentUser.profile?.fullName ||
              currentUser.fullName ||
              currentUser.email ||
              currentUser.username ||
              'User',
            avatar:
              currentUser.profile?.profileImage ||
              currentUser.avatar ||
              '',
          });

          await Promise.all([
            profileService.refreshProfile(),
            settingsService.refreshSettings(),
            goalService.refreshGoal(),
            hydrationService.refreshHydration(),
          ]);
        } else {
          profileService.clearCache();
          settingsService.clearCache();
          goalService.clearCache();
          hydrationService.clearCache();
          setUser(null);
        }
      } catch {
        profileService.clearCache();
        settingsService.clearCache();
        goalService.clearCache();
        hydrationService.clearCache();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener(STORAGE_EVENTS.profile, syncUser);
    window.addEventListener('storage', syncUser);

    void bootstrapAuth();

    return () => {
      window.removeEventListener(STORAGE_EVENTS.profile, syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user?.email),

      login: async (payload) => {
        const nextUser = await authService.login(payload);

        if (nextUser?.profile) {
          await profileService.saveProfile(nextUser.profile);
        }

        if (nextUser?.settings) {
          await settingsService.saveSettings(nextUser.settings);
        }

        if (nextUser?.goal) {
          await goalService.saveGoal(nextUser.goal);
        }

        await hydrationService.refreshHydration();

        setUser({
          ...nextUser,
          name:
            nextUser?.profile?.fullName ||
            nextUser?.fullName ||
            nextUser?.email ||
            nextUser?.username ||
            'User',
          avatar:
            nextUser?.profile?.profileImage ||
            nextUser?.avatar ||
            '',
        });

        return nextUser;
      },

      register: async (payload) => {
        const nextUser = await authService.register(payload);

        if (nextUser?.profile) {
          await profileService.saveProfile(nextUser.profile);
        }

        if (nextUser?.settings) {
          await settingsService.saveSettings(nextUser.settings);
        }

        if (nextUser?.goal) {
          await goalService.saveGoal(nextUser.goal);
        }

        await hydrationService.refreshHydration();

        setUser({
          ...nextUser,
          name:
            nextUser?.profile?.fullName ||
            nextUser?.fullName ||
            nextUser?.email ||
            nextUser?.username ||
            'User',
          avatar:
            nextUser?.profile?.profileImage ||
            nextUser?.avatar ||
            '',
        });

        return nextUser;
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          profileService.clearCache();
          settingsService.clearCache();
          goalService.clearCache();
          hydrationService.clearCache();

          setUser(null);

          window.location.replace('/login');
        }
      },
    }),
    [user, isLoading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}