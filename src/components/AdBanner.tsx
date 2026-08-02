import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPluginEvents } from '@capacitor-community/admob';

import { AD_CONFIG } from '../config/adConfig';

export const AdBanner: React.FC = () => {
  const [isNative, setIsNative] = useState<boolean>(false);
  const [adError, setAdError] = useState<boolean>(false);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);

    if (native) {
      // Listen for native AdMob banner load errors
      const errorListener = AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err) => {
        console.warn("Native AdMob Banner failed to load:", err);
        setAdError(true);
      });

      return () => {
        errorListener.then((handle) => handle.remove()).catch(() => {});
      };
    } else {
      try {
        if (typeof window !== 'undefined') {
          if (!navigator.onLine) {
            setAdError(true);
          } else {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          }
        }
      } catch (e) {
        console.warn("AdBanner web ad blocker or script error:", e);
        setAdError(true);
      }
    }
  }, []);

  // If ad failed to load (due to network failure, missing fill, or ad blocker), display sleek fallback message
  if (adError) {
    return (
      <div className="w-full flex items-center justify-center px-4">
        <div 
          id="ad-banner-fallback"
          className="w-full max-w-[320px] py-2.5 px-4 flex items-center justify-center bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-xl text-center shadow-xs"
        >
          <span className="text-[11px] font-mono text-amber-700 dark:text-amber-300 font-medium tracking-tight">
            Please turn off your ad blocker to support GridFlow.
          </span>
        </div>
      </div>
    );
  }

  // On Native platform: hide web fallback placeholder and reserve an invisible 60px spacer in DOM
  if (isNative) {
    return (
      <div className="w-full flex items-center justify-center">
        <div 
          id="ad-banner-spacer" 
          className="w-full max-w-[320px] h-[60px] min-h-[60px] pointer-events-none opacity-0"
          style={{ height: '60px' }}
          aria-hidden="true"
        />
      </div>
    );
  }

  // On Web platform: display centered 320x50 standard placeholder UI
  const adUnitId = AD_CONFIG.BANNER_ID;
  const [adClient, adSlot] = adUnitId.includes('/') ? adUnitId.split('/') : ["ca-pub-3940256099942544", adUnitId];

  return (
    <div className="w-full flex items-center justify-center">
      <div 
        id="ad-banner-container"
        className="w-full max-w-[320px] h-[50px] min-h-[50px] relative py-1 px-2 flex items-center justify-center bg-neutral-100 dark:bg-zinc-950/40 border border-dashed border-neutral-300 dark:border-white/10 rounded-xl text-[10px] font-mono text-neutral-500 dark:text-zinc-500 uppercase tracking-[0.15em] transition-all overflow-hidden"
      >
        <div className="w-full h-full relative flex items-center justify-center">
          {/* Standard Responsive Web AdSense / AdMob Slot markup */}
          <ins 
            className="adsbygoogle"
            style={{ display: 'block', width: '320px', height: '50px' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format="horizontal"
            data-full-width-responsive="false"
          />
          {/* Aesthetic placeholder when external ad script is inactive */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-neutral-100/90 dark:bg-zinc-950/90 gap-0.5">
            <span className="font-bold text-neutral-600 dark:text-zinc-400">Sponsored Ad Space</span>
            <span className="text-[8px] text-neutral-500 dark:text-zinc-600 tracking-normal normal-case">Responsive Google Ads Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
