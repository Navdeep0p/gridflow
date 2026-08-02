/**
 * AdMob Configuration Module
 * Reads environment variables with official Google Android Test Ad Unit IDs as default fallbacks.
 */

export const GOOGLE_TEST_AD_UNITS = {
  APP_ID: 'ca-app-pub-3940256099942544~3347511713',
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
} as const;

export const AD_CONFIG = {
  APP_ID: (import.meta as any).env.VITE_ADMOB_APP_ID || GOOGLE_TEST_AD_UNITS.APP_ID,
  BANNER_ID: (import.meta as any).env.VITE_ADMOB_BANNER_ID || GOOGLE_TEST_AD_UNITS.BANNER,
  INTERSTITIAL_ID: (import.meta as any).env.VITE_ADMOB_INTERSTITIAL_ID || GOOGLE_TEST_AD_UNITS.INTERSTITIAL,
  REWARDED_ID: (import.meta as any).env.VITE_ADMOB_REWARDED_ID || GOOGLE_TEST_AD_UNITS.REWARDED,
  
  // Reward amount per ad watch
  REWARD_STARS_AMOUNT: 5,
} as const;

export default AD_CONFIG;
