import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export function useAccessibilityPreferences() {
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [reduceTransparency, setReduceTransparency] = useState(true);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive) setReduceMotion(value); }).catch(() => { if (alive) setReduceMotion(false); });
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isReduceTransparencyEnabled().then(value => { if (alive) setReduceTransparency(value); }).catch(() => { if (alive) setReduceTransparency(true); });
    }
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const transparency = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);
    return () => { alive = false; motion.remove(); transparency.remove(); };
  }, []);
  return { reduceMotion, reduceTransparency };
}
