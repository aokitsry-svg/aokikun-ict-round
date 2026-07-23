import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../ThemeContext';
import {
  Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel,
  BorderStyle, AlignmentType, Table, TableRow, TableCell, WidthType, VerticalAlign,
  ShadingType, TableLayoutType,
} from 'docx';
import { saveAs } from 'file-saver';
import type { RoundData, Photo, ChecklistCategory } from '../types';
import { findItemById } from '../checklistData';

// Variant A 検証中: type を省略しているため一時的に未使用（Variant B/恒久対応で復活）
// const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const RATING_HEX: Record<string, string> = {
  A: '059669',
  B: 'D4A017',
  C: 'DC2626',
};

interface Props {
  roundData: RoundData;
  categories: ChecklistCategory[];
  onBack: () => void;
}

function getCssHex(varName: string): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  const hex = raw.replace('#', '');
  return /^[0-9a-fA-F]{6}$/.test(hex) ? hex : 'CCCCCC';
}

function fitContain(w?: number, h?: number, frame = 150): { width: number; height: number } {
  if (!w || !h) return { width: 148, height: 111 };
  const scale = Math.min(frame / w, frame / h);
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

function base64ToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let j = 0; j < binaryStr.length; j++) {
    bytes[j] = binaryStr.charCodeAt(j);
  }
  return bytes;
}

