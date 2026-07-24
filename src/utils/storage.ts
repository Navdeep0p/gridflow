import { Preferences } from '@capacitor/preferences';

export const STORAGE_KEYS = {
  LEVEL: 'arrow_connect_level',
  UNLOCKED: 'arrow_connect_unlocked',
  STARS: 'arrow_connect_stars',
  STAR_DEDUCTION: 'arrow_connect_star_deduction',
  SOUND_ENABLED: 'arrow_connect_sound_enabled',
  AUDIO_VOLUME: 'arrow_connect_audio_volume',
  HAPTIC_INTENSITY: 'arrow_connect_haptic_intensity',
  APP_THEME: 'arrow_connect_app_theme',
  PROFILE_NAME: 'arrow_connect_profile_name',
  TUTORIAL_COMPLETED: 'hasCompletedTutorial',
  SELECTED_PHASE: 'arrow_connect_selected_phase',
} as const;

/**
 * Saves a key-value pair to both localStorage (for instant sync access)
 * and Capacitor Preferences (for native Android App Data persistence).
 */
export const setStorageItem = async (key: string, value: any): Promise<void> => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  
  // 1. Instant sync write to localStorage
  try {
    localStorage.setItem(key, stringValue);
  } catch (e) {
    console.warn(`localStorage set error for key ${key}:`, e);
  }

  // 2. Native App Data write via Capacitor Preferences
  try {
    await Preferences.set({
      key,
      value: stringValue,
    });
  } catch (e) {
    console.warn(`Capacitor Preferences set error for key ${key}:`, e);
  }
};

/**
 * Synchronously retrieves a key value from localStorage.
 */
export const getStorageItemSync = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultValue;

    if (typeof defaultValue === 'number') {
      const parsed = parseFloat(raw);
      return (isNaN(parsed) ? defaultValue : parsed) as unknown as T;
    }
    if (typeof defaultValue === 'boolean') {
      return (raw === 'true') as unknown as T;
    }
    if (typeof defaultValue === 'object' && defaultValue !== null) {
      return JSON.parse(raw) as T;
    }
    return raw as unknown as T;
  } catch (e) {
    return defaultValue;
  }
};

/**
 * Asynchronously loads values from Capacitor Preferences (App Data)
 * and syncs them back into localStorage on app boot.
 */
export const hydrateStorageFromNative = async (): Promise<Record<string, string>> => {
  const hydrated: Record<string, string> = {};
  const keys = Object.values(STORAGE_KEYS);

  for (const key of keys) {
    try {
      const { value } = await Preferences.get({ key });
      if (value !== null && value !== undefined) {
        localStorage.setItem(key, value);
        hydrated[key] = value;
      }
    } catch (e) {
      console.warn(`Error hydrating key ${key} from Capacitor Preferences:`, e);
    }
  }

  return hydrated;
};

/**
 * Helper to atomically persist all user data on level completion.
 */
export const saveLevelComplete = async (data: {
  level: number;
  unlockedLevel: number;
  levelStars: Record<number, number>;
  tutorialCompleted?: boolean;
}): Promise<void> => {
  await Promise.all([
    setStorageItem(STORAGE_KEYS.LEVEL, data.level),
    setStorageItem(STORAGE_KEYS.UNLOCKED, data.unlockedLevel),
    setStorageItem(STORAGE_KEYS.STARS, data.levelStars),
    ...(data.tutorialCompleted !== undefined
      ? [setStorageItem(STORAGE_KEYS.TUTORIAL_COMPLETED, String(data.tutorialCompleted))]
      : []),
  ]);
};
