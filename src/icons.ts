export type IconName = 'ran' | 'meguru';

export interface IconConfig {
  name: IconName;
  label: string;
  description: string;
  file: string;
  alt: string;
}

export const icons: Record<IconName, IconConfig> = {
  ran: {
    name: 'ran',
    label: 'らんちゃん',
    description: '感染対策ラウンドの看護師キャラクター',
    file: 'ran-icon.png',
    alt: 'らんちゃん',
  },
  meguru: {
    name: 'meguru',
    label: 'めぐる君',
    description: '感染対策ラウンドの男の子キャラクター',
    file: 'meguru.png',
    alt: 'めぐる君',
  },
};

const STORAGE_KEY = 'icn-round-icon';

export function loadIcon(): IconName {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in icons) return saved as IconName;
  } catch { /* ignore */ }
  return 'meguru';
}

export function saveIcon(name: IconName) {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch { /* ignore */ }
}
