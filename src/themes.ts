export type ThemeName = 'warm' | 'minimal' | 'medical';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  description: string;
  startTitle: string;
  startSubtitle: string;
  backLabel: string;
  listeningLabel: string;
  photoOkLabel: string;
  commentPlaceholder: string;
}

export const themes: Record<ThemeName, ThemeConfig> = {
  warm: {
    name: 'warm',
    label: 'やさしい',
    description: '温かみのある、親しみやすいデザイン',
    startTitle: 'お疲れ様です',
    startSubtitle: '感染対策ラウンドを始めましょう\n担当者名を入力してください',
    backLabel: 'もどる',
    listeningLabel: '聞いています...',
    photoOkLabel: 'OK',
    commentPlaceholder: '気になった点をメモ...',
  },
  minimal: {
    name: 'minimal',
    label: 'ミニマル',
    description: 'モダンで洗練されたデザイン',
    startTitle: 'お疲れ様です',
    startSubtitle: 'ラウンドを開始するには担当者名を入力してください',
    backLabel: '戻る',
    listeningLabel: '入力中...',
    photoOkLabel: '撮影済み',
    commentPlaceholder: '気になった点をメモ...',
  },
  medical: {
    name: 'medical',
    label: 'メディカル',
    description: '清潔感・信頼感のある医療系デザイン',
    startTitle: 'お疲れ様です',
    startSubtitle: 'ラウンドを開始するには担当者名を入力してください',
    backLabel: '戻る',
    listeningLabel: '入力中...',
    photoOkLabel: '撮影済み',
    commentPlaceholder: '気になった点をメモ...',
  },
};

const STORAGE_KEY = 'icn-round-theme';

export function loadTheme(): ThemeName {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in themes) return saved as ThemeName;
  } catch { /* ignore */ }
  return 'warm';
}

export function saveTheme(name: ThemeName) {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch { /* ignore */ }
  document.documentElement.setAttribute('data-theme', name);
}
