import React, { useState, useEffect } from 'react';
import { Monitor, Volume2, VolumeX, Disc, MessageSquare, Radio, Sparkles } from 'lucide-react';
import { playButtonBeep } from '../utils/soundEffects';

interface HeaderProps {
  crtEnabled: boolean;
  setCrtEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  soundFxEnabled: boolean;
  setSoundFxEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenCdBurner: () => void;
  onOpenYahooChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  crtEnabled,
  setCrtEnabled,
  soundFxEnabled,
  setSoundFxEnabled,
  onOpenCdBurner,
  onOpenYahooChat
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCrtToggle = () => {
    if (soundFxEnabled) playButtonBeep();
    setCrtEnabled(prev => !prev);
  };

  const handleSoundFxToggle = () => {
    if (!soundFxEnabled) playButtonBeep();
    setSoundFxEnabled(prev => !prev);
  };

  return (
    <header className="relative z-20 border-b border-white/10 bg-black/70 backdrop-blur-md px-4 sm:px-8 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Brand / Title Section */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-500 rounded-sm flex items-center justify-center text-black font-black text-xl italic shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            LP
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold tracking-tight italic neon-text text-cyan-400">
                LAV PANDEY MUSIC HOUSE
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-digital bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded uppercase tracking-wider">
                HQ 128 KBPS
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-sans mt-0.5">
              Est. 2004 — Cyber Cafe & Audio Recording
            </p>
          </div>
        </div>

        {/* Status Monospace Banner & Cyber Controls */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px] font-digital">
          <div className="hidden lg:flex items-center gap-4 text-right">
            <div>
              <p className="text-cyan-400 font-bold">STATUS: ONLINE</p>
              <p className="text-white/40 text-[10px]">SPEED: 128 KBPS</p>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div>
              <p className="text-amber-400 font-bold">PC #04 ACTIVE</p>
              <p className="text-white/40 underline text-[10px]">{timeStr || '10:00:00 AM'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* CRT Monitor Toggle */}
            <button
              onClick={handleCrtToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-digital border transition-all duration-200 cursor-pointer ${
                crtEnabled
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle Retro CRT Monitor Scanlines Filter (Key: C)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>CRT {crtEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={handleSoundFxToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-digital border transition-all duration-200 cursor-pointer ${
                soundFxEnabled
                  ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                  : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle Button Beeps & Cassette Clicks"
            >
              {soundFxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>FX</span>
            </button>

            {/* Nero CD Burner Launcher */}
            <button
              onClick={() => {
                if (soundFxEnabled) playButtonBeep();
                onOpenCdBurner();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-digital bg-red-950/60 border border-red-500/40 text-orange-200 hover:border-orange-400 transition-all cursor-pointer shadow-md"
              title="Open Nero Express CD Burner (Create Mix CD)"
            >
              <Disc className="w-3.5 h-3.5 text-orange-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="hidden sm:inline">Burn CD</span>
            </button>

            {/* Yahoo! Messenger Pop-up */}
            <button
              onClick={() => {
                if (soundFxEnabled) playButtonBeep();
                onOpenYahooChat();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-digital bg-purple-950/60 border border-purple-500/40 text-purple-200 hover:border-purple-400 transition-all cursor-pointer"
              title="Open Yahoo! Messenger Retro Chat"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Yahoo! Chat</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