export default function ReportPreview({ roundData, categories, onBack }: Props) {
  const { theme } = useTheme();
  const reportRef = useRef<HTMLDivElement>(null);
  // docx は写真込みだと生成に時間がかかるため、プレビュー表示時に事前生成して File をキャッシュする。
  // iOS では navigator.share() をタップ直後（transient activation 中）に await を挟まず呼ぶ必要があり、
  // 生成を待ってから share すると共有/メール画面が即閉じてしまうため。
  const [shareFile, setShareFile] = useState<File | null>(null);
  const canShare = (() => {
    if (typeof navigator === 'undefined' || !('share' in navigator)) return false;
    // Variant A: type を省略（DOCX_MIME を渡すと iOS メール共有が即閉じる問題の検証）
    const testFile = new File([''], 'test.docx');
    return navigator.canShare?.({ files: [testFile] }) ?? false;
  })();

  const buildDocxBlob = async (): Promise<Blob> => {
    const clr = {
      primary:    getCssHex('--t-primary'),
      primaryLt:  getCssHex('--t-primary-light'),
      base:       getCssHex('--t-base'),
      text:       getCssHex('--t-text'),
      textMuted:  getCssHex('--t-text-muted'),
      textFaint:  getCssHex('--t-text-faint'),
      line:       getCssHex('--t-line'),
    };

    const children: (Paragraph | Table)[] = [];

    // ===== Title =====
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [new TextRun({ text: 'あおき君 感染対策ラウンド報告書', bold: true, size: 32, color: clr.text })],
    }));

    children.push(new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: '担当者: ', bold: true, color: clr.textMuted }),
        new TextRun({ text: roundData.inspectorName, color: clr.text }),
        new TextRun('　'),
        new TextRun({ text: '病棟: ', bold: true, color: clr.textMuted }),
        new TextRun({ text: roundData.wardName || '—', color: clr.text }),
        new TextRun('　'),
        new TextRun({ text: '実施日時: ', bold: true, color: clr.textMuted }),
        new TextRun({ text: roundData.startTime, color: clr.text }),
      ],
    }));

    children.push(new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: clr.primary } },
      spacing: { after: 300 },
      children: [],
    }));

    // ===== Section 1: Checklist Table =====
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 160 },
      children: [new TextRun({ text: '1', bold: true, size: 26, color: clr.primary }), new TextRun({ text: '  チェックリスト', bold: true, size: 26, color: clr.text })],
    }));

    {
      const checklistRows: TableRow[] = [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 1300, type: WidthType.DXA },
              shading: { type: ShadingType.SOLID, color: clr.primaryLt, fill: clr.primaryLt },
              children: [new Paragraph({ children: [new TextRun({ text: 'ジャンル', bold: true, size: 18, color: clr.primary })] })],
            }),
            new TableCell({
              width: { size: 7126, type: WidthType.DXA },
              shading: { type: ShadingType.SOLID, color: clr.primaryLt, fill: clr.primaryLt },
              children: [new Paragraph({ children: [new TextRun({ text: 'チェック項目', bold: true, size: 18, color: clr.primary })] })],
            }),
            new TableCell({
              width: { size: 600, type: WidthType.DXA },
              shading: { type: ShadingType.SOLID, color: clr.primaryLt, fill: clr.primaryLt },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '評価', bold: true, size: 18, color: clr.primary })] })],
            }),
          ],
        }),
      ];

      for (const cat of categories) {
        for (const item of cat.items) {
          const result = roundData.checklistResults.find((r) => r.itemId === item.id);
          const rating = result?.rating ?? '—';
          const ratingColor = rating !== '—' ? RATING_HEX[rating] : clr.textFaint;

          checklistRows.push(new TableRow({
            children: [
              new TableCell({
                width: { size: 1300, type: WidthType.DXA },
                shading: { type: ShadingType.SOLID, color: 'FFFFFF', fill: 'FFFFFF' },
                children: [new Paragraph({ children: [new TextRun({ text: cat.category, size: 18, color: clr.textMuted })] })],
              }),
              new TableCell({
                width: { size: 7126, type: WidthType.DXA },
                shading: { type: ShadingType.SOLID, color: 'FFFFFF', fill: 'FFFFFF' },
                children: [new Paragraph({ children: [new TextRun({ text: item.description, size: 18, color: clr.text })] })],
              }),
              new TableCell({
                width: { size: 600, type: WidthType.DXA },
                shading: { type: ShadingType.SOLID, color: 'FFFFFF', fill: 'FFFFFF' },
                children: [new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: rating, bold: true, size: 22, color: ratingColor })],
                })],
              }),
            ],
          }));
        }
      }

      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: [1300, 7126, 600], rows: checklistRows }));
      children.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
    }

    // ===== Section 2: Photos =====
    const itemPhotosExist = roundData.checklistResults.some((r) => r.photos.length > 0);
    const generalPhotosExist = roundData.generalPhotos.length > 0;

    if (itemPhotosExist || generalPhotosExist) {
      children.push(new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: clr.line } },
        spacing: { before: 300 },
        children: [],
      }));
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 160 },
        children: [new TextRun({ text: '2', bold: true, size: 26, color: clr.primary }), new TextRun({ text: '  写真記録とICTコメント', bold: true, size: 26, color: clr.text })],
      }));

      const allDocxPhotos: { photo: Photo; label: string }[] = [];
      for (const result of roundData.checklistResults) {
        if (result.photos.length === 0) continue;
        const item = findItemById(categories, result.itemId);
        for (const photo of result.photos) {
          allDocxPhotos.push({ photo, label: `${item?.category ?? ''}: ${item?.description?.slice(0, 20) ?? ''}` });
        }
      }
      for (const photo of roundData.generalPhotos) {
        allDocxPhotos.push({ photo, label: '' });
      }

      for (let i = 0; i < allDocxPhotos.length; i += 3) {
        const rowEntries = allDocxPhotos.slice(i, i + 3);
        while (rowEntries.length < 3) rowEntries.push({ photo: null as unknown as Photo, label: '' });

        children.push(new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3009, 3009, 3008],
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({
              children: rowEntries.map((entry, idx) => {
                if (!entry.photo) {
                  return new TableCell({
                    width: { size: idx === 2 ? 3008 : 3009, type: WidthType.DXA },
                    children: [new Paragraph({ children: [] })],
                  });
                }
                const cellChildren: Paragraph[] = [
                  new Paragraph({ spacing: { after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: entry.label, size: 16, bold: true, color: clr.primary })] }),
                ];
                try {
                  cellChildren.push(new Paragraph({
                    spacing: { after: 40 },
                    alignment: AlignmentType.CENTER, children: [new ImageRun({ data: base64ToUint8Array(entry.photo.dataUrl), transformation: fitContain(entry.photo.width, entry.photo.height), type: 'jpg' })],
                  }));
                } catch { /* skip */ }
                if (entry.photo.comment) {
                  cellChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: entry.photo.comment, size: 16 })] }));
                }
                return new TableCell({
                  width: { size: idx === 2 ? 3008 : 3009, type: WidthType.DXA },
                  children: cellChildren, verticalAlign: VerticalAlign.CENTER,
                });
              }),
            }),
          ],
        }));
        children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
      }
    }

    // ===== Section 3: Evaluation =====
    children.push(new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 2, color: clr.line } },
      spacing: { before: 300 },
      children: [],
    }));
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 160 },
      children: [new TextRun({ text: '3', bold: true, size: 26, color: clr.primary }), new TextRun({ text: '  総評', bold: true, size: 26, color: clr.text })],
    }));

    if (roundData.overallEvaluation.trim()) {
      const lines = roundData.overallEvaluation.split('\n');
      for (const line of lines) {
        children.push(new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: line, size: 22, color: clr.text })],
        }));
      }
    } else {
      children.push(new Paragraph({
        children: [new TextRun({ text: '（記載なし）', size: 22, color: clr.textFaint })],
      }));
    }

    const doc = new Document({ sections: [{ children }] });
    return Packer.toBlob(doc);
  };

  const filename = `aokikun_round_${new Date().toISOString().slice(0, 10)}.docx`;

  // プレビュー表示時に docx を事前生成して File をキャッシュしておく。
  // roundData / categories はこの画面の表示中に変化しないため生成は1回でよい。
  useEffect(() => {
    let cancelled = false;
    buildDocxBlob()
      .then((blob) => {
        // Variant A: type を省略（手動添付と同様に OS が拡張子から MIME を推定させる）
        if (!cancelled) setShareFile(new File([blob], filename));
      })
      .catch((err) => {
        console.error('DOCX生成エラー:', err);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExportDocx = () => {
    if (!shareFile) return;
    if (canShare) {
      // iOS では transient activation が切れると共有画面が即閉じるため、
      // await を挟まずキャッシュ済みの File を同期的に share する。
      // メール作成画面は title/text が無いと中身ゼロで開いて即閉じるため件名・本文を付ける。
      // AirDrop の転送失敗はファイル名の半角英数化で対処済み。
      navigator.share({
        title: 'あおき君 感染対策ラウンド報告書',
        text: `${roundData.inspectorName} - ${new Date().toISOString().slice(0, 10)}`,
        files: [shareFile],
      }).catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        saveAs(shareFile, filename);
      });
    } else {
      saveAs(shareFile, filename);
    }
  };

  const ratedCount = roundData.checklistResults.filter((r) => r.rating !== null).length;
  const totalItems = roundData.checklistResults.length;
  const totalPhotos =
    roundData.checklistResults.reduce((s, r) => s + r.photos.length, 0) +
    roundData.generalPhotos.length;

  return (
    <div className="min-h-screen bg-base">
      {/* Header */}
      <div className="print-hidden sticky top-0 z-10 bg-surface/90 backdrop-blur-lg border-b border-line px-5 py-3.5 flex items-center justify-between">
        <button onClick={onBack} className="text-text-muted text-sm font-bold hover:text-text transition-colors duration-200 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {theme.backLabel}
        </button>
        <button
          onClick={handleExportDocx}
          disabled={!shareFile}
          className="btn-primary px-5 py-2.5 text-sm font-bold flex items-center gap-1.5 disabled:opacity-50"
        >
          {canShare ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          {!shareFile ? '準備中…' : canShare ? '共有' : 'Word出力'}
        </button>
        <button type="button" onClick={() => window.print()} className="px-4 py-2.5 text-sm font-bold border-2 border-line rounded-t text-text-muted hover:text-text hover:border-primary transition-colors">印刷・PDF保存</button>
      </div>

      {/* Report preview */}
      <div className="animate-page px-4 py-5 pb-10">
        <div ref={reportRef} className="print-report card p-5 max-w-2xl mx-auto space-y-6">
          {/* Title */}
          <div className="text-center pb-4">
            <h1 className="text-lg font-extrabold text-text">あおき君 感染対策ラウンド報告書</h1>
            <div className="w-12 h-1 bg-primary rounded-full mx-auto mt-3" />
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '担当者', value: roundData.inspectorName },
              { label: '病棟', value: roundData.wardName || '—' },
              { label: '実施日時', value: roundData.startTime },
              { label: 'チェック', value: `${ratedCount}/${totalItems}項目` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-base rounded-t px-3 py-2.5">
                <p className="text-[10px] text-text-faint font-bold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-bold text-text mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Section 1: Checklist */}
          <div>
            <h2 className="text-sm font-extrabold text-text mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-extrabold flex items-center justify-center" style={{ boxShadow: 'var(--t-btn-glow)' }}>1</span>
              チェックリスト
            </h2>
            <table className="w-full text-xs border-collapse rounded-t overflow-hidden">
              <thead>
                <tr className="bg-white">
                  <th className="text-left px-2 py-1.5 font-bold text-text-muted border border-line w-[14%]">ジャンル</th>
                  <th className="text-left px-2 py-1.5 font-bold text-text-muted border border-line">チェック項目</th>
                  <th className="text-center px-2 py-1.5 font-bold text-text-muted border border-line w-[7%]">評価</th>
                </tr>
              </thead>
              <tbody>
                {categories.flatMap((cat) =>
                  cat.items.map((item) => {
                    const result = roundData.checklistResults.find((r) => r.itemId === item.id);
                    const rating = result?.rating;
                    return (
                      <tr key={item.id} className="border-t border-line">
                        <td className="px-2 py-1.5 border border-line bg-white text-text-muted align-top leading-relaxed">{cat.category}</td>
                        <td className="px-2 py-1.5 border border-line text-text leading-relaxed">{item.description}</td>
                        <td className="px-2 py-1.5 border border-line text-center align-middle">
                          <span
                            className="inline-flex items-center justify-center w-7 h-7 rounded font-extrabold"
                            style={
                              rating
                                ? { backgroundColor: RATING_HEX[rating] + '22', color: RATING_HEX[rating], border: `1.5px solid ${RATING_HEX[rating]}` }
                                : { backgroundColor: 'transparent', color: 'var(--t-text-faint)' }
                            }
                          >
                            {rating ?? '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Section 2: Photos */}
          {totalPhotos > 0 && (
            <div>
              <h2 className="text-sm font-extrabold text-text mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-extrabold flex items-center justify-center" style={{ boxShadow: 'var(--t-btn-glow)' }}>2</span>
                写真記録とICTコメント
                <span className="text-xs font-normal text-text-muted">（{totalPhotos}枚）</span>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {roundData.checklistResults.filter((r) => r.photos.length > 0).flatMap((result) => {
                  const item = findItemById(categories, result.itemId);
                  return result.photos.map((photo) => (
                    <div key={photo.id} className="print-avoid-break rounded overflow-hidden bg-base border border-line">
                      <p className="px-1.5 py-1 text-[9px] font-bold text-primary truncate bg-base-deep">{item?.category}：{item?.description.slice(0, 20)}{item && item.description.length > 20 ? '…' : ''}</p>
                      <img src={photo.dataUrl} alt="" className="w-full aspect-square object-contain bg-base" />
                      {photo.comment && <p className="px-1.5 py-1 text-[9px] text-text-muted line-clamp-2">{photo.comment}</p>}
                    </div>
                  ));
                })}
                {roundData.generalPhotos.map((photo) => (
                  <div key={photo.id} className="print-avoid-break rounded overflow-hidden bg-base border border-line">
                    <img src={photo.dataUrl} alt="" className="w-full aspect-square object-contain bg-base" />
                    {photo.comment && <p className="px-1.5 py-1 text-[9px] text-text-muted line-clamp-2">{photo.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Evaluation */}
          <div>
            <h2 className="text-sm font-extrabold text-text mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-extrabold flex items-center justify-center" style={{ boxShadow: 'var(--t-btn-glow)' }}>3</span>
              総評
            </h2>
            {roundData.overallEvaluation.trim() ? (
              <div className="bg-base rounded-t px-4 py-3">
                <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">{roundData.overallEvaluation}</p>
              </div>
            ) : (
              <p className="text-sm text-text-faint italic px-1">（総評は未入力です）</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
