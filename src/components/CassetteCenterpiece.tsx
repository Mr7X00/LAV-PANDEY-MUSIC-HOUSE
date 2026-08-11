import React, { useState } from 'react';
import { Track, EqualizerPreset } from '../types';
import { Play, Pause, RotateCcw, FastForward, Rewind, Disc, Radio, Sliders } from 'lucide-react';
import { playButtonBeep, playCassetteDeckClick } from '../utils/soundEffects';

interface CassetteCenterpieceProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onSeek: (seconds: number) => void;
  currentTime: number;
  duration: number;
  soundFxEnabled: boolean;
}

export const CassetteCenterpiece: React.FC<CassetteCenterpieceProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onSeek,
  currentTime,
  duration,
  soundFxEnabled
}) => {
  const [tapeLabel, setTapeLabel] = useState('Lav Pandey Mix Tape Vol. 1 - 2004 Hits');
  const [eqPreset, setEqPreset] = useState<EqualizerPreset>('bass-boost');
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Calculate left vs right tape spool radius dynamically based on track progress
  // Left reel starts full (~42px) and shrinks to ~16px; Right reel starts ~16px and grows to ~42px
  const leftSpoolRadius = 42 - (progressPercent * 0.26);
  const rightSpoolRadius = 16 + (progressPercent * 0.26);

  const handleEqClick = (preset: EqualizerPreset) => {
    if (soundFxEnabled) playButtonBeep();
    setEqPreset(preset);
  };

  const handleSeekOffset = (seconds: number) => {
    if (soundFxEnabled) playCassetteDeckClick();
    onSeek(Math.max(0, Math.min(duration, currentTime + seconds)));
  };

  return (
    <div className="w-full bg-zinc-950/90 border-2 border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden crt-screen backdrop-blur-md">
      {/* Background Vintage Metallic Texture Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-zinc-950/90 to-black pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Boombox Control Header & Equalizer Presets */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_10px_#ef4444] animate-pulse" />
            <span className="font-cyber font-bold text-xs text-zinc-300 uppercase tracking-widest">
              SONY HIGH DENSITY TAPE DECK • MODEL TC-2000
            </span>
          </div>

          {/* Winamp Equalizer Presets */}
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-lg">
            <Sliders className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-1" />
            <span className="text-[10px] font-cyber text-zinc-400 mr-1 hidden md:inline">EQ:</span>
            {(['flat', 'bass-boost', 'techno', 'rock', 'vocal'] as EqualizerPreset[]).map(p => (
              <button
                key={p}
                onClick={() => handleEqClick(p)}
                className={`px-2 py-0.5 text-[10px] font-cyber uppercase rounded transition cursor-pointer ${
                  eqPreset === p
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {p.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Main Boombox Layout: Left Speaker - Central Cassette Tape - Right Speaker */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Speaker Cone */}
          <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center">
            <div className={`relative w-28 h-28 rounded-full bg-zinc-900 border-4 border-zinc-800 flex items-center justify-center shadow-inner transition-transform duration-100 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
              <div className="w-20 h-20 rounded-full bg-zinc-950 border-2 border-zinc-700 flex items-center justify-center shadow-inner">
                <div className={`w-10 h-10 rounded-full bg-zinc-800 border border-zinc-600 transition-all ${isPlaying ? 'scale-110 border-cyan-400' : ''}`} />
              </div>
              {/* Speaker Grille Accent */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
            </div>
            <span className="text-[10px] font-digital text-zinc-500 mt-2">LEFT CHANNEL</span>
          </div>

          {/* CENTRAL CASSETTE DECK */}
          <div className="lg:col-span-8 flex flex-col items-center">
            {/* Cassette Shell Body */}
            <div className="w-full max-w-lg cassette-body rounded-xl p-4 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.8)] relative">
              {/* Cassette Corner Screws */}
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-800" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-800" />
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-800" />
              <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-800" />

              {/* Editable / Handwritten Cassette Label */}
              <div className="bg-amber-100/90 text-zinc-900 rounded border-2 border-amber-300 p-2 mb-4 text-center shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-600/80" />
                
                <div className="flex items-center justify-between text-[10px] font-digital text-zinc-700 uppercase tracking-widest font-bold mb-1">
                  <span>SIDE A • HIGH BIAS TYPE II</span>
                  <span className="text-red-700 font-extrabold">NORMAL POSITION 120µs</span>
                </div>

                {isEditingLabel ? (
                  <input
                    type="text"
                    value={tapeLabel}
                    onChange={e => setTapeLabel(e.target.value)}
                    onBlur={() => setIsEditingLabel(false)}
                    onKeyDown={e => e.key === 'Enter' && setIsEditingLabel(false)}
                    autoFocus
                    className="w-full bg-amber-50 text-center font-sans font-bold text-sm text-zinc-900 border border-amber-400 rounded px-1 focus:outline-none"
                  />
                ) : (
                  <div 
                    onClick={() => setIsEditingLabel(true)}
                    className="font-sans font-bold text-sm text-zinc-900 truncate cursor-pointer hover:text-red-800 transition"
                    title="Click to customize Cassette Label"
                  >
                    {currentTrack ? `A: ${currentTrack.title} — ${currentTrack.artist}` : tapeLabel}
                  </div>
                )}
              </div>

              {/* Transparent Tape Window */}
              <div className="w-full bg-black/90 border-2 border-zinc-700 rounded-lg p-3 sm:p-4 relative flex items-center justify-between overflow-hidden shadow-inner min-h-[110px]">
                {/* Magnetic Tape Ribbon Line between reels */}
                <div className="absolute top-1/2 left-10 right-10 h-3 bg-zinc-900 border-y border-amber-900/40 -translate-y-1/2 pointer-events-none" />

                {/* Left Reel Wheel */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    {/* Dark Tape Wound on Reel */}
                    <div 
                      className="rounded-full bg-amber-950 border border-amber-900 shadow-md transition-all duration-300"
                      style={{ width: `${leftSpoolRadius * 2}px`, height: `${leftSpoolRadius * 2}px` }}
                    />
                    {/* Spinning Reel Hole Center */}
                    <div className={`absolute reel-hole flex items-center justify-center shadow-lg ${isPlaying ? 'spin-slow' : 'spin-paused'}`}>
                      <div className="w-8 h-8 rounded-full border-2 border-zinc-600 bg-zinc-950 flex items-center justify-center">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4]" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-digital text-white/40 mt-1">REEL 1</span>
                </div>

                {/* Real-time Animated Equalizer / Spectrum in Center Window */}
                <div className="relative z-10 flex items-end justify-center gap-1.5 h-16 px-4">
                  {[...Array(9)].map((_, i) => {
                    let speed = '0.5s';
                    if (eqPreset === 'bass-boost' && (i === 0 || i === 1 || i === 2)) speed = '0.3s';
                    if (eqPreset === 'techno') speed = '0.4s';

                    return (
                      <div key={i} className="w-2.5 h-full bg-zinc-950 rounded-t border border-white/10 flex items-end overflow-hidden">
                        <div 
                          className={`w-full rounded-t transition-all ${
                            isPlaying
                              ? i > 6 ? 'bg-red-500 eq-bar-anim' : i > 4 ? 'bg-amber-400 eq-bar-anim' : 'bg-cyan-400 eq-bar-anim'
                              : 'bg-zinc-700 h-[10%]'
                          }`}
                          style={{
                            animationDuration: isPlaying ? speed : '0s',
                            animationDelay: `${i * 0.08}s`
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Right Reel Wheel */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    {/* Dark Tape Wound on Reel */}
                    <div 
                      className="rounded-full bg-amber-950 border border-amber-900 shadow-md transition-all duration-300"
                      style={{ width: `${rightSpoolRadius * 2}px`, height: `${rightSpoolRadius * 2}px` }}
                    />
                    {/* Spinning Reel Hole Center */}
                    <div className={`absolute reel-hole flex items-center justify-center shadow-lg ${isPlaying ? 'spin-slow' : 'spin-paused'}`}>
                      <div className="w-8 h-8 rounded-full border-2 border-zinc-600 bg-zinc-950 flex items-center justify-center">
                        <div className="w-3 h-3 bg-pink-400 rounded-full shadow-[0_0_8px_#ec4899]" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-digital text-white/40 mt-1">REEL 2</span>
                </div>
              </div>
            </div>

            {/* PHYSICAL BOOMBOX CONTROL DECK BUTTONS */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-5 flex-wrap">
              {/* REWIND (-10s) */}
              <button
                onClick={() => handleSeekOffset(-10)}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-b from-zinc-700 to-zinc-800 border-2 border-zinc-600 active:border-zinc-400 text-zinc-200 font-cyber text-xs shadow-lg hover:from-zinc-600 hover:to-zinc-700 transition cursor-pointer flex items-center gap-1.5"
                title="Rewind 10 seconds"
              >
                <Rewind className="w-4 h-4" />
                <span className="hidden sm:inline">REW</span>
              </button>

              {/* PREVIOUS TRACK */}
              <button
                onClick={() => {
                  if (soundFxEnabled) playCassetteDeckClick();
                  onPrevTrack();
                }}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-b from-zinc-700 to-zinc-800 border-2 border-zinc-600 active:border-zinc-400 text-zinc-200 font-cyber text-xs shadow-lg hover:from-zinc-600 hover:to-zinc-700 transition cursor-pointer flex items-center gap-1.5"
                title="Previous Track"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">PREV</span>
              </button>

              {/* MAIN PLAY / PAUSE BUTTON */}
              <button
                onClick={() => {
                  if (soundFxEnabled) playCassetteDeckClick();
                  onTogglePlay();
                }}
                className={`px-6 py-2.5 rounded-lg font-cyber text-sm font-bold border-2 shadow-xl transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
                  isPlaying
                    ? 'bg-gradient-to-b from-cyan-400 to-cyan-600 border-cyan-300 text-black shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                    : 'bg-gradient-to-b from-emerald-500 to-emerald-700 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              {/* NEXT TRACK */}
              <button
                onClick={() => {
                  if (soundFxEnabled) playCassetteDeckClick();
                  onNextTrack();
                }}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-b from-zinc-700 to-zinc-800 border-2 border-zinc-600 active:border-zinc-400 text-zinc-200 font-cyber text-xs shadow-lg hover:from-zinc-600 hover:to-zinc-700 transition cursor-pointer flex items-center gap-1.5"
                title="Next Track"
              >
                <FastForward className="w-4 h-4" />
                <span className="hidden sm:inline">NEXT</span>
              </button>

              {/* FAST FORWARD (+10s) */}
              <button
                onClick={() => handleSeekOffset(10)}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-b from-zinc-700 to-zinc-800 border-2 border-zinc-600 active:border-zinc-400 text-zinc-200 font-cyber text-xs shadow-lg hover:from-zinc-600 hover:to-zinc-700 transition cursor-pointer flex items-center gap-1.5"
                title="Fast Forward 10 seconds"
              >
                <FastForward className="w-4 h-4" />
                <span className="hidden sm:inline">FF</span>
              </button>
            </div>
          </div>

          {/* Right Speaker Cone */}
          <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center">
            <div className={`relative w-28 h-28 rounded-full bg-zinc-900 border-4 border-zinc-800 flex items-center justify-center shadow-inner transition-transform duration-100 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
              <div className="w-20 h-20 rounded-full bg-zinc-950 border-2 border-zinc-700 flex items-center justify-center shadow-inner">
                <div className={`w-10 h-10 rounded-full bg-zinc-800 border border-zinc-600 transition-all ${isPlaying ? 'scale-110 border-pink-400' : ''}`} />
              </div>
              <div className="absolute inset-0 rounded-full border border-pink-500/20" />
            </div>
            <span className="text-[10px] font-digital text-zinc-500 mt-2">RIGHT CHANNEL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
