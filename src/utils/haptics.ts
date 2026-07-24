import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Triggers native Android/iOS haptic feedback using @capacitor/haptics,
 * with intensity scaling and a smooth fallback for web browsers.
 *
 * @param type The type of haptic feedback to play.
 * @param intensity Haptic intensity scalar between 0 and 1. If 0, haptics are suppressed.
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
          await Haptics.vibrate({ duration: 10 });
      }
      return;
    } catch (e) {
      console.warn('Capacitor Haptics execution error, attempting fallback:', e);
    }
  }

  // Web / Browser fallback using standard HTML5 Vibrator API (default 10ms)
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(10);
    } catch (e) {
      // Ignore web vibration restriction errors
    }
  }
};
