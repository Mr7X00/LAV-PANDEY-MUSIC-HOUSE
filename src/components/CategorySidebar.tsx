import React from 'react';
import { Category, CategoryId, Track } from '../types';
import { CATEGORIES } from '../data/songs';
import { playButtonBeep, playCassetteDeckClick } from '../utils/soundEffects';
import { Flame, Mic, Crown, Radio, Disc, Sparkles, Monitor, Wifi, HardDrive } from 'lucide-react';

interface CategorySidebarProps {
  selectedCategoryId: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  tracks: Track[];
  soundFxEnabled: boolean;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategoryId,
  onSelectCategory,
  tracks,
  soundFxEnabled
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-4 h-4" />;
      case 'Mic': return <Mic className="w-4 h-4" />;
      case 'Crown': return <Crown className="w-4 h-4" />;
      case 'Radio': return <Radio className="w-4 h-4" />;
      case 'Disc': return <Disc className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      default: return <Disc className="w-4 h-4" />;
    }
  };

  const handleCategoryClick = (cat: Category) => {
    if (soundFxEnabled) {
      playCassetteDeckClick();
    }
    onSelectCategory(cat.id);
  };

  return (
    <aside className="w-full lg:w-72 bg-black/60 border border-white/10 rounded-lg p-4 flex flex-col justify-between gap-6 shadow-xl backdrop-blur-md">
      {/* Category List Header */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
          <h2 className="text-xs font-sans font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Select Category</span>
          </h2>
          <span className="text-[10px] font-digital text-white/40">6 Playlists</span>
        </div>

        {/* Categories Grid / List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
          {CATEGORIES.map(cat => {
            const isSelected = cat.id === selectedCategoryId;
            const categoryTracksCount = tracks.filter(t => t.categoryId === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={`relative w-full text-left p-3 rounded-md border transition-all duration-200 cursor-pointer group overflow-hidden ${
                  isSelected
                    ? 'bg-white/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] text-white'
                    : 'bg-zinc-950/60 border-white/5 text-white/60 hover:border-white/20 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Active Indicator Strip */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-l" />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${
                      isSelected 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' 
                        : 'bg-zinc-900 text-zinc-500 group-hover:text-cyan-400'
                    }`}>
                      {getCategoryIcon(cat.iconName)}
                    </div>

                    <div>
                      <h3 className={`font-sans text-sm font-bold tracking-tight ${isSelected ? 'text-cyan-300' : 'text-white/90'}`}>
                        {cat.name}
                      </h3>
                      {cat.hindiName && (
                        <p className="text-[11px] text-white/40 font-sans">{cat.hindiName}</p>
                      )}
                    </div>
                  </div>

                  <span className={`text-xs font-digital px-2 py-0.5 rounded border ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                      : 'bg-zinc-900 text-zinc-500 border-white/10'
                  }`}>
                    {categoryTracksCount} tracks
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cyber Cafe Station Status Widget */}
      <div className="bg-black/80 border border-amber-500/30 rounded-md p-3 font-sans text-xs text-zinc-300 shadow-inner">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-2">
          <div className="flex items-center gap-1.5 font-digital text-amber-400 font-bold text-[12px] tracking-wider">
            <Monitor className="w-3.5 h-3.5" />
            <span>CYBER CAFE CAB-04</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-digital">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            CONNECTED
          </span>
        </div>

        <div className="space-y-1.5 text-[11px] text-zinc-400">
          <p className="flex justify-between items-center">
            <span>Hourly Rate:</span>
            <span className="font-digital text-amber-300 text-xs">Rs. 15 / Hour</span>
          </p>
          <p className="flex justify-between items-center">
            <span>Internet Speed:</span>
            <span className="font-digital text-cyan-400 text-xs">128 kbps BSNL Broadband</span>
          </p>
          <p className="flex justify-between items-center">
            <span>MP3 Download:</span>
            <span className="font-digital text-emerald-400 text-xs">Rs. 5 / Track</span>
          </p>
          <p className="flex justify-between items-center">
            <span>Yahoo / Orkut:</span>
            <span className="text-purple-300 text-[10px]">Active</span>
          </p>
        </div>
      </div>
    </aside>
  );
};
