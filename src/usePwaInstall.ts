import { useEffect, useState } from 'react';

const BANNER_DISMISSED_KEY = 'pwa_banner_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallMethod = 'prompt' | 'ios-manual';

function isStandalone(): boolean {
  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  // Chrome/Firefox for iOS はホーム画面追加に対応しないため除外する
  return isIos && !/CriOS|FxiOS/.test(ua);
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(BANNER_DISMISSED_KEY));
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const method: InstallMethod | null = deferredPrompt
    ? 'prompt'
    : isIosSafari()
      ? 'ios-manual'
      : null;

  const dismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, '1');
    setDismissed(true);
  };

  const promptInstall = async (): Promise<'accepted' | 'dismissed'> => {
    if (!deferredPrompt) return 'dismissed';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome;
  };

  return {
    canShowBanner: !installed && !dismissed && method !== null,
    method,
    dismiss,
    promptInstall,
  };
}
