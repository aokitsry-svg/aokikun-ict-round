import { useMemo } from 'react';
import type { Rating, ChecklistItemResult, ChecklistCategory } from '../types';
import { getTotalItems } from '../checklistData';
import CategoryAccordion from './CategoryAccordion';

interface Props {
  categories: ChecklistCategory[];
  checklistResults: ChecklistItemResult[];
  onRatingChange: (itemId: string, rating: Rating) => void;
  onAddPhoto: (itemId: string) => void;
}

export default function ChecklistTab({ categories, checklistResults, onRatingChange, onAddPhoto }: Props) {
  const totalItems = useMemo(() => getTotalItems(categories), [categories]);
  const ratedCount = checklistResults.filter((r) => r.rating !== null).length;
  const progress = Math.round((ratedCount / totalItems) * 100);

  return (
    <div className="px-4 py-4 space-y-3 pb-6">
      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-text-muted">入力進捗</span>
          <span className="text-xs font-bold text-primary">{ratedCount} / {totalItems}</span>
        </div>
        <div className="h-2 bg-base-deep rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: progress === 100 ? '#059669' : 'var(--t-primary)',
            }}
          />
        </div>
      </div>

      {/* Category accordions */}
      {categories.map((cat, idx) => (
        <CategoryAccordion
          key={cat.category}
          category={cat}
          results={checklistResults}
          onRatingChange={onRatingChange}
          onAddPhoto={onAddPhoto}
          defaultOpen={idx === 0}
        />
      ))}
    </div>
  );
}
