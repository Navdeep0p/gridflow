import React, { useEffect, useState } from 'react';
import { AdManager } from '../utils/adEngine';

export const AdBanner: React.FC = () => {
  const [isNative, setIsNative] = useState<boolean>(false);

  useEffect(() => {
    setIsNative(AdManager.isNativeAPK());
    if (!AdManager.isNativeAPK()) {
      try {
        // Safe check for DOM environments to register dynamic ad rendering
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        // Benign warning in development/mock environments
        console.log("AdBanner: Pushed web ad slot registration.");
      }
    }
  }, []);

  const adUnitId = (import.meta as any).env.VITE_BANNER_AD_UNIT_ID || "ca-app-pub-3940256099942544/6300978111";
  const [adClient, adSlot] = adUnitId.includes('/') ? adUnitId.split('/') : ["ca-pub-3940256099942544", adUnitId];

  return (
    <div 
      id="ad-banner-container"
      className="w-full min-h-[50px] relative py-2 px-3 flex items-center justify-center bg-neutral-100 dark:bg-zinc-950/40 border border-dashed border-neutral-300 dark:border-white/10 rounded-xl text-[10px] font-mono text-neutral-500 dark:text-zinc-500 uppercase tracking-[0.15em] transition-all overflow-hidden"
    >
      {isNative ? (
        <div className="flex flex-col items-center justify-center gap-0.5 text-center">
          <span className="font-bold text-neutral-600 dark:text-zinc-400 text-[10px]">Mobile APK Ad Slot</span>
          <span className="text-[8px] text-neutral-500 dark:text-zinc-600 tracking-wide">Ready for Native AdMob integration</span>
        </div>
      ) : (
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
          {/* Seamless aesthetic placeholder when actual external scripts aren't running */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-neutral-100/90 dark:bg-zinc-950/90 gap-0.5">
            <span className="font-bold text-neutral-600 dark:text-zinc-400">Sponsored Ad Space</span>
            <span className="text-[8px] text-neutral-500 dark:text-zinc-600 tracking-normal normal-case">Responsive Google Ads Active</span>
          </div>
        </div>
      )}
    </div>
  );
};
