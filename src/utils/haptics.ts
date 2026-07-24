import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Triggers lightweight tile/cell rotation haptic feedback using @capacitor/haptics,
 * falling back to navigator.vibrate(15) if native bridge fails or on web.
 */
export const triggerTileHaptic = async (intensity: number = 1.0): Promise<void> => {
  if (intensity <= 0) return;

  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      return;
    } catch (e) {
      console.warn('Capacitor Haptics failed, attempting fallback:', e);
    }
  }

  // Fallback to HTML5 Vibrator API (15ms pattern)
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(15);
    } catch (e) {
      // Ignore web vibration errors
    }
  }
};

/**
 * Triggers native Android/iOS haptic feedback using @capacitor/haptics,
 * with intensity scaling and a smooth fallback for web browsers.
 */
export const triggerHaptic = async (type: HapticType = 'light', intensity: number = 1.0): Promise<void> => {
  if (intensity <= 0) return;

  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
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

  // Web / Browser fallback using standard HTML5 Vibrator API (default 15ms)
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(15);
    } catch (e) {
      // Ignore web vibration restriction errors
    }
  }
};
