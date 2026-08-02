import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Safely executes HTML5 web vibration as fallback
 */
const triggerWebVibrate = (duration: number | number[] = 15): void => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(duration);
    } catch (e) {
      // Ignore web vibration restriction or browser errors silently
    }
  }
};

/**
 * Triggers lightweight tile/cell rotation haptic feedback using @capacitor/haptics,
 * falling back to navigator.vibrate(15) if native bridge fails or on web.
 */
export const triggerTileHaptic = async (intensity: number = 1.0): Promise<void> => {
  if (intensity <= 0) return;

  try {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      } catch (e) {
        console.warn('Capacitor Haptics tile impact failed, attempting fallback:', e);
      }
    }
    triggerWebVibrate(15);
  } catch (e) {
    console.warn('Unexpected error in triggerTileHaptic:', e);
  }
};

/**
 * Triggers native Android/iOS haptic feedback using @capacitor/haptics,
 * with intensity scaling and a smooth fallback for web browsers.
 */
export const triggerHaptic = async (type: HapticType = 'light', intensity: number = 1.0): Promise<void> => {
  if (intensity <= 0) return;

  try {
    if (Capacitor.isNativePlatform()) {
      try {
        switch (type) {
          case 'light':
            await Haptics.impact({ style: ImpactStyle.Light });
            break;
          case 'medium':
            await Haptics.impact({ style: ImpactStyle.Medium });
            break;
          case 'heavy':
            await Haptics.impact({ style: ImpactStyle.Heavy });
            break;
          case 'success':
            await Haptics.notification({ type: NotificationType.Success });
            break;
          case 'warning':
            await Haptics.notification({ type: NotificationType.Warning });
            break;
          case 'error':
            await Haptics.notification({ type: NotificationType.Error });
            break;
          case 'selection':
            await Haptics.selectionChanged();
            break;
          default:
            await Haptics.vibrate({ duration: 15 });
        }
        return;
      } catch (e) {
        console.warn('Capacitor Haptics execution error, attempting fallback:', e);
      }
    }

    // Web / Browser fallback using standard HTML5 Vibrator API
    const webDuration = type === 'error' ? [30, 50, 30] : type === 'heavy' ? 30 : 15;
    triggerWebVibrate(webDuration);
  } catch (e) {
    console.warn('Unexpected error in triggerHaptic:', e);
  }
};
