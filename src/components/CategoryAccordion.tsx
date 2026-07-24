import { useState } from 'react';
import type { Rating, ChecklistItemResult, ChecklistCategory } from '../types';
import RatingButtons from './RatingButtons';

interface Props {
  category: ChecklistCategory;
  results: ChecklistItemResult[];
  onRatingChange: (itemId: string, rating: Rating) => void;
  onAddPhoto: (itemId: string) => void;
  defaultOpen?: boolean;
}

export default function CategoryAccordion({
  category,
  results,
  onRatingChange,
  onAddPhoto,
  defaultOpen = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const ratedCount = category.items.filter((item) => {
    const result = results.find((r) => r.itemId === item.id);
    return result?.rating !== null && result?.rating !== undefined;
  }).length;

  const totalCount = category.items.length;
  const allDone = ratedCount === totalCount;

  return (
    <div
      className="card overflow-hidden"
      style={allDone ? { borderLeft: '3px solid #059669' } : {}}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex-1 min-w-0">
          <span className="font-bold text-sm text-text">{category.category}</span>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
          style={
            allDone
              ? { backgroundColor: '#059669', color: '#fff' }
              : { backgroundColor: 'var(--t-primary-light)', color: 'var(--t-primary)' }
          }
        >
          {ratedCount}/{totalCount}
        </span>
        <svg
          className="w-4 h-4 text-text-faint flex-shrink-0 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Items */}
      {isOpen && (
        <div className="border-t border-line divide-y divide-line">
          {category.items.map((item) => {
            const result = results.find((r) => r.itemId === item.id);
            const photoCount = result?.photos.length ?? 0;

            return (
              <div key={item.id} className="px-4 py-3 bg-base">
                <p className="text-sm text-text leading-relaxed">{item.description}</p>
                <RatingButtons
                  value={result?.rating ?? null}
                  onChange={(rating) => onRatingChange(item.id, rating)}
                />
                <button
                  type="button"
                  onClick={() => onAddPhoto(item.id)}
                  className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-line bg-surface px-3 py-2.5 text-xs font-bold text-text-muted transition-colors hover:border-primary hover:text-primary"
                  aria-label={`${item.description}に写真を追加`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{photoCount > 0 ? `写真を追加（${photoCount}枚）` : 'この項目に写真を追加'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
