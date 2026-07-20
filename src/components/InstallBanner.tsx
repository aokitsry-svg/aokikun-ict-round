import { useState } from 'react';
import { useIcon } from '../IconContext';
import { usePwaInstall } from '../usePwaInstall';
import { trackEvent } from '../analytics';

export default function InstallBanner() {
  const { canShowBanner, method, dismiss, promptInstall } = usePwaInstall();
  const { icon } = useIcon();
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (!canShowBanner) return null;

  const handleClick = async () => {
    trackEvent('pwa_install_banner_click', { method });
    if (method === 'prompt') {
      const outcome = await promptInstall();
      trackEvent('pwa_install_prompt_result', { outcome });
      if (outcome === 'accepted') dismiss();
    } else {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    trackEvent('pwa_install_banner_dismiss', { method });
    dismiss();
  };

  return (
    <>
      <div className="card p-4 mt-4 flex items-center gap-3">
        <img
          src={`${import.meta.env.BASE_URL}${icon.file}`}
          alt=""
          className="w-10 h-10 object-contain flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text">ホーム画面に追加</p>
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
            次回からアプリとして１タップで起動できます
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="text-xs font-bold px-3 py-2 rounded-t flex-shrink-0 transition-colors"
          style={{ backgroundColor: 'var(--t-primary)', color: '#fff' }}
        >
          追加
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-text-faint hover:text-text transition-colors p-1 flex-shrink-0"
          aria-label="閉じる"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {showIosGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-20">
          <div className="card p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-text mb-1">ホーム画面に追加する</h2>
            <p className="text-xs text-text-muted mb-5 leading-relaxed">
              Safariの共有メニューから追加できます
            </p>

            <ol className="space-y-4 mb-6">
              <li className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: 'var(--t-primary)', color: '#fff' }}
                >
                  1
                </span>
                <span className="text-sm text-text flex-1">
                  画面下の共有ボタン
                  <svg className="w-4 h-4 inline-block mx-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0-12L8 8m4-4l4 4M6 14v4a2 2 0 002 2h8a2 2 0 002-2v-4" />
                  </svg>
                  をタップ
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: 'var(--t-primary)', color: '#fff' }}
                >
                  2
                </span>
                <span className="text-sm text-text flex-1">
                  「ホーム画面に追加」を選択
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: 'var(--t-primary)', color: '#fff' }}
                >
                  3
                </span>
                <span className="text-sm text-text flex-1">
                  右上の「追加」をタップ
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="btn-primary w-full py-3 text-sm font-bold"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
