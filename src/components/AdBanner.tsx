import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPluginEvents } from '@capacitor-community/admob';

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
      <div 
        id="ad-banner-fallback"
        className="w-full py-2.5 px-4 flex items-center justify-center bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-xl text-center shadow-xs"
      >
        <span className="text-[11px] font-mono text-amber-700 dark:text-amber-300 font-medium tracking-tight">
          Please turn off your ad blocker to support GridFlow.
        </span>
      </div>
    );
  }

  // On Native platform: hide web fallback placeholder and reserve an invisible 60px spacer in DOM
  if (isNative) {
    return (
      <div 
        id="ad-banner-spacer" 
        className="w-full h-[60px] min-h-[60px] pointer-events-none opacity-0"
        style={{ height: '60px' }}
        aria-hidden="true"
      />
    );
  }

  // On Web platform: display standard placeholder UI
  const adUnitId = (import.meta as any).env.VITE_BANNER_AD_UNIT_ID || "ca-app-pub-3940256099942544/6300978111";
  const [adClient, adSlot] = adUnitId.includes('/') ? adUnitId.split('/') : ["ca-pub-3940256099942544", adUnitId];

  return (
    <div 
      id="ad-banner-container"
      className="w-full min-h-[50px] relative py-2 px-3 flex items-center justify-center bg-neutral-100 dark:bg-zinc-950/40 border border-dashed border-neutral-300 dark:border-white/10 rounded-xl text-[10px] font-mono text-neutral-500 dark:text-zinc-500 uppercase tracking-[0.15em] transition-all overflow-hidden"
    >
      <div className="w-full relative flex items-center justify-center min-h-[40px]">
        {/* Standard Responsive Web AdSense / AdMob Slot markup */}
        <ins 
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '50px' }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
        {/* Aesthetic placeholder when external ad script is inactive */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-neutral-100/90 dark:bg-zinc-950/90 gap-0.5">
          <span className="font-bold text-neutral-600 dark:text-zinc-400">Sponsored Ad Space</span>
          <span className="text-[8px] text-neutral-500 dark:text-zinc-600 tracking-normal normal-case">Responsive Google Ads Active</span>
        </div>
      </div>
    </div>
  );
};
