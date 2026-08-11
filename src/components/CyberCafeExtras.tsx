import React, { useState } from 'react';
import { Track } from '../types';
import { Disc, X, Trash2, Download, MessageSquare, Send, Zap, Keyboard, CheckCircle2 } from 'lucide-react';
import { playButtonBeep, playCassetteDeckClick, playRadioStatic } from '../utils/soundEffects';

interface NeroCdBurnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cdTracks: Track[];
  onRemoveTrack: (trackId: string) => void;
  onClearCd: () => void;
  soundFxEnabled: boolean;
}

export const NeroCdBurnerModal: React.FC<NeroCdBurnerModalProps> = ({
  isOpen,
  onClose,
  cdTracks,
  onRemoveTrack,
  onClearCd,
  soundFxEnabled
}) => {
  const [isBurning, setIsBurning] = useState(false);
  const [burnProgress, setBurnProgress] = useState(0);
  const [burnComplete, setBurnComplete] = useState(false);

  if (!isOpen) return null;

  const totalDurationSeconds = cdTracks.reduce((acc, t) => acc + t.durationSeconds, 0);
  const totalMinutes = Math.ceil(totalDurationSeconds / 60);
  const maxMinutes = 80; // Standard 700MB CD-R holds 80 mins
  const fillPercent = Math.min(100, (totalMinutes / maxMinutes) * 100);

  const handleStartBurn = () => {
    if (cdTracks.length === 0) return;
    if (soundFxEnabled) playCassetteDeckClick();
    setIsBurning(true);
    setBurnProgress(0);
    setBurnComplete(false);

    let curr = 0;
    const interval = setInterval(() => {
      curr += 5;
      setBurnProgress(curr);
      if (curr >= 100) {
        clearInterval(interval);
        setIsBurning(false);
        setBurnComplete(true);
        if (soundFxEnabled) playRadioStatic();
      }
    }, 150);
  };

  const handleExportTracklist = () => {
    if (soundFxEnabled) playButtonBeep();
    const tracklistText = `LAV PANDEY MUSIC HOUSE - CUSTOM AUDIO CD MIX\n` +
      `--------------------------------------------------\n` +
      cdTracks.map((t, i) => `${i + 1}. ${t.title} - ${t.artist} (${t.durationFormatted})`).join('\n') +
      `\n--------------------------------------------------\nTotal Duration: ${totalMinutes} Mins / 80 Mins\nEnjoy your 2000s Nostalgia Mix!`;
    
    navigator.clipboard.writeText(tracklistText);
    alert('Audio CD Tracklist copied to clipboard! You can paste it in your notes or share with friends.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-zinc-900 border-2 border-red-500/60 rounded-xl shadow-2xl overflow-hidden text-zinc-200">
        {/* Modal Window Title Bar (Nero Express Style) */}
        <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-red-950 px-4 py-2.5 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2 font-cyber text-sm font-bold text-red-400">
            <Disc className="w-4 h-4 animate-spin text-orange-400" />
            <span>NERO EXPRESS 6.0 • AUDIO CD CREATOR</span>
          </div>
          <button
            onClick={() => {
              if (soundFxEnabled) playButtonBeep();
              onClose();
            }}
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-zinc-400 font-sans">
            Add tracks from any playlist to create your custom 700 MB Audio CD mix for Walkman or Car CD Players!
          </p>

          {/* Disc Capacity Bar */}
          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
            <div className="flex justify-between text-xs font-cyber text-zinc-300 mb-1.5">
              <span>Disc Capacity Used: {totalMinutes} Min / 80 Min</span>
              <span className="text-orange-400 font-digital text-sm">{fillPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-zinc-900 rounded-full border border-zinc-700 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  fillPercent > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-orange-500 to-red-500'
                }`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          {/* Queued Tracks List */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 max-h-52 overflow-y-auto space-y-2">
            {cdTracks.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs font-sans">
                Your CD Burn Queue is empty. Click "+ CD Mix" on any song to add it here!
              </div>
            ) : (
              cdTracks.map((t, idx) => (
                <div key={t.id + idx} className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-digital text-zinc-500">{String(idx + 1).padStart(2, '0')}.</span>
                    <span className="font-sans font-medium text-zinc-200 truncate">{t.title}</span>
                    <span className="text-zinc-500 text-[11px] truncate">({t.artist})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-digital text-zinc-400">{t.durationFormatted}</span>
                    <button
                      onClick={() => {
                        if (soundFxEnabled) playButtonBeep();
                        onRemoveTrack(t.id);
                      }}
                      className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Burning Progress Animation */}
          {isBurning && (
            <div className="bg-zinc-950 border border-orange-500/40 p-3 rounded-lg text-center space-y-2">
              <p className="text-xs font-cyber text-orange-300 animate-pulse">
                BURNING AUDIO CD... DO NOT EJECT DRIVE! ({burnProgress}%)
              </p>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-150" style={{ width: `${burnProgress}%` }} />
              </div>
            </div>
          )}

          {/* Burn Complete Success Alert */}
          {burnComplete && (
            <div className="bg-emerald-950/80 border border-emerald-500/60 p-3 rounded-lg flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Success! Your 2000s Audio CD has been burned! Output tray open.</span>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
            <button
              onClick={() => {
                if (soundFxEnabled) playButtonBeep();
                onClearCd();
              }}
              disabled={cdTracks.length === 0}
              className="text-xs font-cyber text-zinc-400 hover:text-red-400 cursor-pointer disabled:opacity-40"
            >
              Clear Queue
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportTracklist}
                disabled={cdTracks.length === 0}
                className="px-3 py-1.5 rounded text-xs font-cyber bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Mix</span>
              </button>

              <button
                onClick={handleStartBurn}
                disabled={cdTracks.length === 0 || isBurning}
                className="px-4 py-1.5 rounded text-xs font-cyber bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold hover:from-red-500 hover:to-orange-500 transition cursor-pointer shadow-lg disabled:opacity-40"
              >
                {isBurning ? 'Burning...' : 'Burn CD Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Yahoo! Messenger Retro Chat Modal Component
interface YahooChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundFxEnabled: boolean;
}

export const YahooChatModal: React.FC<YahooChatModalProps> = ({ isOpen, onClose, soundFxEnabled }) => {
  const [messages, setMessages] = useState([
    { id: '1', user: 'CyberRider_2004', text: 'ASL PLZ? Anyone listening to Bohemia Kali Denali here?', time: '10:02 AM' },
    { id: '2', user: 'HoneySingh_Fan1', text: 'Brown Rang is the greatest song of the decade! Cyber cafe speaker blasting!', time: '10:04 AM' },
    { id: '3', user: 'RetroLover_Vibes', text: 'Bhai KK - Yaaron lagao please! School farewell memories returning...', time: '10:05 AM' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isVibrating, setIsVibrating] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    if (soundFxEnabled) playButtonBeep();
    const newMsg = {
      id: String(Date.now()),
      user: 'Lav_Guest_User',
      text: inputMsg,
      time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');
  };

  const handleBuzz = () => {
    if (soundFxEnabled) playRadioStatic();
    setIsVibrating(true);
    setTimeout(() => setIsVibrating(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-md bg-zinc-900 border-2 border-purple-500/60 rounded-xl shadow-2xl overflow-hidden text-zinc-200 transition-transform ${
        isVibrating ? 'animate-bounce' : ''
      }`}>
        {/* Title Bar */}
        <div className="bg-purple-950 px-4 py-2 border-b border-purple-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2 font-cyber text-sm font-bold text-purple-300">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>YAHOO! MESSENGER 6.0 • NOSTALGIA CHAT</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Line */}
        <div className="bg-zinc-950 px-4 py-1.5 border-b border-zinc-800 text-[11px] font-sans text-purple-300/90 flex justify-between">
          <span>Status: Available • Listening to Lav Pandey Music House</span>
          <button 
            onClick={handleBuzz}
            className="text-amber-400 hover:underline font-cyber text-[10px] cursor-pointer"
          >
            [ BUZZ! ]
          </button>
        </div>

        {/* Message Log */}
        <div className="p-4 h-64 overflow-y-auto space-y-3 font-sans text-xs bg-zinc-950">
          {messages.map(m => (
            <div key={m.id} className="p-2 rounded bg-zinc-900 border border-zinc-800">
              <div className="flex justify-between text-[10px] text-purple-400 font-cyber mb-0.5">
                <span className="font-bold">{m.user}</span>
                <span className="text-zinc-500">{m.time}</span>
              </div>
              <p className="text-zinc-200">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type nostalgia chat message..."
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={handleSend}
            className="p-2 bg-purple-600 text-white rounded hover:bg-purple-500 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Keyboard Shortcuts Guide Modal Component
interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-900 border border-cyan-500/50 rounded-xl shadow-2xl p-5 text-zinc-200 font-sans">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2 font-cyber text-sm font-bold text-cyan-300">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <span>KEYBOARD SHORTCUTS</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center p-2 rounded bg-zinc-950 border border-zinc-800">
            <span className="font-cyber text-amber-300">[ SPACEBAR ]</span>
            <span className="text-zinc-400">Play / Pause Song</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-zinc-950 border border-zinc-800">
            <span className="font-cyber text-cyan-300">[ Key C ]</span>
            <span className="text-zinc-400">Toggle CRT Scanline Effect</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-zinc-950 border border-zinc-800">
            <span className="font-cyber text-pink-300">[ Key M ]</span>
            <span className="text-zinc-400">Mute / Unmute Audio</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-zinc-950 border border-zinc-800">
            <span className="font-cyber text-emerald-300">[ Key N / P ]</span>
            <span className="text-zinc-400">Next / Previous Track</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-zinc-950 border border-zinc-800">
            <span className="font-cyber text-purple-300">[ Key S ]</span>
            <span className="text-zinc-400">Shuffle Playlist</span>
          </div>
        </div>
      </div>
    </div>
  );
};
