import { useMemo, useState } from 'react';
import { useIcon } from '../IconContext';
import type { Rating, RoundData, ChecklistCategory } from '../types';
import { getTotalItems } from '../checklistData';
import ThemeSelector from './ThemeSelector';
import ChecklistTab from './ChecklistTab';
import PhotoTab from './PhotoTab';
import EvaluationTab from './EvaluationTab';
import BottomTabBar from './BottomTabBar';

type MainTab = 'checklist' | 'photos' | 'evaluation';

interface Props {
  roundData: RoundData;
  categories: ChecklistCategory[];
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onRatingChange: (itemId: string, rating: Rating) => void;
  onAddPhoto: (itemId?: string) => void;
  onDeleteItemPhoto: (itemId: string, photoId: string) => void;
  onDeleteGeneralPhoto: (photoId: string) => void;
  onEvaluationChange: (text: string) => void;
  onInspectorChange: (name: string) => void;
  onReport: () => void;
  onSave: () => boolean;
}

export default function MainScreen({
  roundData,
  categories,
  activeTab,
  onTabChange,
  onRatingChange,
  onAddPhoto,
  onDeleteItemPhoto,
  onDeleteGeneralPhoto,
  onEvaluationChange,
  onInspectorChange,
  onReport,
  onSave,
}: Props) {
  const { icon } = useIcon();
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [editingInspector, setEditingInspector] = useState(false);
  const [inspectorDraft, setInspectorDraft] = useState('');
  const totalItems = useMemo(() => getTotalItems(categories), [categories]);
  const ratedCount = roundData.checklistResults.filter((r) => r.rating !== null).length;
  const totalPhotoCount =
    roundData.checklistResults.reduce((sum, r) => sum + r.photos.length, 0) +
    roundData.generalPhotos.length;

  const startEditInspector = () => {
    setInspectorDraft(roundData.inspectorName);
    setEditingInspector(true);
  };

  const commitInspector = () => {
    onInspectorChange(inspectorDraft.trim());
    setEditingInspector(false);
  };

  return (
    <div className="min-h-screen bg-base">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-lg border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={icon.file} alt={icon.alt} className="w-12 h-9 object-contain flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-text leading-tight">あおき君 感染対策ラウンド</h1>
            {editingInspector ? (
              <input
                type="text"
                autoFocus
                value={inspectorDraft}
                onChange={(e) => setInspectorDraft(e.target.value)}
                onBlur={commitInspector}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitInspector();
                  if (e.key === 'Escape') setEditingInspector(false);
                }}
                placeholder="参加者名"
                className="w-full bg-base border-2 border-primary rounded px-2 py-0.5 text-xs text-text"
              />
            ) : (
              <button
                type="button"
                onClick={startEditInspector}
                className="flex items-center gap-1 text-xs text-text-muted truncate max-w-full"
              >
                <span className="truncate">
                  参加者: {roundData.inspectorName || '（未入力）'}
                  {roundData.wardName ? `・${roundData.wardName}` : ''}
                </span>
                <svg className="w-3 h-3 flex-shrink-0 text-text-faint" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={
                ratedCount === totalItems
                  ? { backgroundColor: '#059669', color: '#fff' }
                  : { backgroundColor: 'var(--t-primary-light)', color: 'var(--t-primary)' }
              }
            >
              {ratedCount}/{totalItems}
            </span>
            <button
              type="button"
              onClick={() => {
                const ok = onSave();
                if (!ok) return;
                setSavedFeedback(true);
                setTimeout(() => setSavedFeedback(false), 2000);
              }}
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-colors"
              style={
                savedFeedback
                  ? { backgroundColor: '#059669', color: '#fff' }
                  : { backgroundColor: 'var(--t-primary-light)', color: 'var(--t-primary)' }
              }
              aria-label="保存"
            >
              {savedFeedback ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              <span>{savedFeedback ? '保存済み' : '保存'}</span>
            </button>
            <ThemeSelector />
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="pb-20">
        {activeTab === 'checklist' && (
          <ChecklistTab
            categories={categories}
            checklistResults={roundData.checklistResults}
            onRatingChange={onRatingChange}
          />
        )}
        {activeTab === 'photos' && (
          <PhotoTab
            categories={categories}
            checklistResults={roundData.checklistResults}
            generalPhotos={roundData.generalPhotos}
            onAddPhoto={onAddPhoto}
            onDeleteItemPhoto={onDeleteItemPhoto}
            onDeleteGeneralPhoto={onDeleteGeneralPhoto}
          />
        )}
        {activeTab === 'evaluation' && (
          <EvaluationTab
            value={roundData.overallEvaluation}
            onChange={onEvaluationChange}
          />
        )}
      </div>

      {/* Bottom tab bar */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onReport={onReport}
        photoCount={totalPhotoCount}
        hasEvaluation={roundData.overallEvaluation.trim().length > 0}
      />
    </div>
  );
}
