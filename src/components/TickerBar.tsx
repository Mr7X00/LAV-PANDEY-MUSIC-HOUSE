import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { ROTATING_TICKER_MESSAGES } from '../data/tickerMessages';
import { playButtonBeep } from '../utils/soundEffects';

interface TickerBarProps {
  soundFxEnabled: boolean;
}

export const TickerBar: React.FC<TickerBarProps> = ({ soundFxEnabled }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % ROTATING_TICKER_MESSAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [paused]);

  const handleNext = () => {
    if (soundFxEnabled) playButtonBeep();
    setIndex(prev => (prev + 1) % ROTATING_TICKER_MESSAGES.length);
  };

  const handlePrev = () => {
    if (soundFxEnabled) playButtonBeep();
    setIndex(prev => (prev - 1 + ROTATING_TICKER_MESSAGES.length) % ROTATING_TICKER_MESSAGES.length);
  };

  return (
    <div 
      className="relative z-10 bg-[#0d0d12] border-b border-white/10 py-1.5 px-4 sm:px-8 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-digital text-cyan-400 shrink-0">
          <Zap className="w-3.5 h-3.5 fill-cyan-400 animate-pulse" />
          <span className="hidden sm:inline font-bold uppercase tracking-widest text-xs text-cyan-400">MEMORIES TICKER:</span>
        </div>

        {/* Message Text */}
        <div className="flex-1 overflow-hidden relative">
          <p className="font-digital text-sm sm:text-base text-amber-200/90 truncate tracking-wide">
            {ROTATING_TICKER_MESSAGES[index]}
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePrev}
            className="p-1 rounded bg-black/50 text-zinc-400 hover:text-cyan-400 hover:bg-white/5 transition cursor-pointer border border-white/10"
            title="Previous Nostalgic Quote"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-digital text-white/40 px-1">
            {index + 1}/{ROTATING_TICKER_MESSAGES.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1 rounded bg-black/50 text-zinc-400 hover:text-cyan-400 hover:bg-white/5 transition cursor-pointer border border-white/10"
            title="Next Nostalgic Quote"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
