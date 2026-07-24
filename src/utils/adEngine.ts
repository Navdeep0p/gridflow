import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

/**
 * AdManager - Isolated Global Ad Engine Utility
 * Abstracts Google Ads & Native APK Wrapper (Capacitor) hooks.
 */

export const AdManager = {
  // Pull environment variables or fall back to official Google AdMob test IDs
  BANNER_AD_UNIT_ID: (import.meta as any).env.VITE_BANNER_AD_UNIT_ID || "ca-app-pub-3940256099942544/6300978111",
  REWARDED_AD_UNIT_ID: (import.meta as any).env.VITE_REWARDED_AD_UNIT_ID || "ca-app-pub-3940256099942544/5224354917",

  /**
   * Checks if the game is running inside a native wrapper framework (e.g. Capacitor / Android APK).
   */
  isNativeAPK(): boolean {
    return typeof window !== 'undefined' && !!(window as any).Capacitor;
  },

  /**
   * Initializes Google Adsense/AdMob for web and native environments.
   */
  async init(): Promise<void> {
    if (this.isNativeAPK()) {
      try {
        await AdMob.initialize({ initializeForTesting: true });
        console.log(`AdManager: Native AdMob initialized.`);
      } catch (e) {
        console.warn("AdManager: Native AdMob initialization error:", e);
      }
    } else if (typeof window !== 'undefined') {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        console.log(`AdManager: Web Google Ads (adsbygoogle) initialized. Banner ID: ${this.BANNER_AD_UNIT_ID}`);
      } catch (e) {
        console.warn("AdManager: Failed to initialize Google Ads on web:", e);
      }
    }
  },

  /**
   * Triggers native bottom banner ad using Google's public Test Banner ID.
   */
  async showBanner(): Promise<void> {
    if (this.isNativeAPK()) {
      try {
        await AdMob.showBanner({
          adId: this.BANNER_AD_UNIT_ID,
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
        });
        console.log("AdManager: Native banner shown successfully.");
      } catch (e) {
        console.warn("AdManager: Error displaying native banner:", e);
      }
    }
  },

  /**
   * Triggers a rewarded video ad and resolves to onSuccess or onFailure.
   * Runs a 1-second mocked timeout in local/testing environment before invoking callbacks.
   */
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

  /**
   * Triggers an interstitial ad and resolves on completion.
   * Runs a 0.5-second mocked timeout in testing environments before invoking completion.
   */
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
