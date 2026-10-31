import { Platform } from 'react-native';

export const homeTheme = {
  blue: '#4170BE',
  ink: '#152C50',
  onBlue: '#FFFFFF',
  androidSurface: '#ECF1FC',
  androidIndicator: '#D2E1FF',
  label: '#47566E',
};
export function bottomBarHeight(bottomInset: number) {
  return Platform.OS === 'ios' ? 12 + 72 + Math.max(bottomInset, 12) : 80 + bottomInset;
}
