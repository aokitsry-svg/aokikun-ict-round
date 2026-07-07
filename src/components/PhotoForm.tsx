import { useState, useRef } from 'react';
import { useTheme } from '../ThemeContext';
import type { Photo, ChecklistCategory } from '../types';
import { findItemById } from '../checklistData';

interface Props {
  linkedItemId?: string;
  categories: ChecklistCategory[];
  onAdd: (photo: Photo) => void;
  onCancel: () => void;
}

export default function PhotoForm({ linkedItemId, categories, onAdd, onCancel }: Props) {
  const { theme } = useTheme();
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [photoSize, setPhotoSize] = useState<{ width: number; height: number } | null>(null);
  const [comment, setComment] = useState('');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const linkedItem = linkedItemId ? findItemById(categories, linkedItemId) : undefined;

  async function compressImage(file: File, maxWidth = 640, quality = 0.8): Promise<{ dataUrl: string; width: number; height: number }> {
    // imageOrientation: 'from-image' で EXIF の回転をピクセルへ反映する
    // （スマホ縦撮影の写真が90度回転する問題への対処）
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    let width = bitmap.width;
    let height = bitmap.height;
    if (width > maxWidth) {
      height = Math.round(height * (maxWidth / width));
      width = maxWidth;
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) { bitmap.close(); throw new Error('Canvas not supported'); }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return { dataUrl: canvas.toDataURL('image/jpeg', quality), width, height };
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください');
      return;
    }
    try {
      const { dataUrl, width, height } = await compressImage(file);
      setPhotoDataUrl(dataUrl);
      setPhotoSize({ width, height });
    } catch {
      alert('ファイルの読み込みに失敗しました');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl) return;
    onAdd({
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      dataUrl: photoDataUrl,
      comment: comment.trim(),
      timestamp: new Date().toLocaleString('ja-JP'),
      width: photoSize?.width,
      height: photoSize?.height,
    });
  };

  return (
    <div className="min-h-screen bg-base">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-lg border-b border-line px-5 py-3.5 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="text-text-muted text-sm font-bold hover:text-text transition-colors duration-200 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {theme.backLabel}
        </button>
        <h2 className="text-sm font-bold text-text">写真を追加</h2>
        <div className="w-14" />
      </div>

      <form onSubmit={handleSubmit} className="animate-page px-5 py-5 space-y-4">
        {/* Linked item indicator */}
        {linkedItem && (
          <div className="card px-4 py-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-text-faint font-bold uppercase tracking-wider">紐付き項目</p>
              <p className="text-xs text-text font-medium leading-tight mt-0.5 line-clamp-2">{linkedItem.description}</p>
            </div>
          </div>
        )}

        {/* Photo */}
        <div className="card p-4">
          <label className="block text-sm font-bold text-text-muted mb-2">写真</label>
          {photoDataUrl ? (
            <div className="relative animate-pop">
              <img src={photoDataUrl} alt="撮影済み" className="w-full rounded-t max-h-60 object-cover" />
              <button
                type="button"
                onClick={() => { setPhotoDataUrl(''); if (cameraInputRef.current) cameraInputRef.current.value = ''; if (galleryInputRef.current) galleryInputRef.current.value = ''; }}
                className="absolute top-2.5 right-2.5 bg-text/50 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-2.5 left-2.5 bg-ok text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {theme.photoOkLabel}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="bg-primary-light/50 border-2 border-dashed border-primary/30 rounded-t py-8 text-primary hover:bg-primary-light hover:border-primary/50 transition-all duration-200 flex flex-col items-center gap-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-bold">撮影</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="bg-primary-light/50 border-2 border-dashed border-primary/30 rounded-t py-8 text-primary hover:bg-primary-light hover:border-primary/50 transition-all duration-200 flex flex-col items-center gap-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-bold">ギャラリーから選択</span>
              </button>
            </div>
          )}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            className="hidden"
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="hidden"
          />
        </div>

        {/* Comment */}
        <div className="card p-4">
          <label htmlFor="photo-comment" className="block text-sm font-bold text-text-muted mb-2">コメント</label>
          <textarea
            id="photo-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={theme.commentPlaceholder}
            rows={3}
            className="w-full bg-base border-2 border-line rounded-t px-4 py-3 text-base text-text placeholder:text-text-faint transition-all duration-200 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!photoDataUrl}
          className="btn-primary w-full py-4 text-base font-bold"
        >
          追加する
        </button>
      </form>
    </div>
  );
}
