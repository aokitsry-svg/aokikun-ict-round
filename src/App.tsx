import { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import { IconProvider } from './IconContext';
import RoundStart from './components/RoundStart';
import MainScreen from './components/MainScreen';
import PhotoForm from './components/PhotoForm';
import ReportPreview from './components/ReportPreview';
import SavedRoundsList from './components/SavedRoundsList';
import type { Rating, Photo, RoundData, SavedChecklist, SavedRound } from './types';
import {
  seedDefaultIfFirstRun,
  getActiveId,
  setActiveId,
  addChecklist,
  deleteChecklist,
  loadSavedRounds,
  upsertSavedRound,
  deleteSavedRound,
} from './checklistStorage';

type Screen = 'start' | 'main' | 'photo-add' | 'report' | 'saved-rounds';
type MainTab = 'checklist' | 'photos' | 'evaluation';

function initLibraryAndActive(): { library: SavedChecklist[]; activeId: string } {
  const library = seedDefaultIfFirstRun();
  const savedId = getActiveId();
  const activeId = library.find((c) => c.id === savedId) ? savedId! : library[0].id;
  return { library, activeId };
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>('start');
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('checklist');
  const [photoContext, setPhotoContext] = useState<{ itemId?: string } | null>(null);

  const [{ library, activeId }, setLibraryState] = useState(initLibraryAndActive);

  const activeChecklist = library.find((c) => c.id === activeId) ?? library[0];

  const [roundData, setRoundData] = useState<RoundData>({
    inspectorName: '',
    wardName: '',
    startTime: '',
    checklistResults: [],
    generalPhotos: [],
    overallEvaluation: '',
  });

  const [savedRounds, setSavedRounds] = useState<SavedRound[]>(() => loadSavedRounds());
  const [savedRoundId, setSavedRoundId] = useState<string | null>(null);

  const handleSelectChecklist = (id: string) => {
    setActiveId(id);
    setLibraryState((prev) => ({ ...prev, activeId: id }));
  };

  const handleAddChecklist = (c: SavedChecklist) => {
    addChecklist(c);
    setLibraryState((prev) => ({ library: [...prev.library, c], activeId: prev.activeId }));
  };

  const handleDeleteChecklist = (id: string) => {
    deleteChecklist(id);
    setLibraryState((prev) => {
      const newLib = prev.library.filter((c) => c.id !== id);
      const newActiveId = prev.activeId === id ? newLib[0]?.id ?? '' : prev.activeId;
      if (newActiveId) setActiveId(newActiveId);
      return { library: newLib, activeId: newActiveId };
    });
  };

  const handleStartRound = (name: string, wardName: string) => {
    setRoundData({
      inspectorName: name,
      wardName,
      startTime: new Date().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      checklistResults: activeChecklist.categories.flatMap((cat) =>
        cat.items.map((item) => ({ itemId: item.id, rating: null, photos: [] }))
      ),
      generalPhotos: [],
      overallEvaluation: '',
      checklistName: activeChecklist.name,
    });
    setSavedRoundId(null);
    setActiveMainTab('checklist');
    setScreen('main');
  };

  const handleSaveRound = (): boolean => {
    const id = savedRoundId ?? crypto.randomUUID();
    const title =
      roundData.inspectorName +
      (roundData.wardName ? ` / ${roundData.wardName}` : '') +
      `（${roundData.startTime}）`;
    const round: SavedRound = {
      id,
      title,
      savedAt: new Date().toISOString(),
      version: 1,
      checklistId: activeId,
      roundData,
    };
    try {
      upsertSavedRound(round);
      setSavedRoundId(id);
      setSavedRounds(loadSavedRounds());
      return true;
    } catch (err) {
      const quotaExceeded =
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
      alert(
        quotaExceeded
          ? '保存容量の上限に達したため保存できませんでした。写真の枚数を減らすか、「保存済みラウンド」から不要なデータを削除してください。'
          : '保存に失敗しました。しばらくしてからもう一度お試しください。'
      );
      return false;
    }
  };

  const handleLoadRound = (round: SavedRound) => {
    const checklistExists = library.find((c) => c.id === round.checklistId);
    if (!checklistExists) {
      alert('保存時に使用したチェックリストが見つかりません。');
      return;
    }
    handleSelectChecklist(round.checklistId);
    setRoundData(round.roundData);
    setSavedRoundId(round.id);
    setActiveMainTab('checklist');
    setScreen('main');
  };

  const handleDeleteSavedRound = (id: string) => {
    deleteSavedRound(id);
    const updated = loadSavedRounds();
    setSavedRounds(updated);
    if (savedRoundId === id) setSavedRoundId(null);
  };

  const handleRatingChange = (itemId: string, rating: Rating) => {
    setRoundData((prev) => ({
      ...prev,
      checklistResults: prev.checklistResults.map((r) =>
        r.itemId === itemId ? { ...r, rating } : r
      ),
    }));
  };

  const handleAddPhoto = (photo: Photo) => {
    const itemId = photoContext?.itemId;
    if (itemId) {
      setRoundData((prev) => ({
        ...prev,
        checklistResults: prev.checklistResults.map((r) =>
          r.itemId === itemId ? { ...r, photos: [...r.photos, photo] } : r
        ),
      }));
    } else {
      setRoundData((prev) => ({
        ...prev,
        generalPhotos: [...prev.generalPhotos, photo],
      }));
    }
    setPhotoContext(null);
    setActiveMainTab('photos');
    setScreen('main');
  };

  const handleDeleteItemPhoto = (itemId: string, photoId: string) => {
    setRoundData((prev) => ({
      ...prev,
      checklistResults: prev.checklistResults.map((r) =>
        r.itemId === itemId
          ? { ...r, photos: r.photos.filter((p) => p.id !== photoId) }
          : r
      ),
    }));
  };

  const handleDeleteGeneralPhoto = (photoId: string) => {
    setRoundData((prev) => ({
      ...prev,
      generalPhotos: prev.generalPhotos.filter((p) => p.id !== photoId),
    }));
  };

  const handleEvaluationChange = (text: string) => {
    setRoundData((prev) => ({ ...prev, overallEvaluation: text }));
  };

  const handleInspectorChange = (name: string) => {
    setRoundData((prev) => ({ ...prev, inspectorName: name }));
  };

  const handleOpenPhotoAdd = (itemId?: string) => {
    setPhotoContext(itemId ? { itemId } : null);
    setScreen('photo-add');
  };

  if (screen === 'start') {
    return (
      <RoundStart
        library={library}
        activeId={activeId}
        savedRoundsCount={savedRounds.length}
        onStart={handleStartRound}
        onSelectChecklist={handleSelectChecklist}
        onAddChecklist={handleAddChecklist}
        onDeleteChecklist={handleDeleteChecklist}
        onViewSaved={() => setScreen('saved-rounds')}
      />
    );
  }

  if (screen === 'saved-rounds') {
    return (
      <SavedRoundsList
        savedRounds={savedRounds}
        onLoad={handleLoadRound}
        onDelete={handleDeleteSavedRound}
        onBack={() => setScreen('start')}
      />
    );
  }

  if (screen === 'photo-add') {
    return (
      <PhotoForm
        linkedItemId={photoContext?.itemId}
        categories={activeChecklist.categories}
        onAdd={handleAddPhoto}
        onCancel={() => { setPhotoContext(null); setScreen('main'); }}
      />
    );
  }

  if (screen === 'report') {
    return (
      <ReportPreview
        roundData={roundData}
        categories={activeChecklist.categories}
        onBack={() => setScreen('main')}
      />
    );
  }

  return (
    <MainScreen
      roundData={roundData}
      categories={activeChecklist.categories}
      activeTab={activeMainTab}
      onTabChange={setActiveMainTab}
      onRatingChange={handleRatingChange}
      onAddPhoto={handleOpenPhotoAdd}
      onDeleteItemPhoto={handleDeleteItemPhoto}
      onDeleteGeneralPhoto={handleDeleteGeneralPhoto}
      onEvaluationChange={handleEvaluationChange}
      onInspectorChange={handleInspectorChange}
      onReport={() => setScreen('report')}
      onSave={handleSaveRound}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <IconProvider>
        <AppContent />
      </IconProvider>
    </ThemeProvider>
  );
}
