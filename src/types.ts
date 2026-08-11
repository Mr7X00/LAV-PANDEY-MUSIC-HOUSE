export type CategoryId = 
  | 'punjabi-rap' 
  | 'hip-hop' 
  | 'honey-singh' 
  | 'old-songs' 
  | 'hindi-2000s' 
  | 'bhajan-spiritual';

export interface Track {
  id: string;
  youtubeId: string;
  audioUrl?: string;
  title: string;
  artist: string;
  movieOrAlbum: string;
  year: number;
  categoryId: CategoryId;
  durationSeconds: number;
  durationFormatted: string;
  nostalgicNote: string;
  bitrate?: string; // e.g. "128 kbps MP3"
  playsCount?: number;
}

export interface Category {
  id: CategoryId;
  name: string;
  hindiName?: string;
  iconName: string;
  description: string;
  color: string;
  accentColor: string;
}

export type EqualizerPreset = 'flat' | 'bass-boost' | 'techno' | 'rock' | 'vocal';

export interface ChatMessage {
  id: string;
  user: string;
  status: string;
  text: string;
  time: string;
  avatarColor: string;
}
