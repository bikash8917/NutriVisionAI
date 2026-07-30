const createEvent = (name) => new CustomEvent(name);

export const STORAGE_EVENTS = {
  meals: 'nutrivisionai:meals-updated',
  profile: 'nutrivisionai:profile-updated',
  settings: 'nutrivisionai:settings-updated',
};

export const emitStorageEvent = (name) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(createEvent(name));
};

