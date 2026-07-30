import api from './api';
import { emitStorageEvent, STORAGE_EVENTS } from '../utils/storageEvents';

export const defaultProfile = {
  profileImage: '',
  fullName: '',
  email: '',
  phone: '',
  age: '',
  gender: 'Prefer not to say',
  height: '',
  weight: '',
  activityLevel: 'Moderate',
  dailyGoal: 'Lose Weight',
};

let profileCache = { ...defaultProfile };
let profileLoaded = false;

const mergeProfile = (profile = {}) => ({
  ...defaultProfile,
  ...profile,
});

const syncProfile = (nextProfile) => {
  profileCache = mergeProfile(nextProfile);
  profileLoaded = true;
  emitStorageEvent(STORAGE_EVENTS.profile);
  return profileCache;
};

export const profileService = {
  async refreshProfile() {
    try {
      const response = await api.get('/profile');
      return syncProfile(response.data);
    } catch {
      profileLoaded = true;
      return profileCache;
    }
  },

  getProfile() {
    return mergeProfile(profileCache);
  },

  async saveProfile(profile) {
    try {
      const response = await api.patch('/profile', { ...profileCache, ...profile });
      return syncProfile(response.data);
    } catch {
      throw new Error('Unable to save profile');
    }
  },

  async resetProfile() {
    try {
      const response = await api.patch('/profile', defaultProfile);
      return syncProfile(response.data);
    } catch {
      throw new Error('Unable to reset profile');
    }
  },

  isLoaded() {
    return profileLoaded;
  },
};
