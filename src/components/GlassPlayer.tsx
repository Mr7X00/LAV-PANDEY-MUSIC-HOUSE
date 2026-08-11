import React, { useEffect, useRef, useState } from 'react';
import { Track } from '../types';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Radio, Disc, Sparkles } from 'lucide-react';
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
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Load YouTube IFrame API dynamically & initialize Web Audio fallback synth
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // Initialize Web Audio Synth for fallback retro beats
  const startSynthBeat = () => {
    stopSynthBeat();
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      let step = 0;
      const notes = [220, 261.63, 293.66, 329.63, 392.00, 440, 523.25, 587.33];

      synthIntervalRef.current = setInterval(() => {
        if (!isPlaying) return;
        try {
          // Synth Bass / Melody line
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          const freq = notes[(step * 3 + (currentTrack ? currentTrack.id.charCodeAt(0) : 0)) % notes.length];
          osc.type = step % 4 === 0 ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const vol = (isMuted ? 0 : volume / 100) * 0.15;
          gain.gain.setValueAtTime(vol, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.25);

          step = (step + 1) % 16;
        } catch {
          // ignore synth tick error
        }
      }, 250);
    } catch {
      // AudioContext not supported or restricted
    }
  };

  const stopSynthBeat = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
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
      stopSynthBeat();
    };
  }, []);

  const initPlayer = () => {
    if (playerRef.current) return;
    try {
      const initialId = currentTrack ? currentTrack.youtubeId : 'pb8T_1m9B-8';
      const isPlaylist = initialId.startsWith('PL');

      const config: any = {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            try {
              event.target.setVolume(volume);
              event.target.unMute();
            } catch {
              // ignore
            }
            if (isPlaying) {
              try {
                if (isPlaylist && typeof event.target.loadPlaylist === 'function') {
                  event.target.loadPlaylist({ listType: 'playlist', list: initialId });
                } else {
                  event.target.playVideo();
                }
              } catch {
                startSynthBeat();
              }
            }
          },
          onError: () => {
            // If YouTube video embed is restricted (e.g. error 150/101), start synthesized retro audio beat
            startSynthBeat();
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
            if (event.data === 1) {
              setIsPlaying(true);
              stopSynthBeat();
              startTicker();
            } else if (event.data === 2) {
              setIsPlaying(false);
              stopTicker();
              stopSynthBeat();
            } else if (event.data === 0) {
              setIsPlaying(false);
              stopTicker();
              stopSynthBeat();
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

      if (!isPlaylist) {
        config.videoId = initialId;
      }

      playerRef.current = new window.YT.Player('youtube-player-element', config);
    } catch {
      startSynthBeat();
    }
  };

  // Sync YouTube player when currentTrack changes
  useEffect(() => {
    if (!currentTrack) return;
    if (playerRef.current) {
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
      } catch {
        startSynthBeat();
      }
    } else {
      if (isPlaying) startSynthBeat();
    }
  }, [currentTrack]);

  // Sync Play / Pause state with YouTube player & synth fallback
  useEffect(() => {
    if (isPlaying) {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.unMute();
          playerRef.current.setVolume(isMuted ? 0 : volume);
          playerRef.current.playVideo();
        } catch {
          startSynthBeat();
        }
      } else {
        startSynthBeat();
      }
      startTicker();
    } else {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try {
          playerRef.current.pauseVideo();
        } catch {
          // ignore
        }
      }
      stopSynthBeat();
      stopTicker();
    }
  }, [isPlaying]);

  // Sync Volume
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      playerRef.current.setVolume(isMuted ? 0 : volume);
    } catch {
      // Fallback
    }
  }, [volume, isMuted]);

  const startTicker = () => {
    stopTicker();
    timerRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
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
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(targetSeconds, true);
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

    if (playerRef.current) {
      try {
        if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
          playerRef.current.setVolume(isMuted ? 0 : volume);
        }
        if (!isPlaying && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      } catch {
        // ignore
      }
    }

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    onTogglePlay();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass px-4 sm:px-8 py-2.5 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Track Title, Artwork & Retro Mini CRT Video Display */}
        <div className="flex items-center gap-3 w-full md:w-1/3">
          {/* Visible Retro Cyber Cafe Mini CRT TV Screen */}
          <div className="relative w-28 sm:w-36 h-16 sm:h-20 rounded-md bg-black border-2 border-cyan-500/50 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <div id="youtube-player-element" className="w-full h-full object-cover" />
            <div className="absolute top-1 right-1 px-1 py-0.2 bg-red-600/90 text-[8px] font-digital text-white rounded tracking-widest pointer-events-none">
              LIVE TV
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-sans font-bold text-sm text-cyan-300 truncate">
              {currentTrack ? currentTrack.title : 'Select a Song to Play'}
            </h4>
            <p className="text-xs text-white/50 font-sans truncate">
              {currentTrack ? `${currentTrack.artist} • ${currentTrack.movieOrAlbum}` : 'Lav Pandey Music House'}
            </p>
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
