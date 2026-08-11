import React, { useState } from 'react';
import { Track, CategoryId } from '../types';
import { CATEGORIES } from '../data/songs';
import { Play, Pause, Search, Music, Disc, Sparkles, Volume2, PlusCircle, Check } from 'lucide-react';
import { playButtonBeep, playCassetteDeckClick } from '../utils/soundEffects';

interface SongListPanelProps {
  selectedCategoryId: CategoryId;
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  onTogglePlay: () => void;
  onAddToCd: (track: Track) => void;
  cdTrackIds: string[];
  soundFxEnabled: boolean;
}

export const SongListPanel: React.FC<SongListPanelProps> = ({
  selectedCategoryId,
  tracks,
  currentTrack,
  isPlaying,
  onSelectTrack,
  onTogglePlay,
  onAddToCd,
  cdTrackIds,
  soundFxEnabled
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const currentCategory = CATEGORIES.find(c => c.id === selectedCategoryId) || CATEGORIES[0];

  const handleImportYoutubeUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    let youtubeId = customUrl.trim();
    if (youtubeId.includes('list=')) {
      const match = youtubeId.match(/list=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) youtubeId = match[1];
    } else if (youtubeId.includes('v=')) {
      const match = youtubeId.match(/v=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) youtubeId = match[1];
    } else if (youtubeId.includes('youtu.be/')) {
      const match = youtubeId.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) youtubeId = match[1];
    }

    const isPlaylist = youtubeId.startsWith('PL');

    const customTrack: Track = {
      id: `custom-${Date.now()}`,
      youtubeId,
      title: isPlaylist ? 'Custom YouTube Playlist' : 'Imported YouTube Track',
      artist: 'User Imported Stream',
      movieOrAlbum: 'YouTube Live Stream',
      year: new Date().getFullYear(),
      categoryId: selectedCategoryId,
      durationSeconds: 300,
      durationFormatted: isPlaylist ? 'PLAYLIST' : '05:00',
      nostalgicNote: `Pasted YouTube ${isPlaylist ? 'playlist' : 'video'} stream (${youtubeId})`,
      bitrate: '320 kbps HQ'
    };

    onSelectTrack(customTrack);
    setCustomUrl('');
  };

  const filteredTracks = tracks.filter(t => {
    const matchesCategory = t.categoryId === selectedCategoryId;
    const query = searchTerm.toLowerCase().trim();
    if (!query) return matchesCategory;
    const matchesQuery = 
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      t.movieOrAlbum.toLowerCase().includes(query) ||
      t.nostalgicNote.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const handleTrackClick = (track: Track) => {
    if (soundFxEnabled) {
      playCassetteDeckClick();
    }
    if (currentTrack?.id === track.id) {
      onTogglePlay();
    } else {
      onSelectTrack(track);
    }
  };

  return (
    <div className="w-full bg-black/60 border border-white/10 rounded-lg p-4 sm:p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md">
      {/* Category Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-digital text-amber-400 uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
              {currentCategory.hindiName || 'प्लेलिस्ट'}
            </span>
            <span className="text-xs font-digital text-white/50">
              {filteredTracks.length} tracks available
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-sans font-bold italic tracking-tight text-cyan-400 mt-1 neon-text">
            {currentCategory.name}
          </h2>
          <p className="text-xs text-white/60 font-sans mt-0.5">
            {currentCategory.description}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px] sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search song, artist, movie..."
            className="w-full bg-black/80 border border-white/10 focus:border-cyan-400 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 font-sans focus:outline-none transition shadow-inner"
          />
        </div>
      </div>

      {/* Quick YouTube Link / Playlist Input */}
      <form onSubmit={handleImportYoutubeUrl} className="flex items-center gap-2 bg-zinc-950/80 border border-cyan-500/30 p-2 rounded-md">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <input
          type="text"
          value={customUrl}
          onChange={e => setCustomUrl(e.target.value)}
          placeholder="Paste YouTube Video or Playlist URL (e.g. https://www.youtube.com/playlist?list=...)"
          className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none font-sans"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-bold text-xs rounded transition cursor-pointer shrink-0 shadow-[0_0_10px_#06b6d4]"
        >
          Play URL
        </button>
      </form>

      {/* Song List Items */}
      <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
        {filteredTracks.length === 0 ? (
          <div className="text-center py-10 text-white/40 font-sans text-xs">
            No tracks found matching "{searchTerm}". Try another search term!
          </div>
        ) : (
          filteredTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const isAddedToCd = cdTrackIds.includes(track.id);

            return (
              <div
                key={track.id}
                onClick={() => handleTrackClick(track)}
                className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-md border transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'bg-white/10 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-zinc-950/60 border-white/5 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                {/* Left Side: Track Number, Title, Artist, Nostalgic Note */}
                <div className="flex items-start sm:items-center gap-3">
                  {/* Track Number / Equalizer Playing Animation */}
                  <div className="w-8 h-8 rounded bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-cyan-500/50 transition">
                    {isCurrent && isPlaying ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-cyan-400 rounded-full eq-bar-anim" style={{ animationDelay: '0s' }} />
                        <span className="w-1 bg-cyan-400 rounded-full eq-bar-anim" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1 bg-cyan-400 rounded-full eq-bar-anim" style={{ animationDelay: '0.4s' }} />
                      </div>
                    ) : isCurrent ? (
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <span className="font-digital text-sm text-white/40 group-hover:text-cyan-400">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-sans font-bold text-sm ${isCurrent ? 'text-cyan-300' : 'text-white/90 group-hover:text-cyan-200'}`}>
                        {track.title}
                      </h3>
                      {track.year && (
                        <span className="text-[10px] font-digital px-1.5 py-0.2 rounded bg-zinc-900 text-white/50 border border-white/10">
                          {track.year}
                        </span>
                      )}
                      {track.bitrate && (
                        <span className="text-[10px] font-digital px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                          {track.bitrate}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white/60 font-sans mt-0.5">
                      <span className="text-white/80 font-medium">{track.artist}</span>
                      <span className="mx-1 text-white/30">•</span>
                      <span className="text-white/50 italic">{track.movieOrAlbum}</span>
                    </p>

                    {/* Nostalgic Memory Note */}
                    <p className="text-[11px] text-amber-300/80 font-sans mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{track.nostalgicNote}</span>
                    </p>
                  </div>
                </div>

                {/* Right Side: Duration & Burn CD Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  <span className="font-digital text-base text-white/50 group-hover:text-white/80">
                    {track.durationFormatted}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Add to Nero CD Burner */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (soundFxEnabled) playButtonBeep();
                        onAddToCd(track);
                      }}
                      className={`p-1.5 rounded text-xs font-sans flex items-center gap-1 border transition cursor-pointer ${
                        isAddedToCd
                          ? 'bg-orange-950 text-orange-300 border-orange-500'
                          : 'bg-zinc-900 text-white/50 border-white/10 hover:text-orange-300 hover:border-orange-500/50'
                      }`}
                      title={isAddedToCd ? 'Added to CD Burner' : 'Add to Nero CD Burner Mix'}
                    >
                      {isAddedToCd ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                      <span className="hidden md:inline text-[10px]">CD Mix</span>
                    </button>

                    {/* Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackClick(track);
                      }}
                      className={`p-2 rounded-full border transition cursor-pointer shadow-md ${
                        isCurrent && isPlaying
                          ? 'bg-cyan-500 text-black border-cyan-300'
                          : 'bg-zinc-800 text-cyan-400 border-white/10 hover:bg-cyan-500 hover:text-black'
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
