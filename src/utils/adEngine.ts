import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
  RewardAdOptions,
  AdOptions
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Official Google AdMob Test Ad Unit IDs for Android
const TEST_BANNER_AD_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";
const TEST_INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712";
const TEST_REWARDED_AD_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";

let isAdMobInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Initializes AdMob SDK natively before any ad requests occur.
 */
export const initializeAdMob = async (): Promise<void> => {
  if (isAdMobInitialized) return;

  if (!initPromise) {
    initPromise = (async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await AdMob.initialize({ initializeForTesting: true });
          isAdMobInitialized = true;
          console.log("AdMob SDK initialized successfully on native platform.");
        } catch (e) {
          console.error("AdMob SDK initialization error:", e);
        }
      } else if (typeof window !== 'undefined') {
        try {
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          isAdMobInitialized = true;
          console.log("AdMob/Google Ads web initialized.");
        } catch (e) {
          console.warn("AdMob web initialization warning:", e);
        }
      }
    })();
  }

  await initPromise;
};

/**
 * Renders native AdMob bottom banner using Google's public Test Banner ID.
 */
export const renderBanner = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    try {
      await initializeAdMob();
      const adId = (import.meta as any).env.VITE_BANNER_AD_UNIT_ID || TEST_BANNER_AD_UNIT_ID;
      await AdMob.showBanner({
        adId,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
      console.log("Native AdMob banner rendered successfully.");
    } catch (e) {
      console.error("Error rendering native AdMob banner:", e);
    }
  }
};

/**
 * AdManager - Isolated Global Ad Engine Utility
 */
export const AdManager = {
  BANNER_AD_UNIT_ID: (import.meta as any).env.VITE_BANNER_AD_UNIT_ID || TEST_BANNER_AD_UNIT_ID,
  INTERSTITIAL_AD_UNIT_ID: (import.meta as any).env.VITE_INTERSTITIAL_AD_UNIT_ID || TEST_INTERSTITIAL_AD_UNIT_ID,
  REWARDED_AD_UNIT_ID: (import.meta as any).env.VITE_REWARDED_AD_UNIT_ID || TEST_REWARDED_AD_UNIT_ID,

  isNativeAPK(): boolean {
    return Capacitor.isNativePlatform();
  },

  async init(): Promise<void> {
    await initializeAdMob();
  },

  async showBanner(): Promise<void> {
    await renderBanner();
  },

  async showRewardedAd(onSuccess: () => void, onFailure: () => void): Promise<void> {
    const unitId = this.REWARDED_AD_UNIT_ID;
    console.log(`AdManager: showRewardedAd requested. Unit ID: ${unitId}`);

    const handleFailure = (errorReason?: string) => {
      console.error("AdManager Rewarded Ad Failure:", errorReason);
      if (typeof window !== 'undefined') {
        alert("Failed to load reward ad. Please turn off your ad blocker or check your internet connection to claim your reward.");
      }
      try {
        onFailure();
      } catch (err) {
        console.error("Error in onFailure handler:", err);
      }
    };

    if (this.isNativeAPK()) {
      try {
        await this.init();
        const options: RewardAdOptions = {
          adId: unitId,
          isTesting: true,
        };
        console.log(`AdManager: Preparing native Rewarded Ad with Unit ID: ${unitId}`);
        await AdMob.prepareRewardVideoAd(options);

        console.log("AdManager: Prepared Rewarded Ad. Showing video...");
        const result = await AdMob.showRewardVideoAd();
        console.log("AdManager: Rewarded Ad finished playing with result:", result);

        if (result) {
          onSuccess();
        } else {
          handleFailure("Reward ad did not produce reward item.");
        }
      } catch (e: any) {
        handleFailure(e?.message || String(e));
      }
    } else {
      console.log(`AdManager: Web environment detected for Unit ID: ${unitId}`);
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          handleFailure("Browser offline");
          return;
        }

        console.log("AdManager: Simulating web rewarded ad playback...");
        setTimeout(() => {
          try {
            console.log("AdManager: Web rewarded ad completed successfully.");
            onSuccess();
          } catch (e) {
            console.error("AdManager Error in onSuccess callback:", e);
            handleFailure(String(e));
          }
        }, 1000);
      } catch (e: any) {
        handleFailure(e?.message || String(e));
      }
    }
  },

  async showInterstitialAd(onComplete?: () => void): Promise<void> {
    const unitId = this.INTERSTITIAL_AD_UNIT_ID;
    console.log(`AdManager: showInterstitialAd requested. Unit ID: ${unitId}`);

    if (this.isNativeAPK()) {
      try {
        await this.init();
        const options: AdOptions = {
          adId: unitId,
          isTesting: true,
        };
        console.log(`AdManager: Preparing native Interstitial Ad with Unit ID: ${unitId}`);
        await AdMob.prepareInterstitial(options);

        console.log("AdManager: Prepared Interstitial Ad. Showing ad...");
        await AdMob.showInterstitial();
        console.log("AdManager: Interstitial Ad finished.");

        if (onComplete) onComplete();
      } catch (e) {
        console.error("Error loading/showing native Interstitial ad:", e);
        if (onComplete) onComplete();
      }
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
