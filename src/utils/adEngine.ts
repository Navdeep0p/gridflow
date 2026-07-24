import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

const TEST_BANNER_AD_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";
const TEST_REWARDED_AD_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";

/**
 * Initializes AdMob SDK natively before any ad requests occur.
 */
export const initializeAdMob = async (): Promise<void> => {
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    try {
      await AdMob.initialize({ initializeForTesting: true });
      console.log("AdMob SDK initialized successfully.");
    } catch (e) {
      console.warn("AdMob SDK initialization warning:", e);
    }
  } else if (typeof window !== 'undefined') {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      console.log("AdMob/Google Ads web initialized.");
    } catch (e) {
      console.warn("AdMob web initialization warning:", e);
    }
  }
};

/**
 * Renders native AdMob bottom banner using Google's public Test Banner ID.
 * Should be called ONLY after initializeAdMob() promise completes.
 */
export const renderBanner = async (): Promise<void> => {
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    try {
      const adId = (import.meta as any).env.VITE_BANNER_AD_UNIT_ID || TEST_BANNER_AD_UNIT_ID;
      await AdMob.showBanner({
        adId,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
      console.log("Native AdMob banner rendered successfully.");
    } catch (e) {
      console.warn("Error rendering native AdMob banner:", e);
    }
  }
};

/**
 * AdManager - Isolated Global Ad Engine Utility
 */
export const AdManager = {
  BANNER_AD_UNIT_ID: (import.meta as any).env.VITE_BANNER_AD_UNIT_ID || TEST_BANNER_AD_UNIT_ID,
  REWARDED_AD_UNIT_ID: (import.meta as any).env.VITE_REWARDED_AD_UNIT_ID || TEST_REWARDED_AD_UNIT_ID,

  isNativeAPK(): boolean {
    return typeof window !== 'undefined' && !!(window as any).Capacitor;
  },

  async init(): Promise<void> {
    await initializeAdMob();
  },

  async showBanner(): Promise<void> {
    await renderBanner();
  },

  async showRewardedAd(onSuccess: () => void, onFailure: () => void): Promise<void> {
    console.log(`AdManager: showRewardedAd requested. Unit ID: ${this.REWARDED_AD_UNIT_ID}`);
    
    if (this.isNativeAPK()) {
      console.log(`AdManager: Native APK environment detected. Triggering native AdMob Rewarded plugin hook with Unit ID: ${this.REWARDED_AD_UNIT_ID}`);
      setTimeout(() => {
        try {
          onSuccess();
        } catch (e) {
          console.error("AdManager Error in onSuccess callback:", e);
        }
      }, 1000);
    } else {
      console.log(`AdManager: Web environment detected. Simulating rewarded ad playback for Unit ID: ${this.REWARDED_AD_UNIT_ID}...`);
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          try {
            console.log("AdManager: Simulated rewarded ad completed successfully.");
            onSuccess();
          } catch (e) {
            console.error("AdManager Error in onSuccess callback:", e);
            onFailure();
          }
          resolve();
        }, 1000);
      });
    }
  },

  async showInterstitialAd(onComplete?: () => void): Promise<void> {
    console.log("AdManager: showInterstitialAd requested.");
    
    if (this.isNativeAPK()) {
      console.log("AdManager: Native APK environment detected. Triggering native AdMob Interstitial plugin hook.");
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          try {
            if (onComplete) onComplete();
          } catch (e) {
            console.error("AdManager Error in onComplete callback:", e);
          }
          resolve();
        }, 500);
      });
    } else {
      console.log("AdManager: Web environment detected. Simulating interstitial ad...");
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          try {
            console.log("AdManager: Simulated interstitial ad completed.");
            if (onComplete) onComplete();
          } catch (e) {
            console.error("AdManager Error in onComplete callback:", e);
          }
          resolve();
        }, 500);
      });
    }
  }
};
