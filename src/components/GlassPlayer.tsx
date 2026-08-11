import React, { useEffect, useRef, useState } from 'react';
import { Track } from '../types';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Radio, Music, Tv } from 'lucide-react';
import { playButtonBeep, playCassetteDeckClick } from '../utils/soundEffects';

interface GlassPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  currentTime: number;
  duration: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  shuffleOn: boolean;
  setShuffleOn: React.Dispatch<React.SetStateAction<boolean>>;
  repeatOn: boolean;
  setRepeatOn: React.Dispatch<React.SetStateAction<boolean>>;
  soundFxEnabled: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const GlassPlayer: React.FC<GlassPlayerProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  currentTime,
  duration,
  setCurrentTime,
  setDuration,
  setIsPlaying,
  shuffleOn,
  setShuffleOn,
  repeatOn,
  setRepeatOn,
  soundFxEnabled
}) => {
  const [activeSource, setActiveSource] = useState<'youtube' | 'spotify' | 'audio'>('youtube');
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [fallbackBanner, setFallbackBanner] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<any>(null);
  const isReadyRef = useRef(false);
  const timerRef = useRef<any>(null);

  // Keep live refs to avoid stale closures in YouTube callbacks
  const isPlayingRef = useRef(isPlaying);
  const currentTrackRef = useRef(currentTrack);
  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const hasAttemptedSearchRef = useRef(false);

  // HTML5 Audio sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (activeSource === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeSource]);

  const initPlayer = () => {
    if (!containerRef.current) return;
    try {
      containerRef.current.innerHTML = '<div id="yt-player-target" style="width:100%;height:100%"></div>';

      const config: any = {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 1,
          disablekb: 0,
          fs: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          playsinline: 1
        },
        events: {
          onReady: (event: any) => {
            isReadyRef.current = true;
            playerRef.current = event.target;

            try {
              event.target.setVolume(isMutedRef.current ? 0 : volumeRef.current);
              event.target.unMute();
            } catch {
              // ignore
            }

            const current = currentTrackRef.current;
            if (current && activeSource === 'youtube') {
              if (current.youtubeId.startsWith('PL')) {
                event.target.loadPlaylist({ listType: 'playlist', list: current.youtubeId, index: 0 });
              } else {
                event.target.loadVideoById(current.youtubeId);
              }
            }

            if (isPlayingRef.current && activeSource === 'youtube') {
              try {
                event.target.playVideo();
              } catch {
                // ignore
              }
            }
          },
          onError: (event: any) => {
            console.warn('YouTube playback error code:', event.data);
            const current = currentTrackRef.current;
            if (!current) return;

            if (!hasAttemptedSearchRef.current && playerRef.current) {
              hasAttemptedSearchRef.current = true;
              
              if (current.fallbackYoutubeIds && current.fallbackYoutubeIds.length > 0) {
                const fallbackId = current.fallbackYoutubeIds[0];
                if (fallbackId.startsWith('PL') && typeof playerRef.current.loadPlaylist === 'function') {
                  playerRef.current.loadPlaylist({ listType: 'playlist', list: fallbackId, index: 0 });
                  return;
                } else if (typeof playerRef.current.loadVideoById === 'function') {
                  playerRef.current.loadVideoById(fallbackId);
                  return;
                }
              }

              const categoryPlaylists: Record<string, string> = {
                'punjabi-rap': 'PL4fGSI1pDJn6O1LS0XSdF3RyO0Sq_kbL2',
                'hip-hop': 'PL8f_T3R9_xLp4_0_0',
                'honey-singh': 'PLDIoUOhQQPlWm_njQtKkNIk5RYSGgzomm',
                'old-songs': 'PLc3S32Y2L3k5vL2c_8',
                'hindi-2000s': 'PLc3S32Y2L3k5vL2c_8',
                'bhajan-spiritual': 'PLc3S32Y2L3k5vL2c_8'
              };

              const fallbackPlaylist = categoryPlaylists[current.categoryId] || 'PLc3S32Y2L3k5vL2c_8';
              if (typeof playerRef.current.loadPlaylist === 'function') {
                playerRef.current.loadPlaylist({
                  listType: 'playlist',
                  list: fallbackPlaylist,
                  index: 0
                });
                return;
              }
            }

            // Fallback to HQ Audio stream so music never stops playing
            setFallbackBanner(`Playing HQ MP3 Stream for "${current.title}"`);
            setActiveSource('audio');
            setIsPlaying(true);
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setIsPlaying(true);
              startTicker();
            } else if (event.data === 2) {
              setIsPlaying(false);
              stopTicker();
            } else if (event.data === 0) {
              setIsPlaying(false);
              stopTicker();
              if (repeatOn) {
                playerRef.current?.seekTo(0);
                playerRef.current?.playVideo();
              } else {
                onNextTrack();
              }
            }
          }
        }
      };

      playerRef.current = new window.YT.Player('yt-player-target', config);
    } catch (e) {
      console.error('Failed to create YouTube player instance:', e);
    }
  };

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Sync YouTube player when currentTrack changes
  useEffect(() => {
    if (!currentTrack) return;
    hasAttemptedSearchRef.current = false;
    setFallbackBanner(null);

    if (activeSource === 'youtube' && isReadyRef.current && playerRef.current) {
      try {
        const isPlaylist = currentTrack.youtubeId.startsWith('PL');
        if (isPlaylist && typeof playerRef.current.loadPlaylist === 'function') {
          playerRef.current.loadPlaylist({
            listType: 'playlist',
            list: currentTrack.youtubeId,
            index: 0
          });
        } else if (typeof playerRef.current.loadVideoById === 'function') {
          playerRef.current.loadVideoById(currentTrack.youtubeId);
        }
        playerRef.current.unMute();
        playerRef.current.setVolume(isMuted ? 0 : volume);
        if (isPlaying && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      } catch (e) {
        console.error('Error loading video on player:', e);
      }
    } else if (activeSource === 'audio' && audioRef.current && currentTrack.audioUrl) {
      audioRef.current.src = currentTrack.audioUrl;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentTrack, activeSource]);

  // Sync Play / Pause state with active player source
  useEffect(() => {
    if (activeSource === 'youtube' && isReadyRef.current && playerRef.current) {
      if (isPlaying) {
        if (typeof playerRef.current.playVideo === 'function') {
          try {
            playerRef.current.unMute();
            playerRef.current.setVolume(isMuted ? 0 : volume);
            playerRef.current.playVideo();
          } catch {}
        }
        startTicker();
      } else {
        if (typeof playerRef.current.pauseVideo === 'function') {
          try {
            playerRef.current.pauseVideo();
          } catch {}
        }
        stopTicker();
      }
    } else if (activeSource === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeSource]);

  // Sync Volume
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(isMuted ? 0 : volume);
      } catch {}
    }
  }, [volume, isMuted]);

  const startTicker = () => {
    stopTicker();
    timerRef.current = setInterval(() => {
      if (activeSource === 'youtube' && playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const curr = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || currentTrack?.durationSeconds || 0;
        setCurrentTime(curr);
        if (dur > 0) setDuration(dur);
      }
    }, 500);
  };

  const stopTicker = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = clickX / rect.width;
    const targetSeconds = ratio * (duration || currentTrack?.durationSeconds || 1);

    setCurrentTime(targetSeconds);
    if (activeSource === 'youtube' && playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(targetSeconds, true);
    } else if (activeSource === 'audio' && audioRef.current) {
      audioRef.current.currentTime = targetSeconds;
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTogglePlayClick = () => {
    if (soundFxEnabled) playCassetteDeckClick();

    if (activeSource === 'youtube' && playerRef.current) {
      try {
        if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
          playerRef.current.setVolume(isMuted ? 0 : volume);
        }
        if (!isPlaying && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      } catch {}
    } else if (activeSource === 'audio' && audioRef.current) {
      if (!isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }

    onTogglePlay();
  };

  // Helper for Spotify Embed Link
  const categorySpotifyPlaylists: Record<string, string> = {
    'punjabi-rap': 'playlist/37i9dQZF1DX6X3beRd2Iat',
    'hip-hop': 'playlist/37i9dQZF1DX1u5P2J5Y4y9',
    'honey-singh': 'playlist/37i9dQZF1DX8IInVq5zU12',
    'old-songs': 'playlist/37i9dQZF1DX143p2R5Y4y9',
    'hindi-2000s': 'playlist/37i9dQZF1DX4LUTLOM313A',
    'bhajan-spiritual': 'playlist/37i9dQZF1DX3I2mU7uP444'
  };

  const getSpotifyEmbedUrl = () => {
    const defaultPlaylist = categorySpotifyPlaylists[currentTrack?.categoryId || 'old-songs'] || 'playlist/37i9dQZF1DX143p2R5Y4y9';
    let target = currentTrack?.spotifyId || defaultPlaylist;
    
    // Fallback if fake or invalid ID is present
    if (target.includes('g3y3a45b6c7') || !target) {
      target = defaultPlaylist;
    }

    if (!target.includes('/')) {
      target = target.startsWith('37i9d') ? `playlist/${target}` : `track/${target}`;
    }

    return `https://open.spotify.com/embed/${target}?utm_source=generator&theme=0`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass px-4 sm:px-8 py-2.5 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      {/* HTML5 Audio Element for Direct Audio Mode */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl}
        onTimeUpdate={() => {
          if (audioRef.current && activeSource === 'audio') {
            setCurrentTime(audioRef.current.currentTime);
            if (audioRef.current.duration) setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          if (repeatOn && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else {
            onNextTrack();
          }
        }}
      />

      {/* Auto Fallback Alert Banner if YouTube blocked */}
      {fallbackBanner && (
        <div className="max-w-7xl mx-auto mb-2 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded text-amber-300 text-xs font-sans flex items-center justify-between">
          <span>⚠️ {fallbackBanner}</span>
          <button onClick={() => setFallbackBanner(null)} className="text-amber-200 hover:text-white text-xs font-bold px-1 cursor-pointer">✕</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Track Title, Artwork & Source Switcher Display */}
        <div className="flex items-center gap-3 w-full md:w-1/3">
          {/* Audio Source Engine Display Screen */}
          <div className="relative w-32 sm:w-40 h-16 sm:h-20 rounded-md bg-black border-2 border-cyan-500/50 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            {/* Always keep YouTube container in DOM so API doesn't crash on unmount */}
            <div
              ref={containerRef}
              className={`w-full h-full object-cover ${activeSource === 'youtube' ? 'block' : 'hidden'}`}
            />
            {activeSource === 'youtube' && (
              <div className="absolute top-1 right-1 px-1 py-0.2 bg-red-600/90 text-[8px] font-digital text-white rounded tracking-widest pointer-events-none">
                LIVE TV
              </div>
            )}

            {activeSource === 'spotify' && (
              <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-0.5 relative">
                <iframe
                  src={getSpotifyEmbedUrl()}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded w-full h-full"
                  title="Spotify Player Widget"
                />
              </div>
            )}

            {activeSource === 'audio' && (
              <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-2 text-center">
                <Radio className="w-6 h-6 text-emerald-400 animate-pulse mb-1" />
                <span className="text-[9px] font-digital text-emerald-300 tracking-wider">
                  HQ AUDIO STREAM
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-sans font-bold text-sm text-cyan-300 truncate">
              {currentTrack ? currentTrack.title : 'Select a Song to Play'}
            </h4>
            <p className="text-xs text-white/50 font-sans truncate">
              {currentTrack ? `${currentTrack.artist} • ${currentTrack.movieOrAlbum}` : 'Lav Pandey Music House'}
            </p>

            {/* Source Switcher Toggle Buttons */}
            <div className="flex items-center gap-1 mt-1.5">
              <button
                onClick={() => {
                  if (soundFxEnabled) playButtonBeep();
                  setActiveSource('youtube');
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-digital transition flex items-center gap-1 cursor-pointer ${
                  activeSource === 'youtube'
                    ? 'bg-red-900/80 text-red-300 border border-red-500/50'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                }`}
                title="YouTube TV Video Stream"
              >
                <Tv className="w-3 h-3" /> YouTube
              </button>

              <button
                onClick={() => {
                  if (soundFxEnabled) playButtonBeep();
                  setActiveSource('spotify');
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-digital transition flex items-center gap-1 cursor-pointer ${
                  activeSource === 'spotify'
                    ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/50'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                }`}
                title="Spotify Embed Official Audio Player"
              >
                <Music className="w-3 h-3 text-emerald-400" /> Spotify
              </button>

              <button
                onClick={() => {
                  if (soundFxEnabled) playButtonBeep();
                  setActiveSource('audio');
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-digital transition flex items-center gap-1 cursor-pointer ${
                  activeSource === 'audio'
                    ? 'bg-cyan-900/80 text-cyan-300 border border-cyan-500/50'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                }`}
                title="Direct HQ Audio MP3 Stream"
              >
                <Radio className="w-3 h-3" /> HQ MP3
              </button>
            </div>
          </div>
        </div>

        {/* Center Player Controls & Progress Slider */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-1/2">
          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Shuffle */}
            <button
              onClick={() => {
                if (soundFxEnabled) playButtonBeep();
                setShuffleOn(prev => !prev);
              }}
              className={`p-1.5 rounded transition cursor-pointer ${
                shuffleOn ? 'text-cyan-400 bg-cyan-950/80 border border-cyan-500/40' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Shuffle Playlist"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Prev Track */}
            <button
              onClick={() => {
                if (soundFxEnabled) playCassetteDeckClick();
                onPrevTrack();
              }}
              className="p-1.5 text-zinc-300 hover:text-cyan-300 transition cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Main Play / Pause */}
            <button
              onClick={handleTogglePlayClick}
              className="p-2.5 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition cursor-pointer shadow-[0_0_15px_#06b6d4] active:scale-95"
              title="Play / Pause (Spacebar)"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Next Track */}
            <button
              onClick={() => {
                if (soundFxEnabled) playCassetteDeckClick();
                onNextTrack();
              }}
              className="p-1.5 text-zinc-300 hover:text-cyan-300 transition cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={() => {
                if (soundFxEnabled) playButtonBeep();
                setRepeatOn(prev => !prev);
              }}
              className={`p-1.5 rounded transition cursor-pointer ${
                repeatOn ? 'text-cyan-400 bg-cyan-950/80 border border-cyan-500/40' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Repeat Current Song"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar & Time Stamps */}
          <div className="w-full flex items-center gap-2">
            <span className="font-digital text-xs text-cyan-400 min-w-[36px] text-right">
              {formatTime(currentTime)}
            </span>

            <div 
              onClick={handleSeekClick}
              className="flex-1 h-2 bg-zinc-800 rounded-full border border-zinc-700 relative cursor-pointer group overflow-hidden"
            >
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full relative transition-all"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
              </div>
            </div>

            <span className="font-digital text-xs text-zinc-400 min-w-[36px]">
              {formatTime(duration || currentTrack?.durationSeconds || 0)}
            </span>
          </div>
        </div>

        {/* Right Volume & Keyboard Shortcuts Hint */}
        <div className="hidden md:flex items-center justify-end gap-4 w-full md:w-1/4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (soundFxEnabled) playButtonBeep();
                setIsMuted(prev => !prev);
              }}
              className="text-zinc-400 hover:text-cyan-300 cursor-pointer"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={e => {
                setVolume(Number(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-20 accent-cyan-400 h-1.5 rounded-lg bg-zinc-800 cursor-pointer"
            />
          </div>

          <span className="text-[10px] font-digital text-amber-400/90 border border-amber-500/30 px-2 py-0.5 rounded bg-amber-950/40">
            [Space] Play/Pause
          </span>
        </div>
      </div>
    </div>
  );
};
