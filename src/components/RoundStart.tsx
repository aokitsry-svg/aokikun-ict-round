import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { useIcon } from '../IconContext';
import ThemeSelector from './ThemeSelector';
import ChecklistImportDialog from './ChecklistImportDialog';
import InstallBanner from './InstallBanner';
import type { SavedChecklist } from '../types';

interface Props {
  library: SavedChecklist[];
  activeId: string;
  savedRoundsCount: number;
  onStart: (name: string, wardName: string) => void;
  onSelectChecklist: (id: string) => void;
  onAddChecklist: (c: SavedChecklist) => void;
  onDeleteChecklist: (id: string) => void;
  onViewSaved: () => void;
}

export default function RoundStart({
  library,
  activeId,
  savedRoundsCount,
  onStart,
  onSelectChecklist,
  onAddChecklist,
  onDeleteChecklist,
  onViewSaved,
}: Props) {
  const [name, setName] = useState('');
  const [wardName, setWardName] = useState('');
  const [showImport, setShowImport] = useState(false);
  const { theme } = useTheme();
  const { icon } = useIcon();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onStart(name.trim(), wardName.trim());
  };

  const handleSaveImport = (c: SavedChecklist) => {
    onAddChecklist(c);
    onSelectChecklist(c.id);
    setShowImport(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('このチェックリストを削除しますか？')) return;
    onDeleteChecklist(id);
  };

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-6">
      <div className="fixed top-4 right-4 z-10">
        <ThemeSelector />
      </div>

      <div className="animate-page w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <img src={icon.file} alt={icon.alt} className="w-full max-w-[340px] h-auto object-contain drop-shadow-md" />
        </div>

        {/* Guidance */}
        <div className="text-center mb-5">
          <p className="text-text-muted text-sm leading-relaxed whitespace-pre-line">{theme.startSubtitle}</p>
        </div>

        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-left text-xs leading-relaxed text-amber-900">
          <p className="font-bold">公開デモ版です</p>
          <p className="mt-1">実在する患者名、顔写真、診療情報、院内機密などは入力せず、架空のテストデータだけでお試しください。</p>
        </div>

        {/* Checklist selector */}
        <div className="card p-4 mb-4 space-y-2">
          <div className="mb-1">
            <span className="text-xs font-bold text-text-muted">使用するチェックリスト</span>
          </div>

          {library.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-t cursor-pointer transition-colors"
              style={
                c.id === activeId
                  ? { backgroundColor: 'var(--t-primary-light)', border: '1.5px solid var(--t-primary)' }
                  : { backgroundColor: 'var(--t-base)', border: '1.5px solid var(--t-line)' }
              }
              onClick={() => onSelectChecklist(c.id)}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                style={
                  c.id === activeId
                    ? { borderColor: 'var(--t-primary)', backgroundColor: 'var(--t-primary)' }
                    : { borderColor: 'var(--t-line)', backgroundColor: 'transparent' }
                }
              >
                {c.id === activeId && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text truncate">{c.name}</p>
                <p className="text-[10px] text-text-faint">
                  {c.categories.length}カテゴリ・{c.categories.reduce((s, cat) => s + cat.items.length, 0)}項目
                  {c.isDefault && <span className="ml-1 text-primary font-bold">（標準）</span>}
                </p>
              </div>
              {library.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                  className="text-text-faint hover:text-red-500 transition-colors p-1"
                  aria-label="削除"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold border-2 rounded-t transition-colors"
            style={{ borderColor: 'var(--t-primary)', color: 'var(--t-primary)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            新しいチェックリストを追加する
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-text-muted mb-2">参加者</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 山田 花子"
              className="w-full bg-base border-2 border-line rounded-t px-4 py-3.5 text-base text-text placeholder:text-text-faint transition-all duration-200"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-muted mb-2">
              病棟名
              <span className="text-text-faint font-normal ml-1">（任意）</span>
            </label>
            <input
              type="text"
              value={wardName}
              onChange={(e) => setWardName(e.target.value)}
              placeholder="例: 3階東病棟"
              className="w-full bg-base border-2 border-line rounded-t px-4 py-3.5 text-base text-text placeholder:text-text-faint transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="btn-primary w-full py-4 text-base font-bold"
          >
            ラウンド開始
          </button>

          <button
            type="button"
            onClick={onViewSaved}
            className="w-full py-3 text-sm font-bold border-2 border-line rounded-t text-text-muted hover:text-text hover:border-primary transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            保存済みラウンドを開く
            {savedRoundsCount > 0 && (
              <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--t-primary-light)', color: 'var(--t-primary)' }}>
                {savedRoundsCount}
              </span>
            )}
          </button>
        </form>

        <InstallBanner />

        <p className="text-center text-text-faint text-xs mt-10">院内感染ラウンド支援アプリ「{icon.label}」 v{__APP_VERSION__} (build {__BUILD_DATE__})</p>
      </div>

      {showImport && (
        <ChecklistImportDialog
          onSave={handleSaveImport}
          onCancel={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
