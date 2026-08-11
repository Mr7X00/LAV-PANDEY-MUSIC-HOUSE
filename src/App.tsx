import React, { useState, useEffect, useCallback } from 'react';
import { CategoryId, Track } from './types';
import { ALL_TRACKS, CATEGORIES } from './data/songs';
import { Header } from './components/Header';
import { TickerBar } from './components/TickerBar';
import { CategorySidebar } from './components/CategorySidebar';
import { SongListPanel } from './components/SongListPanel';
import { CassetteCenterpiece } from './components/CassetteCenterpiece';
import { GlassPlayer } from './components/GlassPlayer';
import { NeroCdBurnerModal, YahooChatModal, ShortcutsModal } from './components/CyberCafeExtras';
import { playButtonBeep, playCassetteDeckClick } from './utils/soundEffects';
import { HelpCircle } from 'lucide-react';

export default function App() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId>('punjabi-rap');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(ALL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(ALL_TRACKS[0].durationSeconds);

  // Settings & Toggles
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [soundFxEnabled, setSoundFxEnabled] = useState(true);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);

  // Modals State
  const [cdTracks, setCdTracks] = useState<Track[]>([ALL_TRACKS[0], ALL_TRACKS[5]]);
  const [isCdBurnerOpen, setIsCdBurnerOpen] = useState(false);
  const [isYahooChatOpen, setIsYahooChatOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Filtered tracks for current category
  const categoryTracks = ALL_TRACKS.filter(t => t.categoryId === selectedCategoryId);

  const handleTogglePlay = useCallback(() => {
    if (soundFxEnabled) playCassetteDeckClick();
    setIsPlaying(prev => !prev);
  }, [soundFxEnabled]);

  const handleSelectTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.durationSeconds);
    setIsPlaying(true);
  }, []);

  const handleNextTrack = useCallback(() => {
    if (categoryTracks.length === 0) return;
    if (shuffleOn) {
      const randomIndex = Math.floor(Math.random() * categoryTracks.length);
      handleSelectTrack(categoryTracks[randomIndex]);
    } else {
      const currentIndex = categoryTracks.findIndex(t => t.id === currentTrack?.id);
      const nextIndex = (currentIndex + 1) % categoryTracks.length;
      handleSelectTrack(categoryTracks[nextIndex]);
    }
  }, [categoryTracks, currentTrack, shuffleOn, handleSelectTrack]);

  const handlePrevTrack = useCallback(() => {
    if (categoryTracks.length === 0) return;
    const currentIndex = categoryTracks.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + categoryTracks.length) % categoryTracks.length;
    handleSelectTrack(categoryTracks[prevIndex]);
  }, [categoryTracks, currentTrack, handleSelectTrack]);

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  // Nero CD Burner Handlers
  const handleAddToCd = (track: Track) => {
    if (cdTracks.some(t => t.id === track.id)) {
      setCdTracks(prev => prev.filter(t => t.id !== track.id));
    } else {
      setCdTracks(prev => [...prev, track]);
    }
  };

  const handleRemoveCdTrack = (trackId: string) => {
    setCdTracks(prev => prev.filter(t => t.id !== trackId));
  };

  const handleClearCd = () => {
    setCdTracks([]);
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'KeyC':
          if (soundFxEnabled) playButtonBeep();
          setCrtEnabled(prev => !prev);
          break;
        case 'KeyN':
          handleNextTrack();
          break;
        case 'KeyP':
          handlePrevTrack();
          break;
        case 'KeyS':
          if (soundFxEnabled) playButtonBeep();
          setShuffleOn(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleNextTrack, handlePrevTrack, soundFxEnabled]);

  return (
    <div className={`min-h-screen bg-[#0d0d12] text-[#e0e0e0] flex flex-col justify-between pb-28 relative ${crtEnabled ? 'crt-screen' : ''}`}>
      {/* Optional CRT Overlay Layer */}
      {crtEnabled && <div className="fixed inset-0 z-40 crt-overlay pointer-events-none" />}

      {/* Top Header */}
      <Header
        crtEnabled={crtEnabled}
        setCrtEnabled={setCrtEnabled}
        soundFxEnabled={soundFxEnabled}
        setSoundFxEnabled={setSoundFxEnabled}
        onOpenCdBurner={() => setIsCdBurnerOpen(true)}
        onOpenYahooChat={() => setIsYahooChatOpen(true)}
      />

      {/* Rotating Nostalgic Ticker Bar */}
      <TickerBar soundFxEnabled={soundFxEnabled} />

      {/* Main Content Layout */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6 flex-1">
        {/* Top Section: Visual Centerpiece Boombox / Cassette Deck */}
        <CassetteCenterpiece
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          onSeek={handleSeek}
          currentTime={currentTime}
          duration={duration}
          soundFxEnabled={soundFxEnabled}
        />

        {/* Bottom Section: Category Navigation Sidebar + Interactive Song List Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4">
            <CategorySidebar
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={id => {
                setSelectedCategoryId(id);
                const firstInCat = ALL_TRACKS.find(t => t.categoryId === id);
                if (firstInCat) handleSelectTrack(firstInCat);
              }}
              tracks={ALL_TRACKS}
              soundFxEnabled={soundFxEnabled}
            />
          </div>

          <div className="lg:col-span-8">
            <SongListPanel
              selectedCategoryId={selectedCategoryId}
              tracks={ALL_TRACKS}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onSelectTrack={handleSelectTrack}
              onTogglePlay={handleTogglePlay}
              onAddToCd={handleAddToCd}
              cdTrackIds={cdTracks.map(t => t.id)}
              soundFxEnabled={soundFxEnabled}
            />
          </div>
        </div>

        {/* Floating Keyboard Shortcuts Button */}
        <button
          onClick={() => {
            if (soundFxEnabled) playButtonBeep();
            setIsShortcutsOpen(true);
          }}
          className="fixed bottom-20 right-4 z-40 p-2.5 rounded-full bg-zinc-900 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-950 transition cursor-pointer shadow-xl flex items-center gap-2 text-xs font-cyber"
          title="View Keyboard Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>
      </main>

      {/* Fixed Glassmorphism Audio Player */}
      <GlassPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onPrevTrack={handlePrevTrack}
        onNextTrack={handleNextTrack}
        currentTime={currentTime}
        duration={duration}
        setCurrentTime={setCurrentTime}
        setDuration={setDuration}
        setIsPlaying={setIsPlaying}
        shuffleOn={shuffleOn}
        setShuffleOn={setShuffleOn}
        repeatOn={repeatOn}
        setRepeatOn={setRepeatOn}
        soundFxEnabled={soundFxEnabled}
      />

      {/* Interactive Modals */}
      <NeroCdBurnerModal
        isOpen={isCdBurnerOpen}
        onClose={() => setIsCdBurnerOpen(false)}
        cdTracks={cdTracks}
        onRemoveTrack={handleRemoveCdTrack}
        onClearCd={handleClearCd}
        soundFxEnabled={soundFxEnabled}
      />

      <YahooChatModal
        isOpen={isYahooChatOpen}
        onClose={() => setIsYahooChatOpen(false)}
        soundFxEnabled={soundFxEnabled}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
