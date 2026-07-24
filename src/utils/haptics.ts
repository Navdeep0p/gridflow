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
export const triggerHaptic = async (type: HapticType, intensity: number = 1.0): Promise<void> => {
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
      }
      return;
    } catch (e) {
      console.warn('Capacitor Haptics execution error, attempting fallback:', e);
    }
  }

  // Web / Browser fallback using standard HTML5 Vibrator API
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      let pattern: number | number[];
      switch (type) {
        case 'light':
        case 'selection':
          pattern = Math.max(4, Math.round(15 * intensity));
          break;
        case 'medium':
          pattern = Math.max(8, Math.round(35 * intensity));
          break;
        case 'heavy':
          pattern = Math.max(12, Math.round(70 * intensity));
          break;
        case 'success': {
          const p1 = Math.max(8, Math.round(30 * intensity));
          const gap = Math.max(8, Math.round(40 * intensity));
          const p2 = Math.max(8, Math.round(30 * intensity));
          pattern = [p1, gap, p2];
          break;
        }
        case 'warning': {
          const p1 = Math.max(12, Math.round(45 * intensity));
          const gap = Math.max(12, Math.round(50 * intensity));
          const p2 = Math.max(12, Math.round(45 * intensity));
          pattern = [p1, gap, p2];
          break;
        }
        case 'error': {
          const p1 = Math.max(25, Math.round(100 * intensity));
          const gap = Math.max(15, Math.round(40 * intensity));
          const p2 = Math.max(25, Math.round(100 * intensity));
          pattern = [p1, gap, p2];
          break;
        }
        default:
          pattern = Math.max(5, Math.round(20 * intensity));
      }
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore web vibration restriction errors
    }
  }
};
