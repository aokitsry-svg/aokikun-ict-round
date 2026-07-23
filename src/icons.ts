import aokikunLogoUrl from '../assets/aokikun-logo.png';
export type IconName = 'aokikun';

export interface IconConfig {
  name: IconName;
  label: string;
  description: string;
  file: string;
  alt: string;
}

export const icons: Record<IconName, IconConfig> = {
  aokikun: {
    name: 'aokikun',
    label: 'あおき君',
    description: '院内感染ラウンドを支援するキャラクターロゴ',
    file: aokikunLogoUrl,
    alt: 'あおき君',
  },
};

const STORAGE_KEY = 'aokikun-round-icon';

export function loadIcon(): IconName {
  return 'aokikun';
}

export function saveIcon(name: IconName) {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch { /* ignore */ }
}
